import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z, { coerce } from 'zod';
import { db } from '../../db/index.js'
import { users, tasks } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const deleteUser: FastifyPluginAsyncZod = async (app) =>{
    app.delete('/users/:id', {
        schema: {
            tags: ['Usuários'],
            summary: 'Endpoint para deletar um usuário',

            params: z.object({
                id: coerce.number()
            }),
            response: {
                200: z.object({ message: z.string()} ),
                404: z.object({ error: z.string()} )
            }
        }
    }, async (req, reply) => {

        const { id } = req.params 

        await db.delete(tasks).where(eq(tasks.userId, id))

        const deleteUser =  await db.delete(users)
        .where(eq(users.id, id))
        .returning()

        if(deleteUser.length >  0) {
            return reply.status(200).send({ message: 'Usuario deletado com sucesso.'})
        } else {
            return reply.status(404).send({ error: 'Ops, usuario não encontrado.'})
        }
    })
}