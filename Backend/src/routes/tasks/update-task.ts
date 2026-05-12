import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../db/index.js';
import z from 'zod';
import { tasks } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const updateTask: FastifyPluginAsyncZod = async (app) => {
    app.patch('/tasks/:id', {
        schema: {
            params: z.object({
                id: z.coerce.number().int()
            }),
            body: z.object({
                title: z.string().min(4, 'Titulo deve ter no minimo 4 caracteres.'),
                description: z.string(),
                priority: z.string(),
                category: z.string(),
                date: z.string(),
                time: z.string(),
                completed: z.boolean(),
                userId: z.coerce.number(),
            }),
            response: {
                200: z.object({ message: z.string()} ),
                404: z.object({ error: z.string() })
            }
        }
    }, async (req, reply) => {
        const  {id}  = req.params
        const body = req.body

        const task = await db
        .update(tasks)
        .set(body)
        .where(eq(tasks.id , id))
        .returning()

        if(!task.length) {
            return reply.status(404).send({ error: 'Ops, tarefa não encontrada.'})
        }
        return reply.status(200).send({ message: 'Tarefa atualizada com sucesso.'})

    })

}