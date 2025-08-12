ALTER TABLE `events` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);