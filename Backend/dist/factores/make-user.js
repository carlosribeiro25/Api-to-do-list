import { fakerPT_BR as faker } from '@faker-js/faker';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hash } from 'argon2';
export async function makeUser() {
    const passwordHash = await hash('senha1234');
    const result = await db.insert(users).values({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        role: 'user'
    }).returning({ id: users.id });
    return { userId: result[0].id };
}
