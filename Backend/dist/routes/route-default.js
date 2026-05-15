export const routeDefault = async (app) => {
    app.get('/', async () => {
        return 'Olá, seja bem vindo.';
    });
};
