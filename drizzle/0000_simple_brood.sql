CREATE TYPE "public"."workout_type" AS ENUM('A', 'B', 'C', 'D', 'E', 'OTHER');--> statement-breakpoint
CREATE TABLE "daily_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 1),
	"steps" integer,
	"kcal" integer,
	"protein_g" integer,
	"waist_cm" numeric(5, 1),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_panels" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"panel_id" integer NOT NULL,
	"marker" text NOT NULL,
	"value" numeric(12, 4) NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seca_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 1),
	"fat_pct" numeric(4, 1),
	"visceral_fat_l" numeric(4, 1),
	"smm_kg" numeric(5, 1),
	"waist_cm" numeric(5, 1),
	"phase_angle" numeric(4, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleep_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"bed_time" text,
	"wake_time" text,
	"duration_min" integer NOT NULL,
	"quality" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplement_defs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"timing_label" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplement_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"supplement_def_id" integer NOT NULL,
	"taken" boolean DEFAULT false NOT NULL,
	CONSTRAINT "supplement_logs_date_def_key" UNIQUE("date","supplement_def_id")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"type" "workout_type" NOT NULL,
	"duration_min" integer NOT NULL,
	"rpe" integer,
	"rounds" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_panel_id_lab_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."lab_panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplement_logs" ADD CONSTRAINT "supplement_logs_supplement_def_id_supplement_defs_id_fk" FOREIGN KEY ("supplement_def_id") REFERENCES "public"."supplement_defs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_metrics_date_key" ON "daily_metrics" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "seca_measurements_date_key" ON "seca_measurements" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "sleep_logs_date_key" ON "sleep_logs" USING btree ("date");