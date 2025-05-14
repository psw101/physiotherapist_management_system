/*
  Warnings:

  - You are about to drop the column `imageURL` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `videoURL` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `imageURL`,
    DROP COLUMN `videoURL`,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL;
