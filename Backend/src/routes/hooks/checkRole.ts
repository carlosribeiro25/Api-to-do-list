import type { FastifyRequest, FastifyReply } from "fastify";
import { reqAuthUser } from "../../utils/autenticateUser.js";

type JWTpayload = {
    sub: string
    role: 'admin' | 'user'
}

export function checkUseRole(role: 'admin' | 'user') {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const user = reqAuthUser(request)
        if (user.role !== role) {
            reply.status(401).send()
        }
    }
}

