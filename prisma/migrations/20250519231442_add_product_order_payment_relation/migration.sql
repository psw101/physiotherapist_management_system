/*
  Warnings:

  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isAdvancePayment` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    DROP COLUMN `isAdvancePayment`,
    DROP COLUMN `paymentType`,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `Payment_appointmentId_idx` ON `Payment`(`appointmentId`);

-- CreateIndex
CREATE INDEX `Payment_productOrderId_idx` ON `Payment`(`productOrderId`);

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_patientId_fkey` TO `Payment_patientId_idx`;
