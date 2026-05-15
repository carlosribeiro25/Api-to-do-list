import z from 'zod';
import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';
export const getTaskById = async (app) => {
    app.get('/tasks/:id', {
        preHandler: [
            checkRequestJwt
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Endpoint para selecionar um tarefa por ID',
            params: z.object({
                id: z.coerce.number().int()
            }),
            response: {
                200: z.object({
                    id: z.number(),
                    title: z.string(),
                    description: z.string().nullable(),
                    priority: z.string().nullable(),
                    category: z.string().nullable(),
                    date: z.string().nullable(),
                    time: z.string().nullable(),
                    status: z.string().nullable(),
                    createdAt: z.date(),
                    userId: z.number()
                }),
                404: z.object({ error: z.string() })
            }
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const [taskId] = await db.select()
            .from(tasks)
            .where(eq(tasks.id, id));
        if (!taskId) {
            return reply.status(404).send({ error: 'Tarefa nao encontrada' });
        }
        return taskId;
    });
};
