import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['admin', 'user'])
export const priorityEnum = pgEnum('priority', ['Alta', 'Media', 'Baixa'])
export const categoryEnum = pgEnum('category', ['Estudo', 'Saude', 'Trabalho', 'Pessoal', 'Outro'])

export const users = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const tasks = pgTable("tasks", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title").notNull(),
    description: text("description"),
    priority: priorityEnum("priority"),
    category: categoryEnum("category"),
    date: text("date"),
    time: text("time"),
    completed: boolean("completed").default(false).notNull(),
    userId: integer("userId").references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

