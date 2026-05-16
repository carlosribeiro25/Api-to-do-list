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
import { updateTask } from "./routes/tasks/update-task.js";
import { updateUser } from "./routes/users/update-user.js";
import { getTasks } from "./routes/tasks/get-tasks.js";
import { getUsers } from "./routes/users/get-user.js";
import { filterTask } from "./routes/tasks/get-filters.js";
import { routeLogin } from "./login.js";
import { updateTaskStatus } from "./routes/tasks/update-status-task.js";

export const server = fastify({
    logger: true
}).withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifyCors, {
    origin: [
        'http://localhost:5173',
        'https://dailytasks-eight.vercel.app'
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
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

server.register(routeLogin)
server.register(routeDefault);
server.register(getUsers);
server.register(getUserById);
server.register(createUser);
server.register(deleteUser);
server.register(updateUser);

server.register(getTasks);
server.register(getTaskById);
server.register(filterTask);
server.register(createTask);
server.register(deleteTask);
server.register(updateTask)
server.register(updateTaskStatus)





