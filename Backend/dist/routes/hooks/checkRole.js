import { reqAuthUser } from "../../utils/autenticateUser.js";
export function checkUseRole(role) {
    return async (request, reply) => {
        const user = reqAuthUser(request);
        if (user.role !== role) {
            reply.status(401).send();
        }
    };
}
