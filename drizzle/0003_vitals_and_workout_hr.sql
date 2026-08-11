CREATE TABLE "vitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"systolic" integer,
	"diastolic" integer,
	"resting_hr" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "avg_hr" integer;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "max_hr" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "vitals_date_key" ON "vitals" USING btree ("date");