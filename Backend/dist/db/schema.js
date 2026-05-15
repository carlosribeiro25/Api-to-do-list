import { check, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const priorityEnum = pgEnum('priority', ['alta', 'media', 'baixa']);
export const categoryEnum = pgEnum('category', ['estudo', 'saude', 'trabalho', 'pessoal', 'outro']);
export const statusEnum = pgEnum('status', ['pendente', 'concluido', 'em_andamento']);
export const users = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (t) => [
    check('users_name_min_length', sql `char_length(${t.name}) >= 4`)
]);
export const tasks = pgTable("tasks", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title").notNull(),
    description: text("description"),
    priority: priorityEnum("priority"),
    category: categoryEnum("category"),
    date: text("date"),
    time: text("time"),
    status: statusEnum("status"),
    userId: integer("userId").references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}, (t) => [
    check('tasks_title_min_length', sql `char_length(${t.title}) >= 4`),
    check('tasks_description_min_length', sql `${t.description} IS NULL OR char_length(${t.description}) >= 4`)
]);
