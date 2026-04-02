-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('pending', 'accepted', 'picked_up', 'processing', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending';
