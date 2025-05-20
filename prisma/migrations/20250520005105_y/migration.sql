/*
  Warnings:

  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    ADD COLUMN `isAdvancePayment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentType` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
