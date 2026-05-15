import { fakerPT_BR as faker } from '@faker-js/faker';
import { db } from './index.js';
import { hash } from 'argon2';
import { users } from './schema.js';
async function seed() {
    const passwordHash = await hash('451236');
    const insertedUsers = await db.insert(users).values([
        { name: faker.person.fullName(), email: faker.internet.email().toLowerCase(), password: passwordHash, role: 'user' },
        { name: faker.person.fullName(), email: faker.internet.email().toLowerCase(), password: passwordHash, role: 'user' },
    ]).returning();
    console.log('Usuários inseridos:', insertedUsers);
}
seed();
