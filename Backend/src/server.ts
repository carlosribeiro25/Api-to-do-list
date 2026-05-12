import { server } from './app.js'

server.listen({ port: 3000, host: '0.0.0.0' }).then(() => {
    console.log("Http server running on http://localhost:3000")
})
