import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { eq } from 'drizzle-orm'
import { users } from './db/schema.js';
import { db } from './db/index.js';
import { verify } from 'argon2';
import jwt  from 'jsonwebtoken'

export const routeLogin: FastifyPluginAsyncZod = async (app) =>{
    app.post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'Endpoint para Login do usuario',

            body: z.object({
                email: z.email(),
                password: z.string(),
            }),
            response: {
                200: z.object({ token: z.string()}),
                400: z.object({ message: z.string()})
            }
        }
    }, async (req, reply) => {

        const { email, password } = req.body 
        const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))

        if(result.length === 0) {
            return reply.status(400).send({ message: 'Credenciais invalidas'})
        }
        
        const user = result[0]

        let getPassword: boolean
        try {
            getPassword = await verify(user.password, password)
        } catch {
            return reply.status(400).send({ message: 'Credenciais invalidas'})
        }

        if(!getPassword) {
            return reply.status(400).send({ message: 'Credenciais invalidas'})
        }

        if(!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET deve ser cetado')
        }

        const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET)

        return reply.status(200).send({ token })
    })
}