# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)

## Step 1: Database Setup
1. Start MySQL service
2. Create database:
```sql
CREATE DATABASE auth_system;
```

## Step 2: Environment Configuration
Create a `.env` file in the `server` directory with:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=auth_system
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## Step 3: Install Dependencies
```bash
cd server
npm install
```

## Step 4: Start the Application
```bash
npm start
```

## Step 5: Initialize Database
Visit: `http://localhost:5000/init`

## Step 6: Access the Application
Open `public/index.html` in your browser

## Default Admin Account
- Email: admin@example.com
- Password: admin123

## Testing CRUD Operations
1. Register a new user
2. Login with admin account
3. Test user management features
4. Edit your profile
5. Test all CRUD operations 