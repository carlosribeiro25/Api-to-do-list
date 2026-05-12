import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z, { coerce } from 'zod';
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const getUserById: FastifyPluginAsyncZod = async (app) =>{
    app.get('/users/:id', {
        schema: {
            params: z.object({
                id: coerce.number()
            }),
            response: {
                200: z.object({
                    id: z.coerce.number(),
                    name: z.string(),
                    email: z.email(),
                    password: z.string()
                }),
                404: z.object({ error: z.string() })
            }
        }
    }, async (req, reply) => {

        const { id } = req.params 

        const [ getUserById ] =  await db.select()
        .from(users)
        .where(eq(users.id, id))
        

        if(!getUserById) {
            return reply.status(404).send({ error: 'Ops, usuario não encontrado.'})

        } 
            return  getUserById
        
    })
}