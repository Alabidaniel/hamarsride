-- CreateAdminAuditLogAndEnhancedFields
-- Migration: Add audit log, restaurant enhancements, and menu item updates

-- 1. Add AdminAuditLog model for tracking admin actions
CREATE TABLE `AdminAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NULL,
    `action` VARCHAR(50) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    INDEX `adminId` (`adminId`),
    INDEX `entityType` (`entityType`),
    INDEX `entityId` (`entityId`),
    INDEX `createdAt` (`createdAt`),
    
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Add enhanced fields to Restaurant table
ALTER TABLE `Restaurant` 
ADD COLUMN `description` TEXT NULL,
ADD COLUMN `descriptionShort` VARCHAR(500) NULL,
ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `baseDeliveryFee` INT NOT NULL DEFAULT 100000,
ADD COLUMN `minimumOrder` INT NULL DEFAULT 0,
ADD COLUMN `operatingHours` JSON NULL,
ADD COLUMN `location` JSON NULL;

-- 3. Add enhanced fields to MenuItem table
ALTER TABLE `MenuItem` 
ADD COLUMN `category` VARCHAR(100) NULL,
ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `isCombo` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `discountPercentage` INT NOT NULL DEFAULT 0,
ADD COLUMN ` allergens` VARCHAR(500) NULL,
ADD COLUMN `calories` INT NULL,
ADD COLUMN `preparationTime` INT NULL,
ADD COLUMN `restaurantId_old` VARCHAR(191) NULL;

-- 4. Add new fields to User table
ALTER TABLE `User` 
ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `lastLogin` DATETIME(3) NULL,
ADD COLUMN `defaultAddressId` VARCHAR(191) NULL;

-- 5. Add new fields to Order table
ALTER TABLE `Order` 
ADD COLUMN `restaurantId` VARCHAR(191) NULL,
ADD COLUMN `estimatedDeliveryTime` INT NULL,
ADD COLUMN `actualDeliveryTime` DATETIME(3) NULL,
ADD COLUMN `riderId` VARCHAR(191) NULL,
ADD COLUMN `rating` INT NULL,
ADD COLUMN `review` TEXT NULL;

-- 6. Create indexes for better query performance
CREATE INDEX `MenuItem_restaurantId` ON `MenuItem` (`restaurantId`);
CREATE INDEX `MenuItem_category` ON `MenuItem` (`category`);
CREATE INDEX `MenuItem_isAvailable` ON `MenuItem` (`isAvailable`);
CREATE INDEX `Restaurant_type` ON `Restaurant` (`type`);
CREATE INDEX `Restaurant_isFeatured` ON `Restaurant` (`isFeatured`);
CREATE INDEX `Restaurant_isActive` ON `Restaurant` (`isActive`);
CREATE INDEX `Order_status` ON `Order` (`status`);
CREATE INDEX `Order_createdAt` ON `Order` (`createdAt`);
CREATE INDEX `User_role` ON `User` (`role`);

-- 7. Add foreign key for Order.restaurantId (if needed)
-- ALTER TABLE `Order` ADD FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE SET NULL;

-- 8. Update existing Restaurant records to set new defaults
UPDATE `Restaurant` SET `isActive` = true WHERE `isActive` IS NULL;
UPDATE `Restaurant` SET `baseDeliveryFee` = 100000 WHERE `baseDeliveryFee` IS NULL;
UPDATE `MenuItem` SET `isAvailable` = true WHERE `isAvailable` IS NULL;
UPDATE `MenuItem` SET `isFeatured` = false WHERE `isFeatured` IS NULL;
UPDATE `User` SET `isActive` = true WHERE `isActive` IS NULL;
