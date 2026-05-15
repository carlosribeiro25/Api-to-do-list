import { fakerPT_BR as faker } from '@faker-js/faker';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';
import jwt from 'jsonwebtoken';
import { makeUser } from './make-user.js';
export async function makeTask() {
    const { userId } = await makeUser();
    const result = await db.insert(tasks).values([
        {
            title: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            priority: faker.helpers.arrayElement(['alta', 'media', 'baixa']),
            category: faker.helpers.arrayElement(['estudo', 'saude', 'trabalho', 'pessoal', 'outro']),
            date: faker.date.future().toISOString().split('T')[0],
            time: faker.date.anytime().toLocaleTimeString().split(' ')[0],
            status: faker.helpers.arrayElement(['pendente', 'concluido', 'em_andamento']),
            userId
        }
    ]).returning({ id: tasks.id });
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET deve ser definido');
    }
    const token = jwt.sign({ sub: userId, role: 'user' }, process.env.JWT_SECRET);
    return { token, taskId: result[0].id };
}
