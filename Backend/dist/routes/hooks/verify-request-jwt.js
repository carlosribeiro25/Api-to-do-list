import jwt from "jsonwebtoken";
export async function checkRequestJwt(request, reply) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send('Nao autorizado');
    }
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET deve ser cetado');
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        request.user = payload;
    }
    catch {
        return reply.status(401).send('Nao autorizado');
    }
}
