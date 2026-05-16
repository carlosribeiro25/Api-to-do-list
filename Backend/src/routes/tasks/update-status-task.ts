import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../../db/index.js';
import z from 'zod';
import { tasks } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const updateTaskStatus: FastifyPluginAsyncZod = async (app) => {
    app.patch('/tasks/:id/status', {
        preHandler: [checkRequestJwt],
        schema: {
            params: z.object({ id: z.coerce.number().int() }),
            body: z.object({
                status: z.enum(['pendente', 'concluido', 'em_andamento'])
            }),
            response: {
                200: z.object({ message: z.string() }),
                404: z.object({ error: z.string() }),
                401: z.object({ error: z.string() }),
            }
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.sub;

        if (!userId) return reply.status(401).send({ error: 'Autenticacao invalida' });

        const result = await db
            .update(tasks)
            .set({ status })
            .where(and(eq(tasks.id, id), eq(tasks.userId, Number(userId))))
            .returning();

        if (!result.length){
            
            return reply.status(404).send({ error: 'Recurso nao encontrado' });
        }
            
        return reply.status(200).send({ message: 'Status atualizado com sucesso.' });
    });
};

