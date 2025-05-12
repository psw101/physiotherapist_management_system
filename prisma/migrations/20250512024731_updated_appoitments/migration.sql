/*
  Warnings:

  - You are about to drop the column `date` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `appointments` table. All the data in the column will be lost.
  - You are about to alter the column `appointmentNumber` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `appointments` DROP COLUMN `date`,
    DROP COLUMN `time`,
    ADD COLUMN `appointmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `appointmentNumber` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NULL;
