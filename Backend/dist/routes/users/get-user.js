import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
export const getUsers = async (app) => {
    app.get('/users', {
        schema: {
            tags: ['Usuários'],
            summary: 'Essa rota lista todas os usuários.',
        }
    }, async (req, reply) => {
        const allUsers = await db.select().from(users);
        if (!allUsers || allUsers.length === 0) {
            return reply.status(404).send({ error: 'Recurso nao encontrado' });
        }
        else {
            return reply.status(200).send({ users: allUsers });
        }
    });
};
