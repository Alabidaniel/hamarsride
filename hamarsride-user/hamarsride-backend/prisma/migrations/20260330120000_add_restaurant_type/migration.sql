ALTER TABLE `Restaurant`
    ADD COLUMN `type` ENUM('restaurant', 'shop') NOT NULL DEFAULT 'restaurant';

CREATE INDEX `Restaurant_type_idx` ON `Restaurant`(`type`);

UPDATE `Restaurant`
SET `type` = 'shop'
WHERE `name` IN ('Vibrant Food Mart', 'Shop With Rahma');
