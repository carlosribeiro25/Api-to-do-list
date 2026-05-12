import fastify from "fastify";
import {
    validatorCompiler, 
    jsonSchemaTransform, type ZodTypeProvider,
    serializerCompiler
} from 'fastify-type-provider-zod';
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastifySwagger } from '@fastify/swagger';
import { fastifyCors } from '@fastify/cors'
import { routeDefault } from "./routes/route-default.js";
import { createUser } from "./routes/users/create-user.js";
import { createTask } from "./routes/tasks/create-task.js";

export const server = fastify({
    logger: true
}).withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"]
})

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'To do list API',
            description: 'Api para o gerenciamento de tarefas',
            version: '1.0.0'
        }
    },
    transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

server.register(routeDefault);
server.register(createUser);
server.register(createTask);





