/*
  Warnings:

  - You are about to drop the column ` allergens` on the `menuitem` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId_old` on the `menuitem` table. All the data in the column will be lost.
  - You are about to drop the column `defaultAddressId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `adminauditlog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Made the column `minimumOrder` on table `restaurant` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `menuitem` DROP FOREIGN KEY `MenuItem_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- AlterTable
ALTER TABLE `address` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `restaurantId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `qty` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `menuitem` DROP COLUMN ` allergens`,
    DROP COLUMN `restaurantId_old`,
    ADD COLUMN `allergens` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `category` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `receipt` ADD COLUMN `discount` INTEGER NOT NULL DEFAULT 0;

-- Ensure existing NULL minimumOrder values can be migrated safely
UPDATE `restaurant` SET `minimumOrder` = 0 WHERE `minimumOrder` IS NULL;

-- AlterTable
ALTER TABLE `restaurant` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `minimumOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `defaultAddressId`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `adminauditlog`;

-- CreateTable
CREATE TABLE `PromoCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountType` VARCHAR(191) NOT NULL DEFAULT 'percentage',
    `discountValue` INTEGER NOT NULL,
    `minOrderAmount` INTEGER NOT NULL DEFAULT 0,
    `maxUsage` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PromoCode_code_key`(`code`),
    INDEX `PromoCode_code_idx`(`code`),
    INDEX `PromoCode_isActive_idx`(`isActive`),
    INDEX `PromoCode_validUntil_idx`(`validUntil`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoCodeUsage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `promoCodeId` VARCHAR(191) NOT NULL,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PromoCodeUsage_orderId_key`(`orderId`),
    INDEX `PromoCodeUsage_userId_idx`(`userId`),
    INDEX `PromoCodeUsage_orderId_idx`(`orderId`),
    INDEX `PromoCodeUsage_promoCodeId_idx`(`promoCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NULL,
    `linkUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Banner_isActive_idx`(`isActive`),
    INDEX `Banner_priority_idx`(`priority`),
    INDEX `Banner_startDate_idx`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'ASSIGN', 'TOGGLE', 'UPLOAD') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `beforeData` JSON NULL,
    `afterData` JSON NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_adminId_idx`(`adminId`),
    INDEX `AuditLog_entityType_idx`(`entityType`),
    INDEX `AuditLog_entityId_idx`(`entityId`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Address_isDefault_idx` ON `Address`(`isDefault`);

-- CreateIndex
CREATE INDEX `CartItem_restaurantId_idx` ON `CartItem`(`restaurantId`);

-- CreateIndex
CREATE INDEX `MenuItem_isFeatured_idx` ON `MenuItem`(`isFeatured`);

-- CreateIndex
CREATE INDEX `MenuItem_name_idx` ON `MenuItem`(`name`);

-- CreateIndex
CREATE INDEX `Notification_isRead_idx` ON `Notification`(`isRead`);

-- CreateIndex
CREATE INDEX `Order_restaurantId_idx` ON `Order`(`restaurantId`);

-- CreateIndex
CREATE INDEX `Order_riderId_idx` ON `Order`(`riderId`);

-- CreateIndex
CREATE INDEX `Payment_status_idx` ON `Payment`(`status`);

-- CreateIndex
CREATE INDEX `Restaurant_name_idx` ON `Restaurant`(`name`);

-- CreateIndex
CREATE INDEX `Restaurant_rating_idx` ON `Restaurant`(`rating`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_isActive_idx` ON `User`(`isActive`);

-- CreateIndex
CREATE INDEX `User_lastLogin_idx` ON `User`(`lastLogin`);

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_riderId_fkey` FOREIGN KEY (`riderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoCodeUsage` ADD CONSTRAINT `PromoCodeUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoCodeUsage` ADD CONSTRAINT `PromoCodeUsage_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromoCodeUsage` ADD CONSTRAINT `PromoCodeUsage_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `PromoCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Banner` ADD CONSTRAINT `Banner_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `address` RENAME INDEX `Address_userId_fkey` TO `Address_userId_idx`;

-- RenameIndex
ALTER TABLE `cartitem` RENAME INDEX `CartItem_menuItemId_fkey` TO `CartItem_menuItemId_idx`;

-- RenameIndex
ALTER TABLE `cartitem` RENAME INDEX `CartItem_userId_fkey` TO `CartItem_userId_idx`;

-- RenameIndex
ALTER TABLE `menuitem` RENAME INDEX `MenuItem_category` TO `MenuItem_category_idx`;

-- RenameIndex
ALTER TABLE `menuitem` RENAME INDEX `MenuItem_isAvailable` TO `MenuItem_isAvailable_idx`;

-- RenameIndex
ALTER TABLE `menuitem` RENAME INDEX `MenuItem_restaurantId` TO `MenuItem_restaurantId_idx`;

-- RenameIndex
ALTER TABLE `notification` RENAME INDEX `Notification_userId_fkey` TO `Notification_userId_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_createdAt` TO `Order_createdAt_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_status` TO `Order_status_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_userId_fkey` TO `Order_userId_idx`;

-- RenameIndex
ALTER TABLE `orderitem` RENAME INDEX `OrderItem_orderId_fkey` TO `OrderItem_orderId_idx`;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_orderId_fkey` TO `Payment_orderId_idx`;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_userId_fkey` TO `Payment_userId_idx`;

-- RenameIndex
ALTER TABLE `restaurant` RENAME INDEX `Restaurant_isActive` TO `Restaurant_isActive_idx`;

-- RenameIndex
ALTER TABLE `restaurant` RENAME INDEX `Restaurant_isFeatured` TO `Restaurant_isFeatured_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_role` TO `User_role_idx`;
