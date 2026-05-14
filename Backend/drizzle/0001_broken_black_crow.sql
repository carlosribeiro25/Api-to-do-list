ALTER TABLE "tasks" ADD CONSTRAINT "tasks_title_min_length" CHECK (char_length("tasks"."title") >= 4);--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_description_min_length" CHECK ("tasks"."description" IS NULL OR char_length("tasks"."description") >= 4);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_min_length" CHECK (char_length("users"."name") >= 4);