/*
  Warnings:

  - You are about to drop the column `physiotherapistId` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `physiotherapistId`,
    DROP COLUMN `serviceId`;
