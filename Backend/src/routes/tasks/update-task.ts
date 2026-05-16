import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../db/index.js';
import z from 'zod';
import { tasks } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const updateTask: FastifyPluginAsyncZod = async (app) => {
    app.patch('/tasks/:id', {
        preHandler: [
            checkRequestJwt
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Endpoint para atualizar uma tarefa por ID',

            params: z.object({
                id: z.coerce.number().int()
            }),
            body: z.object({
                title: z.string().min(4, 'Titulo deve ter no minimo 4 caracteres.').optional(),
                description: z.string().optional(),
                priority: z.enum(['alta', 'media', 'baixa']).optional(),
                category: z.enum(['estudo', 'saude', 'trabalho', 'pessoal', 'outro']).optional(),
                date: z.string().optional(),
                time: z.string().optional(),
                status: z.enum(['pendente', 'concluido', 'em_andamento']).optional(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                400: z.object({ error: z.string() }),
                404: z.object({ error: z.string() }),
                401: z.object({ error: z.string() })
            }
        }
    }, async (req, reply) => {
        const { id } = req.params
        const body = req.body
        const userId = req.user?.sub

        if(!userId) {
            return reply.status(401).send({ error: 'Autenticacao invalida' })
        }

        const updates = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined)
        )

        if (Object.keys(updates).length === 0) {
            return reply.status(400).send({ error: 'Nenhum campo para atualizar' })
        }

        const task = await db
            .update(tasks)
            .set(updates)
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.userId, Number(userId))
                )
            )
            .returning()

        if (!task.length) {
            return reply.status(404).send({ error: 'Recurso nao encontrado' })
        }
        return reply.status(200).send({ message: 'Tarefa atualizada com sucesso.' })

    })

}