/*
  Warnings:

  - You are about to drop the `productfeedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `productfeedback` DROP FOREIGN KEY `ProductFeedback_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productfeedback` DROP FOREIGN KEY `ProductFeedback_userId_fkey`;

-- DropTable
DROP TABLE `productfeedback`;
