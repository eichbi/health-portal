CREATE TYPE "public"."document_kind" AS ENUM('PLAN', 'LAB', 'SECA', 'OTHER');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"kind" "document_kind" DEFAULT 'OTHER' NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"doc_date" date,
	"notes" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
