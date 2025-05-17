-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `slotId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AppointmentSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `bookedCount` INTEGER NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `physiotherapistId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AppointmentSlot_date_idx`(`date`),
    UNIQUE INDEX `AppointmentSlot_date_startTime_physiotherapistId_key`(`date`, `startTime`, `physiotherapistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AppointmentSlot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppointmentSlot` ADD CONSTRAINT `AppointmentSlot_physiotherapistId_fkey` FOREIGN KEY (`physiotherapistId`) REFERENCES `Physiotherapist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
