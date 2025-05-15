/*
  Warnings:

  - You are about to drop the column `address` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `nic` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `appointmentDate` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `address`,
    DROP COLUMN `age`,
    DROP COLUMN `contactNumber`,
    DROP COLUMN `date`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `nic`,
    DROP COLUMN `number`,
    DROP COLUMN `userId`,
    ADD COLUMN `appointmentDate` VARCHAR(191) NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `patientId` INTEGER NOT NULL,
    ADD COLUMN `paymentAmount` INTEGER NULL,
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
    ADD COLUMN `physiotherapistId` INTEGER NULL,
    ADD COLUMN `reason` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceId` INTEGER NULL,
    ADD COLUMN `startTime` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled';

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `appointmentId` INTEGER NULL,
    `amount` INTEGER NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `Payment_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
