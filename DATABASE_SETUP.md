# LoyaltyAI Database Setup

This document provides instructions for setting up the LoyaltyAI database with any PostgreSQL service provider.

## SQL Files

Two SQL files are provided:

1. **`database_schema.sql`** - Complete schema with UUID extension (for providers that support it)
2. **`database_schema_simple.sql`** - Simplified schema without UUID extension (for all providers)

## Setup Instructions

### Option 1: Using the Complete Schema (Recommended)

1. **Upload to your PostgreSQL provider:**
   - Use the `database_schema.sql` file
   - This includes UUID extension support

2. **Execute the SQL:**
   - Run the entire SQL file in your database
   - This will create all tables, indexes, and sample data

### Option 2: Using the Simplified Schema

1. **Upload to your PostgreSQL provider:**
   - Use the `database_schema_simple.sql` file
   - This works with all PostgreSQL providers

2. **Execute the SQL:**
   - Run the entire SQL file in your database

## Database Structure

### Tables Created:

- **Tenant** - Multi-tenant organizations
- **User** - Users with roles (customer, admin, management)
- **Geofence** - Location-based check-in areas
- **Program** - Loyalty program settings
- **Reward** - Available rewards for customers
- **Transaction** - Point transactions (earned/redeemed)
- **Purchase** - Customer purchase records (pending/approved)
- **Testing** - Testing table

### Sample Data Included:

- **Demo Coffee Shop Tenant**
- **Demo Users:**
  - Admin: `admin@coffeeshop.com` / `demo123`
  - Customer: `customer@example.com` / `demo123`
  - Management: `shawn@management.com` / `account123`
- **Sample Rewards** (Free Coffee, Free Pastry, 10% Off)
- **Sample Geofences** (Main Street, Downtown locations)
- **Sample Transactions** and **Pending Purchases**

## Environment Configuration

After setting up the database, update your `.env` file with your new database connection string:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Supported PostgreSQL Providers

These SQL files work with:

- **Supabase**
- **Neon**
- **Railway**
- **PlanetScale** (PostgreSQL)
- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **DigitalOcean Managed Databases**
- **Heroku Postgres**
- **Any self-hosted PostgreSQL**

## Features Supported

The database schema supports all LoyaltyAI features:

✅ **Multi-tenant Architecture**
✅ **User Role Management** (Customer, Admin, Management)
✅ **Purchase Verification System**
✅ **Location-based Check-ins**
✅ **Reward Management**
✅ **Point Tracking**
✅ **Analytics and Reporting**
✅ **AI-powered Insights**

## Troubleshooting

### Common Issues:

1. **UUID Extension Error:**
   - Use `database_schema_simple.sql` instead
   - This doesn't require the UUID extension

2. **Permission Errors:**
   - Ensure your database user has CREATE, INSERT, and INDEX permissions

3. **Connection Issues:**
   - Verify your DATABASE_URL is correct
   - Check firewall settings for your provider

### Verification:

After setup, you can verify the database by:

1. **Checking tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Verifying sample data:**
   ```sql
   SELECT * FROM "User" WHERE email = 'admin@coffeeshop.com';
   ```

## Next Steps

1. **Update your `.env` file** with the new database URL
2. **Restart your application** to connect to the new database
3. **Test the login** with the demo accounts
4. **Verify all features** are working correctly

## Demo Accounts

Use these accounts to test the application:

- **Admin Portal:** `admin@coffeeshop.com` / `demo123`
- **Customer Portal:** `customer@example.com` / `demo123`
- **Management Portal:** `shawn@management.com` / `account123`
