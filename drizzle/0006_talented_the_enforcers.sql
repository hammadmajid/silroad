DROP TABLE `user_organizations`;--> statement-breakpoint
ALTER TABLE `users` ADD `organization_id` text REFERENCES organizations(id);--> statement-breakpoint
CREATE UNIQUE INDEX `users_organization_id_unique` ON `users` (`organization_id`);