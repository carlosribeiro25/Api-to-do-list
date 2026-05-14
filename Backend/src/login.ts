import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { eq } from 'drizzle-orm'
import { users } from '.././src/db/schema.js';
import { db } from './db/index.js';
import { verify } from 'argon2';

export const routeLogin: FastifyPluginAsyncZod = async (app) =>{
    app.post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'Endpoint para Login do usuario',

            body: z.object({
                email: z.email(),
                password: z.string(),
            })
        }
    }, async (req, reply) => {

        const { email, password } = req.body 
        const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

        if(result.length === 0) {
            return reply.status(400).send({ message: 'Credenciais invalidas'})
        }
        
        const user = result[0]

        const getPassword = await verify(user.password, password)

         if(!getPassword) {
            return reply.status(400).send({ message: 'Credenciais invalidas'})
        }

        return reply.status(200).send({ message: 'Autenticado!'})
    })
}