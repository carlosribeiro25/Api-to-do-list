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
                category: z.enum(['Estudo', 'Saude', 'Trabalho', 'Pessoal', 'Outro']).optional(),
                priority: z.enum(['Alta', 'Media', 'Baixa']).optional(),
                date: z.string().optional(),
                completed: z.string().transform(v => v === 'true').pipe(z.boolean()).optional()
            })
        }
    }, async (req, reply) => {
        const { category, priority, date, completed } = req.query

        const filters: SQL[] = []
        if (category) filters.push(eq(tasks.category, category))
        if (priority) filters.push(eq(tasks.priority, priority))
        if (date)     filters.push(eq(tasks.date, date))
        if (completed)     filters.push(eq(tasks.completed, completed))

        const resultfilter = await db
            .select()
            .from(tasks)
            .where(filters.length > 0 ? and(...filters) : undefined)

        if (!resultfilter || resultfilter.length === 0) {
            return reply.status(404).send({ message: 'Recurso nao encontrado' })
        }
        return reply.status(200).send({ tasks: resultfilter })
    })
}
