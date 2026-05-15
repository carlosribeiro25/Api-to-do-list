import type { FastifyRequest} from 'fastify'

type JWTpayload = {
    sub: string
    role: 'admin' | 'user'
}

export function reqAuthUser(request: FastifyRequest): JWTpayload {
    const user = request.user
    if(!user) {
        throw new Error('Autenticação invalida')
    }
    return user as JWTpayload
}