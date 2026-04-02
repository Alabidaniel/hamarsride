-- DropIndex
DROP INDEX `Receipt_receiptNumber_idx` ON `receipt`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `rejectionReason` TEXT NULL,
    MODIFY `status` ENUM('pending', 'accepted', 'picked_up', 'processing', 'delivered', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending';
