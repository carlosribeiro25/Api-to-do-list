import type { FastifyRequest} from 'fastify'

export function reqAuthUser(request: FastifyRequest) {
    const user = request.user
    if(!user) {
        throw new Error('Autenticação invalida')
    }
}