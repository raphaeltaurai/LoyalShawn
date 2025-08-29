-- LoyaltyAI Database Schema (Simplified)
-- Complete SQL for PostgreSQL service provider

-- Create tables
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT,
    "picture" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Geofence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pointsPerDollar" INTEGER NOT NULL DEFAULT 2,
    "birthdayBonus" INTEGER NOT NULL DEFAULT 250,
    "checkInBonusPoints" INTEGER NOT NULL DEFAULT 50,
    "checkInRadiusMeters" INTEGER NOT NULL DEFAULT 150,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "items" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Testing" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Testing_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Geofence" ADD CONSTRAINT "Geofence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Program" ADD CONSTRAINT "Program_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert sample data

-- Sample Tenant
INSERT INTO "Tenant" ("id", "slug", "name", "createdAt") VALUES
('clx1234567890abcdef', 'coffee-shop-1', 'Coffee Shop', CURRENT_TIMESTAMP);

-- Sample Users (password hash for 'demo123')
INSERT INTO "User" ("id", "email", "name", "role", "passwordHash", "tenantId", "createdAt") VALUES
('clx1234567890abcdeg', 'admin@coffeeshop.com', 'Coffee Shop Admin', 'admin', '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', 'clx1234567890abcdef', CURRENT_TIMESTAMP),
('clx1234567890abcdeh', 'customer@example.com', 'John Customer', 'customer', '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', 'clx1234567890abcdef', CURRENT_TIMESTAMP);

-- Management Tenant and User
INSERT INTO "Tenant" ("id", "slug", "name", "createdAt") VALUES
('clx1234567890abcdei', 'management', 'Management System', CURRENT_TIMESTAMP);

INSERT INTO "User" ("id", "email", "name", "role", "passwordHash", "tenantId", "createdAt") VALUES
('clx1234567890abcdej', 'shawn@management.com', 'Shawn Management', 'management', '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', 'clx1234567890abcdei', CURRENT_TIMESTAMP);

-- Sample Program
INSERT INTO "Program" ("id", "tenantId", "name", "pointsPerDollar", "birthdayBonus", "checkInBonusPoints", "checkInRadiusMeters", "createdAt") VALUES
('default-program', 'clx1234567890abcdef', 'Coffee Lovers Rewards', 2, 250, 50, 150, CURRENT_TIMESTAMP);

-- Sample Rewards
INSERT INTO "Reward" ("id", "tenantId", "name", "description", "pointsCost", "category", "isActive", "usageCount", "createdAt") VALUES
('reward-1', 'clx1234567890abcdef', 'Free Coffee', 'Any size coffee drink', 500, 'Beverages', true, 0, CURRENT_TIMESTAMP),
('reward-2', 'clx1234567890abcdef', 'Free Pastry', 'Any pastry or dessert', 300, 'Food', true, 0, CURRENT_TIMESTAMP),
('reward-3', 'clx1234567890abcdef', '10% Off Next Visit', 'Valid for 30 days', 200, 'Discounts', true, 0, CURRENT_TIMESTAMP);

-- Sample Geofences
INSERT INTO "Geofence" ("id", "tenantId", "name", "latitude", "longitude", "radiusMeters", "createdAt") VALUES
('geofence-1', 'clx1234567890abcdef', 'Main Street Location', 40.7128, -74.0060, 150, CURRENT_TIMESTAMP),
('geofence-2', 'clx1234567890abcdef', 'Downtown Location', 40.7589, -73.9851, 150, CURRENT_TIMESTAMP);

-- Sample Transactions
INSERT INTO "Transaction" ("id", "userId", "tenantId", "amount", "pointsEarned", "pointsRedeemed", "location", "timestamp", "paymentMethod") VALUES
('txn-1', 'clx1234567890abcdeh', 'clx1234567890abcdef', 12.50, 25, 0, 'Main Street Location', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Credit Card'),
('txn-2', 'clx1234567890abcdeh', 'clx1234567890abcdef', 8.75, 17, 0, 'Downtown Location', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Cash');

-- Sample Pending Purchase
INSERT INTO "Purchase" ("id", "userId", "tenantId", "location", "amount", "items", "timestamp", "status") VALUES
('purchase-1', 'clx1234567890abcdeh', 'clx1234567890abcdef', 'Main Street Location', 15.25, '[{"name":"Latte","quantity":1,"price":5.25},{"name":"Croissant","quantity":1,"price":4.50},{"name":"Coffee","quantity":1,"price":5.50}]', CURRENT_TIMESTAMP, 'pending');

-- Create indexes for better performance
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Geofence_tenantId_idx" ON "Geofence"("tenantId");
CREATE INDEX "Program_tenantId_idx" ON "Program"("tenantId");
CREATE INDEX "Reward_tenantId_idx" ON "Reward"("tenantId");
CREATE INDEX "Reward_isActive_idx" ON "Reward"("isActive");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_tenantId_idx" ON "Transaction"("tenantId");
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX "Purchase_tenantId_idx" ON "Purchase"("tenantId");
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");
CREATE INDEX "Purchase_timestamp_idx" ON "Purchase"("timestamp");

-- Demo Account Information
-- Admin: admin@coffeeshop.com / demo123
-- Customer: customer@example.com / demo123  
-- Management: shawn@management.com / account123
