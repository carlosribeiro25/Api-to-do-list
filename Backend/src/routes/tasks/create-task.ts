import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';

export const createTask: FastifyPluginAsyncZod = async (app) =>{
    app.post('/tasks', {
        schema: {
            body: z.object({
                title: z.string().min(4, 'Minimo 4 caracteres'),
                date: z.string(),
                time: z.string(),
                completed: z.boolean(),
                userId: z.coerce.number()
            }),
            response: {
                201: z.object({ message: z.string()}),
                400: z.object({ error: z.string()})
            }
        }
    }, async (req, reply) => {

        const { title, date, time, completed, userId } = req.body 

        try {
        const result =  await db.insert(tasks)
        .values({ title, date, time, completed, userId})
        .returning({ id: tasks.id })

        return reply.status(201).send({ message: 'Tarefa criada com sucesso.'})

        } catch (error) {

        reply.status(400).send({ error: 'Erro ao cadastrar uma tarefa'})

        }
    })
}