import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../db/index.js';
import z from 'zod';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const updateUser: FastifyPluginAsyncZod = async (app) => {
    app.patch('/users/:id', {
        schema: {
            tags: ['Usuários'],
            summary: 'Endpoint para atualizar um usuário',

            params: z.object({
                id: z.coerce.number().int()
            }),
            body: z.object({
                name: z.string().optional(),
                email: z.email().optional(),
                password: z.string().optional(),
                role: z.enum(["admin", "user"]).optional(),
                createAt: z.string().optional()
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
        .update(users)
        .set(body)
        .where(eq(users.id , id))
        .returning()

        if(!task.length) {
            return reply.status(404).send({ error: 'Ops, usuario não encontrada.'})
        }
        return reply.status(200).send({ message: 'Usuario atualizada com sucesso.'})

    })

}