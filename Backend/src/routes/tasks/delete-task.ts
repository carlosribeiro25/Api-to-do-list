import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z, { coerce } from 'zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const deleteTask: FastifyPluginAsyncZod = async (app) =>{
    app.delete('/tasks/:id', {
        preHandler: [
            checkRequestJwt
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Endpoint para deletar uma tarefa',
            
            params: z.object({
                id: coerce.number()
            }),
            response: {
                200: z.object({ message: z.string()} ),
                404: z.object({ error: z.string()} ),
                401: z.object({ error: z.string()} )
            }
        }
    }, async (req, reply) => {
        const userId = req.user?.sub
        const { id } = req.params 
        
        if(!userId) {
            return reply.status(401).send({ error: 'Autenticacao invalida' })
        }

        const deleteTask =  await db
        .delete(tasks)
        .where(
            and(
                eq(tasks.id, id),
                eq(tasks.userId, Number(userId))

        ))
        .returning()

        if(deleteTask.length >  0) {
            return reply.status(200).send({ message: 'Tarefa deletada com sucesso.'})
        } else {
            return reply.status(404).send({ error: 'Recurso nao encontrado'})
        }
    })
}