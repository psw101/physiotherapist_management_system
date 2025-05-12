/*
  Warnings:

  - You are about to drop the column `createdAt` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `address` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nic` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointments` DROP COLUMN `createdAt`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `nic` VARCHAR(191) NOT NULL,
    ADD COLUMN `time` VARCHAR(191) NOT NULL;
