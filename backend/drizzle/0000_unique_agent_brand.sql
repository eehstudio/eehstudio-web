CREATE TABLE `cms_entries` (
	`key` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`version` integer DEFAULT 0 NOT NULL,
	`published_version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE TABLE `cms_media` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_key` text NOT NULL,
	`version` integer NOT NULL,
	`content_json` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
