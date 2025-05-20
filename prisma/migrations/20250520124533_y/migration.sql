-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `paymentId` VARCHAR(191) NULL,
    MODIFY `paymentStatus` VARCHAR(191) NULL;
