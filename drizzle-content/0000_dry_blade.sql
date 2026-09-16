CREATE TABLE "content_document" (
	"key" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"revision" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
