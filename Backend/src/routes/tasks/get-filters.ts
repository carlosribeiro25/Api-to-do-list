import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';
import { and, eq, SQL } from 'drizzle-orm'
import z from 'zod';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';

export const filterTask: FastifyPluginAsyncZod = async (app) => {
    app.get('/tasks/filter', {
        preHandler: [
            checkRequestJwt
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Filtrar tarefas por categoria, prioridade, data',
            querystring: z.object({
                category: z.enum(['estudo', 'saude', 'trabalho', 'pessoal', 'outro']).optional(),
                priority: z.enum(['alta', 'media', 'baixa']).optional(),
                date: z.string().optional(),
                status: z.enum(['pendente', 'concluido', 'em_andamento']).optional()
            })
        }
    }, async (req, reply) => {
        const userId = req.user?.sub

        if (!userId) {
            return reply.status(401).send({ error: 'Autenticacao invalida' })
        }

        const { category, priority, date, status } = req.query

        const filters: SQL[] = []
        filters.push(eq(tasks.userId, Number(userId)))
        if (category) filters.push(eq(tasks.category, category))
        if (priority) filters.push(eq(tasks.priority, priority))
        if (date)     filters.push(eq(tasks.date, date))
        if (status)   filters.push(eq(tasks.status, status))

        const resultfilter = await db
            .select()
            .from(tasks)
            .where(and(...filters))

        if (!resultfilter || resultfilter.length === 0) {
            return reply.status(404).send({ error: 'Recurso nao encontrado' })
        }
        return reply.status(200).send({ tasks: resultfilter })
    })
}
