import { boolean, integer, pgTable, text, time } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text().notNull(),
    email: text().unique().notNull(),
    password: text().notNull()
})

export const tasks = pgTable("tasks", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    date: text(),
    time: text(),
    completed: boolean().default(false).notNull(),
    userId: integer().references(() => users.id)
    .notNull()
})

