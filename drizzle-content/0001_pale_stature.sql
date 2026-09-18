CREATE TABLE "enquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"facility" text NOT NULL,
	"contact" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"equipment" text NOT NULL,
	"quantity" integer,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"client_key" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_throttle" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiry_created_at_idx" ON "enquiry" USING btree ("created_at");