-- AlterTable
ALTER TABLE `product` ADD COLUMN `customOptions` JSON NULL,
    ADD COLUMN `feedback` JSON NULL;

-- CreateTable
CREATE TABLE `ProductOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalPrice` DOUBLE NOT NULL,
    `customizations` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `adminNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductOrder_userId_idx`(`userId`),
    INDEX `ProductOrder_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductOrder` ADD CONSTRAINT `ProductOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOrder` ADD CONSTRAINT `ProductOrder_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
