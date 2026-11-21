CREATE TABLE `events` (
	`id` char(36) NOT NULL,
	`submission_id` char(36) NOT NULL,
	`owner` varchar(73) NOT NULL,
	`payload` text NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`age_groups` text NOT NULL,
	`capacity` int,
	`registration_deadline` date NOT NULL,
	`cancelled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_submission_id_unique` UNIQUE(`submission_id`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` char(64) NOT NULL,
	`data` text NOT NULL,
	`expires` bigint NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
