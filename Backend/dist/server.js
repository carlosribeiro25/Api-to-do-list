import { server } from './app.js';
const port = Number(process.env.PORT) || 3000;
server.listen({ port, host: '0.0.0.0' }).then(() => {
    console.log(`Http server running on port ${port}`);
});
