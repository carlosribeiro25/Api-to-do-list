import { drizzle } from 'drizzle-orm/neon-http'

if(!process.env.DATABASE_URL) {
    throw new Error("Database url precisa ser cetado")
}

export const db = drizzle(process.env.DATABASE_URL);
