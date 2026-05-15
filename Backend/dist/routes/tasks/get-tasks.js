import { db } from '../../db/index.js';
import { tasks } from '../../db/schema.js';
import z from 'zod';
import { checkRequestJwt } from '../hooks/verify-request-jwt.js';
import { reqAuthUser } from '../../utils/autenticateUser.js';
export const getTasks = async (app) => {
    app.get('/tasks', {
        preHandler: [
            checkRequestJwt
        ],
        schema: {
            tags: ['Tarefas'],
            summary: 'Essa rota lista todas as tarefas',
            response: {
                200: z.object({
                    tasks: z.array(z.object({
                        id: z.coerce.number(),
                        title: z.string(),
                        description: z.string().nullable(),
                        priority: z.string().nullable(),
                        category: z.string().nullable(),
                        date: z.string().nullable(),
                        time: z.string().nullable(),
                        status: z.string().nullable(),
                        userId: z.coerce.number(),
                        createdAt: z.date()
                    }))
                }),
                404: z.object({ error: z.string() })
            }
        },
    }, async (req, reply) => {
        const user = reqAuthUser(req);
        console.log(user);
        const allTasks = await db.select().from(tasks);
        if (!allTasks || allTasks.length === 0) {
            return reply.status(404).send({ error: 'Recurso nao encontrado' });
        }
        else {
            return reply.status(200).send({ tasks: allTasks });
        }
    });
};
