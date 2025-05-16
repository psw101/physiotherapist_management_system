/*
  Warnings:

  - The primary key for the `appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentAmount` on the `appointment` table. All the data in the column will be lost.
  - You are about to alter the column `appointmentDate` on the `appointment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `notes` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `appointmentId` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_appointmentId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_patientId_fkey`;

-- DropIndex
DROP INDEX `Payment_patientId_fkey` ON `payment`;

-- AlterTable
ALTER TABLE `appointment` DROP PRIMARY KEY,
    DROP COLUMN `paymentAmount`,
    ADD COLUMN `fee` DOUBLE NOT NULL DEFAULT 2500,
    ADD COLUMN `physiotherapistId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    MODIFY `appointmentDate` DATETIME(3) NOT NULL,
    MODIFY `notes` VARCHAR(191) NULL,
    MODIFY `reason` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    DROP COLUMN `notes`,
    DROP COLUMN `paymentDate`,
    DROP COLUMN `reference`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `transactionId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `appointmentId` VARCHAR(191) NOT NULL,
    MODIFY `amount` DOUBLE NOT NULL,
    ALTER COLUMN `status` DROP DEFAULT,
    MODIFY `patientId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Physiotherapist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contactNumber` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `education` VARCHAR(191) NULL,
    `certifications` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `availability` JSON NULL,
    `rating` DOUBLE NULL DEFAULT 0,
    `imageUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Physiotherapist_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_physiotherapistId_fkey` FOREIGN KEY (`physiotherapistId`) REFERENCES `Physiotherapist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
