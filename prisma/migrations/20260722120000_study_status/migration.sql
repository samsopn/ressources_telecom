-- CreateTable enum StudyStatus
-- AlterTable CollectionResource: add study progress fields

ALTER TABLE `CollectionResource` ADD COLUMN `status` ENUM('TODO', 'DOING', 'DONE') NOT NULL DEFAULT 'TODO';
ALTER TABLE `CollectionResource` ADD COLUMN `completedAt` DATETIME(3) NULL;
