import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js';

export const createUser: FastifyPluginAsyncZod = async (app) =>{
    app.post('/users', {
        schema: {
            body: z.object({
                name: z.string().min(4, 'Minimo 4 caracteres'),
                email: z.email(),
                password: z.string()
            })
        }
    }, async (req, reply) => {

        const { name, email, password } = req.body 

        try {
        const result =  await db.insert(users)
        .values({ name, email, password})
        .returning({id: users.id})

        return reply.status(201).send({ message: 'Usuario criado com sucesso.', id: result[0].id})

        } catch (error) {

        reply.status(400).send({ error: 'Erro ao cadastrar usuario'})

        }
    })
}