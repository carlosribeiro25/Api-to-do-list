export function reqAuthUser(request) {
    const user = request.user;
    if (!user) {
        throw new Error('Autenticação invalida');
    }
    return user;
}
