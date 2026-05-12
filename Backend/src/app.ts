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
import { deleteUser } from "./routes/users/delete-user.js";
import { getUserById } from "./routes/users/get-user-byId.js";
import { deleteTask } from "./routes/tasks/delete-task.js";
import { getTaskById } from "./routes/tasks/get-task-byId.js";

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
server.register(deleteUser);
server.register(getUserById);

server.register(createTask);
server.register(deleteTask);
server.register(getTaskById);





