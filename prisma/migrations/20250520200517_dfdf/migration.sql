/*
  Warnings:

  - A unique constraint covering the columns `[productOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_appointmentId_fkey`;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `isAdvancePayment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentType` VARCHAR(191) NULL,
    ADD COLUMN `productOrderId` VARCHAR(191) NULL,
    MODIFY `appointmentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_productOrderId_key` ON `Payment`(`productOrderId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_productOrderId_fkey` FOREIGN KEY (`productOrderId`) REFERENCES `ProductOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
