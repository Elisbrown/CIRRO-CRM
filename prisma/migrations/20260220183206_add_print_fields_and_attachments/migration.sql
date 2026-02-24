-- AlterTable
ALTER TABLE `service_requests` ADD COLUMN `color_mode` VARCHAR(191) NULL,
    ADD COLUMN `finish_type` VARCHAR(191) NULL,
    ADD COLUMN `paper_size` VARCHAR(191) NULL,
    ADD COLUMN `quantity` INTEGER NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `file_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_request_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `file_attachments_service_request_id_idx`(`service_request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `file_attachments` ADD CONSTRAINT `file_attachments_service_request_id_fkey` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
