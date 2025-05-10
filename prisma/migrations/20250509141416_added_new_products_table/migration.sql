/*
  Warnings:

  - Added the required column `description` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageURL` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specification` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoURL` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageURL` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` INTEGER NOT NULL,
    ADD COLUMN `specification` VARCHAR(191) NOT NULL,
    ADD COLUMN `videoURL` VARCHAR(191) NOT NULL;
