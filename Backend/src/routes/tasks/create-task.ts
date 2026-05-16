import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const createTask: FastifyPluginAsyncZod = async (app) =>{
    app.post('/tasks', {
        preHandler: [
            checkRequestJwt,           
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Endpoint para criar uma tarefa',
            
            body: z.object({
                title: z.string().min(4, 'Minimo 4 caracteres'),
                description: z.string().optional(),
                category: z.enum(['estudo', 'saude', 'trabalho', 'pessoal', 'outro']),
                priority: z.enum(['alta', 'media', 'baixa']),
                status: z.enum(['pendente', 'concluido', 'em_andamento']),
                date: z.string(),
                time: z.string(),
            }),
            response: {
                201: z.object({ message: z.string(), taskId: z.coerce.number()}),
                400: z.object({ error: z.string()}),
                401: z.object({ error: z.string()}),
            }
        }
    }, async (req, reply) => {
        const userId = req.user?.sub

        if(!userId) {
            return reply.status(401).send({ error: 'Autenticacao invalida' })
        }

        const { title, description, category, priority, status, date, time } = req.body 

        try {
        const result =  await db.insert(tasks)
        .values({ title, description, category, priority, status, date, time, userId: Number(userId) })
        .returning({ id: tasks.id })

        return reply.status(201).send({ message: 'Tarefa criada com sucesso.', taskId: result[0].id})

        } catch (error) {

        reply.status(400).send({ error: 'Ops, erro ao cadastrar tarefa'})

        }
    })
}