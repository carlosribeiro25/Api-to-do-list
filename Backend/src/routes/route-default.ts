import { FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

export const routeDefault: FastifyPluginAsyncZod = async (app) =>{
    app.get('/', async () => {
        return 'Olá, seja bem vindo.'
    })
}