import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import { server } from '../app.js'
import z from 'zod';

export const routeDefault: FastifyPluginAsyncZod = async (app) =>{
    server.get('/', async () => {
        return 'Olá, seja bem vindo.'
    })
}