CREATE TYPE "public"."category" AS ENUM('Estudo', 'Saude', 'Trabalho', 'Pessoal', 'Outro');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('Alta', 'Media', 'Baixa');--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DATA TYPE "public"."priority" USING "priority"::"public"."priority";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "user_Id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_Id_users_id_fk" FOREIGN KEY ("user_Id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "userId";