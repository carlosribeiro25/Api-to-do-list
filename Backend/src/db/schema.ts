import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text().notNull(),
    email: text().unique().notNull(),
    password: text().notNull(),
    role: roleEnum().default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const tasks = pgTable("tasks", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().unique().notNull(),
    description: text(),
    priority: text(),
    category: text(),
    date: text(),
    time: text(),
    completed: boolean().default(false).notNull(),
    userId: integer().references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

