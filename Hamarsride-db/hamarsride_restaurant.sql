-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hamarsride
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `time` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fee` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `open` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `type` enum('restaurant','shop') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'restaurant',
  PRIMARY KEY (`id`),
  KEY `Restaurant_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES ('cmn1w6onh0003v40oz6ktp19p','Williams Grill Place','/uploads/williamgrills.png',4.7,'25-35 mins','N1000',1,'2026-03-22 15:08:49.613','restaurant'),('cmn1w6oo10004v40ow4swhlmv','Biggi\'s Sumptuous Shawarma and Pizza','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgp-vQ9SmbXDnbTqsg3Z_pCSpPgosMCDErIg&s',4.8,'30-40 mins','N1000',1,'2026-03-22 15:08:49.633','restaurant'),('cmn1w6oof0005v40ozrg10kzh','Item7go','/uploads/item7.png',4.6,'25-40 mins','N1000',1,'2026-03-22 15:08:49.648','restaurant'),('cmn1w6op30006v40o0qjks3cg','Hollar Lee Express Meal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.5,'25-40 mins','N1000',1,'2026-03-22 15:08:49.672','restaurant'),('cmn5ta4wc0000v4io1bdnubyu','Vibrant Food Mart','https://img.freepik.com/free-photo/fresh-vegetables-fruit-market-stall_1101-2560.jpg?semt=ais_hybrid&w=740&q=80',4.6,'20-35 mins','N1000',1,'2026-03-25 08:58:36.491','shop'),('cmn5ta4xq0001v4iogfwsqjlq','Shop With Rahma','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.6,'20-35 mins','N1000',1,'2026-03-25 08:58:36.542','shop'),('cmndokwua0000v4oscviero8n','Mide Pastries','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe9uXBgK3f5To0SyBtTjjxwGkdtiBtcflwHg&s',4.5,'20-35 mins','N1000',1,'2026-03-30 21:09:10.594','restaurant'),('cmnes514r0000v4xstoem945i','Fola Juice & Parfait','/uploads/menu/fola-parfait-brand.svg',4.9,'20-30 mins','N1000',1,'2026-03-31 15:36:34.298','restaurant'),('cmnezbccc0000v44sw1061ct2','Esy Tasties','/uploads/menu/esy-tasties-banner.svg',4.6,'20-30 mins','N1000',1,'2026-03-31 18:57:26.075','restaurant'),('cmnft6lxm0000v4dc9kw7jdf7','Delight Restaurant','/uploads/menu/delight-restaurant-banner.svg',4.5,'20-35 mins','N1000',1,'2026-04-01 08:53:33.706','restaurant'),('cmnfw7uo50000v42cf01yfbbz','Ibile Xpress (Go)','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.5,'25-35 mins','N1000',1,'2026-04-01 10:18:30.534','restaurant'),('cmnfy2xvq0000v4zkruu2rqvm','JJ Bistro','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.6,'25-40 mins','N1000',1,'2026-04-01 11:10:40.646','restaurant'),('cmnfyyk4r0000v4xgo3g6aql7','De Unique Kitchen','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.5,'20-35 mins','N1000',1,'2026-04-01 11:35:15.819','restaurant'),('cmnges3f30000v48068ltunrr','Daily Treat','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.5,'20-35 mins','N1000',1,'2026-04-01 18:58:08.079','restaurant'),('cmnxaxgt70000v4eo6indvrjv','Taste of Home Kitchen','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.7,'20-35 mins','N1000',1,'2026-04-13 14:42:25.243','restaurant'),('cmnxb18yi0000v42ctmd16y6j','CAKEBYDAVCEC KITCHEN','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.6,'20-35 mins','N1000',1,'2026-04-13 14:45:21.690','restaurant'),('cmnxbg2hy0003v4o8eiswapt7','OJ Treats','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s',4.6,'20-35 mins','N1000',1,'2026-04-13 14:56:53.158','restaurant');
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16 19:25:23
