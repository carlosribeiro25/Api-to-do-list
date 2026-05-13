import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js';

export const getTasks: FastifyPluginAsyncZod = async (app) =>{
   app.get('/tasks',{
    schema: {
        tags: ['Tarefas'],
        summary: 'Essa rota lista todas as tarefas',
    }
   }, async (req, reply) => {

    const allTasks = await db.select().from(tasks)

    if(!allTasks || allTasks.length === 0) {
        return reply.status(404).send({ error: 'Recurso nao encontrado'})
    } else {
        return reply.status(200).send({tasks: allTasks});
    }

   })
}