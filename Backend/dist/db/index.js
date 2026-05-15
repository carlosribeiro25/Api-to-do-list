import { drizzle } from 'drizzle-orm/neon-http';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL precisa ser cetada");
}
export const db = drizzle(databaseUrl);
