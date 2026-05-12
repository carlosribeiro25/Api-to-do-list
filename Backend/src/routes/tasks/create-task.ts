import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';

export const createTask: FastifyPluginAsyncZod = async (app) =>{
    app.post('/tasks', {
        schema: {
            body: z.object({
                title: z.string().min(4, 'Minimo 4 caracteres'),
                description: z.string().min(4,'Minimo 4 caracteres'),
                category: z.string(),
                priority: z.string(),
                completed: z.boolean(),
                date: z.string(),
                time: z.string(),
                userId: z.coerce.number()
            }),
            response: {
                201: z.object({ message: z.string(), taskId: z.coerce.number()}),
                400: z.object({ error: z.string()})
            }
        }
    }, async (req, reply) => {

        const { title, description, category, priority, completed, date, time, userId } = req.body 

        try {
        const result =  await db.insert(tasks)
        .values({ title, description, category, priority, completed, date, time, userId })
        .returning({ id: tasks.id })

        return reply.status(201).send({ message: 'Tarefa criada com sucesso.', taskId: result[0].id})

        } catch (error) {

        reply.status(400).send({ error: 'Ops, erro ao cadastrar uma tarefa'})

        }
    })
}