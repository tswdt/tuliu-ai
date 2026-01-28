CREATE TABLE `generatedImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`promptCn` text NOT NULL,
	`promptEn` text,
	`imageUrl` text,
	`watermarkedUrl` text,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`tier` enum('trial','standard','hd','ultra') NOT NULL,
	`creditsUsed` int NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatedImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otpRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`otp` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('register','generate','upgrade','admin_recharge','admin_deduct') NOT NULL,
	`creditsDelta` int NOT NULL,
	`creditsAfter` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBlocked` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);