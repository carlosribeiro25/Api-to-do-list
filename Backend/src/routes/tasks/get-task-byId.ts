import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const getTaskById: FastifyPluginAsyncZod = async (app) =>{
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
                }),
                404: z.object({ error: z.string() }),
                401: z.object({ error: z.string() })
            }
        }
    }, async (req, reply) => {

        const { id } = req.params
        const userId = req.user?.sub

        if (!userId) {
            return reply.status(401).send({ error: 'Autenticacao invalida' })
        }

        const [ taskId ] =  await db.select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, Number(userId))))
        
        if(!taskId) {
            return reply.status(404).send({ error: 'Tarefa nao encontrada'})
        } 
            return  taskId;
    })
}