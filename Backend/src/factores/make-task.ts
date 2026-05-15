import { fakerPT_BR as faker} from '@faker-js/faker';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';

export async function makeTask() {
    const createTask = await db.insert(tasks).values([
        {
            title: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            priority: faker.helpers.arrayElement(['alta', 'media', 'baixa'] as const),
            category: faker.helpers.arrayElement(['estudo', 'saude', 'trabalho', 'pessoal', 'outro'] as const),
            date: faker.date.future().toISOString().split('T')[0],
            time: faker.date.anytime().toLocaleTimeString().split(' ')[0],
            status: faker.helpers.arrayElement(['pendente', 'concluido', 'em_andamento'] as const),
            userId: 1
        }
    ]).returning()

    console.log(`Tarefa inserida:`, createTask)
}

