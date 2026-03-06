-- MySQL dump 10.13  Distrib 5.7.24, for osx10.9 (x86_64)
--
-- Host: 127.0.0.1    Database: cirronyx_crm
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('069affe7-91b5-41c9-85bc-fc4c3b5d469d','344eeeacf83541abc6b14ac5d50af720cab84787677a18f79dbf73e7e90deefb','2026-02-20 18:32:06.715','20260220183206_add_print_fields_and_attachments',NULL,NULL,'2026-02-20 18:32:06.616',1),('2d36c11e-3855-4841-9f81-441c23edab4d','4ac93d0a79fcd7e5a0337b7b127853a300a84d323a99b97c1b816243b63d104a','2026-02-20 18:10:06.565','20260220181006_init',NULL,NULL,'2026-02-20 18:10:06.058',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `activities_contact_id_idx` (`contact_id`),
  KEY `activities_staff_id_fkey` (`staff_id`),
  CONSTRAINT `activities_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `activities_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalog`
--

DROP TABLE IF EXISTS `catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `catalog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `business_unit` enum('OFFIZONE','JOYSUN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalog`
--

LOCK TABLES `catalog` WRITE;
/*!40000 ALTER TABLE `catalog` DISABLE KEYS */;
INSERT INTO `catalog` VALUES (1,'JOYSUN','Flyers (A5)',15000.00,'2026-02-20 18:10:26.373','2026-02-20 18:10:26.373'),(2,'JOYSUN','Business Cards (100pcs)',10000.00,'2026-02-20 18:10:26.377','2026-02-20 18:10:26.377'),(3,'JOYSUN','Banners (Large)',35000.00,'2026-02-20 18:10:26.378','2026-02-20 18:10:26.378'),(4,'JOYSUN','Brochures (A4 Tri-fold)',25000.00,'2026-02-20 18:10:26.380','2026-02-20 18:10:26.380'),(5,'JOYSUN','Posters (A3)',8000.00,'2026-02-20 18:10:26.382','2026-02-20 18:10:26.382'),(6,'OFFIZONE','Hot Desk (Daily)',5000.00,'2026-02-20 18:10:26.384','2026-02-20 18:10:26.384'),(7,'OFFIZONE','Dedicated Desk (Monthly)',50000.00,'2026-02-20 18:10:26.386','2026-02-20 18:10:26.386'),(8,'OFFIZONE','Private Office (Monthly)',150000.00,'2026-02-20 18:10:26.388','2026-02-20 18:10:26.388'),(9,'OFFIZONE','Meeting Room (Hourly)',10000.00,'2026-02-20 18:10:26.390','2026-02-20 18:10:26.390'),(10,'OFFIZONE','Event Space (Daily)',75000.00,'2026-02-20 18:10:26.391','2026-02-20 18:10:26.391'),(11,'JOYSUN','Test Service',20000.00,'2026-02-21 12:43:54.026','2026-02-21 12:43:54.026');
/*!40000 ALTER TABLE `catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cleaning_logs`
--

DROP TABLE IF EXISTS `cleaning_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cleaning_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `zone` enum('JOYSUN_FLOOR','OFFIZONE_MAIN','BATHROOMS','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` enum('PASS','FAIL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PASS',
  `grade` int NOT NULL DEFAULT '3',
  `deduction` decimal(12,2) NOT NULL DEFAULT '0.00',
  `inspector_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cleaning_logs_staff_id_fkey` (`staff_id`),
  CONSTRAINT `cleaning_logs_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cleaning_logs`
--

LOCK TABLES `cleaning_logs` WRITE;
/*!40000 ALTER TABLE `cleaning_logs` DISABLE KEYS */;
INSERT INTO `cleaning_logs` VALUES (1,2,'JOYSUN_FLOOR','PASS',4,0.00,'','2026-02-21 12:46:20.067');
/*!40000 ALTER TABLE `cleaning_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_attachments`
--

DROP TABLE IF EXISTS `contact_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contact_id` int NOT NULL,
  `type` enum('NOTE','FILE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOTE',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `contact_attachments_contact_id_idx` (`contact_id`),
  KEY `contact_attachments_uploaded_by_id_fkey` (`uploaded_by_id`),
  CONSTRAINT `contact_attachments_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contact_attachments_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_attachments`
--

LOCK TABLES `contact_attachments` WRITE;
/*!40000 ALTER TABLE `contact_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('LEAD','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LEAD',
  `company_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_source` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `assigned_to` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contacts_client_id_key` (`client_id`),
  KEY `contacts_email_idx` (`email`),
  KEY `contacts_phone_idx` (`phone`),
  KEY `contacts_status_idx` (`status`),
  KEY `contacts_assigned_to_fkey` (`assigned_to`),
  CONSTRAINT `contacts_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'C-0001','LEAD','SIGALIX','Sunyin','Elisbrown','+237679690703','sunyinelisbrown@gmail.com','Yaounde','Cameroon','Referral','NEW',NULL,'2026-02-20 19:34:46.482','2026-02-20 19:34:46.482',NULL),(2,'C-0002','CUSTOMER','CIRRONYX','Mbah','Johnas','657000000','jfortem@cirronyx.com','Yaounde','Cameroon','Referral','NEW',1,'2026-02-21 12:21:40.677','2026-02-21 12:21:40.677',NULL);
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_attachments`
--

DROP TABLE IF EXISTS `file_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_request_id` int NOT NULL,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `file_attachments_service_request_id_idx` (`service_request_id`),
  CONSTRAINT `file_attachments_service_request_id_fkey` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_attachments`
--

LOCK TABLES `file_attachments` WRITE;
/*!40000 ALTER TABLE `file_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machines`
--

DROP TABLE IF EXISTS `machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('OPERATIONAL','NEEDS_PARTS','DOWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPERATIONAL',
  `last_maintenance_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machines`
--

LOCK TABLES `machines` WRITE;
/*!40000 ALTER TABLE `machines` DISABLE KEYS */;
INSERT INTO `machines` VALUES (1,'Konica Minolta C3070','C3070','OPERATIONAL',NULL,'2026-02-20 18:10:26.394','2026-02-20 18:10:26.394'),(2,'Ricoh Pro C5300s','C5300s','OPERATIONAL',NULL,'2026-02-20 18:10:26.398','2026-02-20 18:10:26.398'),(3,'Laminator A3','FGK-320','OPERATIONAL',NULL,'2026-02-20 18:10:26.399','2026-02-20 18:10:26.399'),(4,'Paper Cutter','Polar 66','OPERATIONAL',NULL,'2026-02-20 18:10:26.400','2026-02-20 18:10:26.400'),(5,'UV DTF Printer','FUNSUN','DOWN','2026-02-21 18:03:37.190','2026-02-21 12:44:47.518','2026-02-21 18:03:37.191');
/*!40000 ALTER TABLE `machines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_logs`
--

DROP TABLE IF EXISTS `maintenance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_id` int NOT NULL,
  `action` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('OPERATIONAL','NEEDS_PARTS','DOWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPERATIONAL',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `maintenance_logs_machine_id_fkey` (`machine_id`),
  CONSTRAINT `maintenance_logs_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_logs`
--

LOCK TABLES `maintenance_logs` WRITE;
/*!40000 ALTER TABLE `maintenance_logs` DISABLE KEYS */;
INSERT INTO `maintenance_logs` VALUES (1,5,'bjofdzcozdvj cdov opfj',0.00,'OPERATIONAL','2026-02-21 12:47:23.159'),(2,5,'Just another test',0.00,'DOWN','2026-02-21 18:03:37.177');
/*!40000 ALTER TABLE `maintenance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rent_payments`
--

DROP TABLE IF EXISTS `rent_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rent_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `space_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paid_at` datetime(3) NOT NULL,
  `period_start` datetime(3) NOT NULL,
  `period_end` datetime(3) NOT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `rent_payments_space_id_idx` (`space_id`),
  CONSTRAINT `rent_payments_space_id_fkey` FOREIGN KEY (`space_id`) REFERENCES `rental_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rent_payments`
--

LOCK TABLES `rent_payments` WRITE;
/*!40000 ALTER TABLE `rent_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `rent_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental_spaces`
--

DROP TABLE IF EXISTS `rental_spaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rental_spaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monthly_rent` decimal(12,2) NOT NULL,
  `status` enum('AVAILABLE','OCCUPIED','UNDER_MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `tenant_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental_spaces`
--

LOCK TABLES `rental_spaces` WRITE;
/*!40000 ALTER TABLE `rental_spaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `rental_spaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_id` int NOT NULL,
  `business_unit` enum('OFFIZONE','JOYSUN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_id` int DEFAULT NULL,
  `execution_type` enum('IN_HOUSE','OUTSOURCED','HYBRID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_HOUSE',
  `machine_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `referral_id` int DEFAULT NULL,
  `referral_type` enum('STAFF','CONTACT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quoted_amount` decimal(12,2) DEFAULT NULL,
  `final_amount` decimal(12,2) DEFAULT NULL,
  `supply_cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `outsource_cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `labor_cost` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('DRAFT','APPROVED','IN_PROGRESS','COMPLETED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `delivery_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `color_mode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paper_size` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `assigned_to_staff_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_requests_request_id_key` (`request_id`),
  KEY `service_requests_status_idx` (`status`),
  KEY `service_requests_business_unit_idx` (`business_unit`),
  KEY `service_requests_contact_id_idx` (`contact_id`),
  KEY `service_requests_service_id_fkey` (`service_id`),
  KEY `service_requests_machine_id_fkey` (`machine_id`),
  KEY `service_requests_supplier_id_fkey` (`supplier_id`),
  KEY `service_requests_assigned_to_staff_id_fkey` (`assigned_to_staff_id`),
  CONSTRAINT `service_requests_assigned_to_staff_id_fkey` FOREIGN KEY (`assigned_to_staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `service_requests_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `service_requests_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `service_requests_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `catalog` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `service_requests_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
INSERT INTO `service_requests` VALUES (1,'SR-0001',1,'JOYSUN',3,'IN_HOUSE',NULL,NULL,NULL,NULL,1000.00,1000.00,0.00,0.00,0.00,'DRAFT','This is a good client',NULL,'2026-02-21 10:49:17.170','2026-02-24 13:41:45.475','CMYK',NULL,'A4',1100,NULL),(2,'SR-0002',2,'JOYSUN',2,'IN_HOUSE',2,NULL,1,'STAFF',10000.00,10000.00,0.00,0.00,0.00,'COMPLETED','rofndov djov do vojds vdsjv ',NULL,'2026-02-21 12:27:54.337','2026-02-21 17:58:01.837','CMYK','Lamination','A4',100,NULL);
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` enum('OFFIZONE','JOYSUN','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('MANAGER','ACCOUNTANT','STAFF') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STAFF',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_staff_id_key` (`staff_id`),
  UNIQUE KEY `staff_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'E-001','Super','Admin','admin@cirronyx.com','+237600000000','ADMIN','MANAGER','ACTIVE','$2b$12$ebKukn5sCKbWCyH4heJim.jWir9fyCCGNsOs70oD0gqIg6pG2rUA2','2026-02-20 18:10:26.363','2026-02-20 18:10:26.363',NULL,NULL,NULL),(2,'E-002','Sunyin','Elisbrown','sunyinelisbrown@gmail.com','+237679690703','ADMIN','MANAGER','ACTIVE','$2b$12$8M7/MMZxopxv9..T1n01e.BX4WjrPMpi3PAHABe9oJjcbMgFraVhy','2026-02-20 18:45:21.929','2026-02-24 13:46:11.090',NULL,'/uploads/avatars/avatar_2_1771940771084.jpeg',NULL),(3,'E-003','Maitre','Soco','mtrsoco@gmail.com','679690703','ADMIN','STAFF','ACTIVE','$2b$12$gNz3k/39R/ON5VxLXO6BneNO7Mmdrir7N1QciCu9fEooGNObtiaom','2026-02-24 14:31:04.917','2026-02-24 14:31:04.917',NULL,NULL,NULL);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_tasks`
--

DROP TABLE IF EXISTS `sub_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sub_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sub_tasks_task_id_idx` (`task_id`),
  CONSTRAINT `sub_tasks_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_tasks`
--

LOCK TABLES `sub_tasks` WRITE;
/*!40000 ALTER TABLE `sub_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `sub_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('RAW_MATERIALS','PRINTING_PARTNER','MAINTENANCE','CLEANING_SUPPLIES','PLUMBER','CARPENTRY','ELECTRICITY','PAINTING','HVAC','SECURITY','IT_SERVICES','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Precious','MAINTENANCE','Precious','653103080',NULL,NULL,'2026-02-21 12:42:32.787','2026-02-21 12:42:32.787');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `task_attachments_task_id_idx` (`task_id`),
  KEY `task_attachments_uploaded_by_id_fkey` (`uploaded_by_id`),
  CONSTRAINT `task_attachments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `task_attachments_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachments`
--

LOCK TABLES `task_attachments` WRITE;
/*!40000 ALTER TABLE `task_attachments` DISABLE KEYS */;
INSERT INTO `task_attachments` VALUES (1,1,'Valiant_Image_Overlay.png','/uploads/tasks/1771937864725-Valiant_Image_Overlay.png',1158210,'image/png',2,'2026-02-24 12:57:44.727'),(2,1,'20251229_132720.jpg','/uploads/tasks/1771938464904-20251229_132720.jpg',2975428,'image/jpeg',2,'2026-02-24 13:07:44.910'),(3,3,'20251229_132720.jpg','/uploads/tasks/1771949905574-20251229_132720.jpg',2975428,'image/jpeg',3,'2026-02-24 16:18:25.608');
/*!40000 ALTER TABLE `task_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_comments`
--

DROP TABLE IF EXISTS `task_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `author_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `task_comments_task_id_fkey` (`task_id`),
  CONSTRAINT `task_comments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_comments`
--

LOCK TABLES `task_comments` WRITE;
/*!40000 ALTER TABLE `task_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_logs`
--

DROP TABLE IF EXISTS `task_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `performed_by_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `task_logs_task_id_idx` (`task_id`),
  KEY `task_logs_performed_by_id_fkey` (`performed_by_id`),
  CONSTRAINT `task_logs_performed_by_id_fkey` FOREIGN KEY (`performed_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `task_logs_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_logs`
--

LOCK TABLES `task_logs` WRITE;
/*!40000 ALTER TABLE `task_logs` DISABLE KEYS */;
INSERT INTO `task_logs` VALUES (1,2,'CREATED','Task \"cgj\" created',1,'2026-02-24 12:53:59.520'),(2,1,'ATTACHMENT_ADDED','File \"Valiant_Image_Overlay.png\" uploaded',2,'2026-02-24 12:57:44.735'),(3,1,'STATUS_CHANGED','Status changed from TODO to DOING',2,'2026-02-24 13:07:23.800'),(4,1,'ATTACHMENT_ADDED','File \"20251229_132720.jpg\" uploaded',2,'2026-02-24 13:07:44.925'),(5,1,'STATUS_CHANGED','Status changed from DOING to BLOCKED',2,'2026-02-24 13:09:22.903'),(6,1,'STATUS_CHANGED','Status changed from BLOCKED to PENDING_APPROVAL',2,'2026-02-24 13:09:36.608'),(7,1,'APPROVED','Status changed from PENDING_APPROVAL to DONE',2,'2026-02-24 13:09:47.322'),(8,1,'STATUS_CHANGED','Status changed from DONE to PENDING_APPROVAL',2,'2026-02-24 13:09:52.890'),(9,1,'STATUS_CHANGED','Status changed from PENDING_APPROVAL to BLOCKED',2,'2026-02-24 13:11:32.552'),(10,1,'STATUS_CHANGED','Status changed from BLOCKED to DOING',2,'2026-02-24 13:26:52.342'),(11,3,'CREATED','Task \"Test 2\" created',2,'2026-02-24 14:34:14.497'),(12,3,'STATUS_CHANGED','Status changed from TODO to PENDING_APPROVAL',3,'2026-02-24 15:31:17.672'),(13,3,'ATTACHMENT_ADDED','File \"20251229_132720.jpg\" uploaded',3,'2026-02-24 16:18:25.657');
/*!40000 ALTER TABLE `task_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` int DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` enum('TODO','DOING','BLOCKED','PENDING_APPROVAL','DONE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TODO',
  `due_date` datetime(3) DEFAULT NULL,
  `related_record_id` int DEFAULT NULL,
  `related_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `approved_by_id` int DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_by_id` int DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurring_days` int DEFAULT NULL,
  `recurring_interval` enum('DAILY','WEEKLY','MONTHLY','CUSTOM') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recurring_parent_id` int DEFAULT NULL,
  `is_general` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `tasks_status_idx` (`status`),
  KEY `tasks_assigned_to_idx` (`assigned_to`),
  KEY `tasks_created_by_id_idx` (`created_by_id`),
  KEY `tasks_approved_by_id_fkey` (`approved_by_id`),
  KEY `tasks_recurring_parent_id_fkey` (`recurring_parent_id`),
  CONSTRAINT `tasks_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_recurring_parent_id_fkey` FOREIGN KEY (`recurring_parent_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'UV Printer Maintenance','Clean the printer, Check the ink, Check for leakages, Do test print, Report',2,'MEDIUM','DOING','2026-02-22 00:00:00.000',NULL,NULL,'2026-02-21 12:32:19.204','2026-02-24 13:26:52.294','2026-02-24 13:09:47.315',2,'2026-02-24 13:09:52.878',NULL,0,NULL,NULL,NULL,0),(2,'cgj','v. jb jbk k',2,'MEDIUM','TODO','2026-02-25 00:00:00.000',NULL,NULL,'2026-02-24 12:53:59.485','2026-02-24 13:09:12.358',NULL,NULL,NULL,1,0,NULL,NULL,NULL,0),(3,'Test 2','eazfa',3,'MEDIUM','PENDING_APPROVAL','2026-02-25 14:34:00.000',NULL,NULL,'2026-02-24 14:34:14.451','2026-02-24 16:17:46.235',NULL,NULL,'2026-02-24 15:31:17.639',2,0,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24 17:32:32
