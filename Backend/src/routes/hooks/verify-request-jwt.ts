import type { FastifyRequest, FastifyReply } from "fastify";
import jwt  from "jsonwebtoken";

type JWTpayload = {
    sub: string
    role: 'admin' | 'user'
}

export async function checkRequestJwt(request: FastifyRequest, reply: FastifyReply) {
    const authHeader  = request.headers.authorization

    if(!authHeader) {
        return reply.status(401).send('Nao autorizado')
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader

    if(!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET deve ser cetado')
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET ) as JWTpayload

        request.user = payload
    } catch {
        return reply.status(401).send('Nao autorizado')

    }
}