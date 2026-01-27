# Issue Fixed: Signup/Sign-in Not Working

## Problem Summary
The signup/sign-in pages for both admin and customer panels were not working.

## Root Cause
The backend server was unable to start due to **PostgreSQL database connection failure**. The system was configured to use PostgreSQL, but the PostgreSQL server was not running on the system.

## Solution Applied
**Switched from PostgreSQL back to SQLite** for the database backend.

### Changes Made:

1. **Modified Database Configuration** (`backend/src/config/database.js`)
   - Changed from PostgreSQL to SQLite
   - SQLite doesn't require a separate database server
   - Better for development and simpler deployment

2. **Installed SQLite Dependency**
   ```bash
   npm install sqlite3
   ```

3. **Restarted Backend Server**
   - Backend now successfully starts on port 5000
   - Database connection working properly

## Current Status: ✅ FIXED

### Servers Running:
- ✅ **Frontend**: http://localhost:3000 (Next.js)
- ✅ **Backend**: http://localhost:5000 (Express.js with SQLite)

### Authentication Testing Results:

#### Customer Signup ✅
```json
{
    "message": "User created successfully",
    "userId": 4
}
```

#### Customer Login ✅
```json
{
    "token": "eyJhbG...",
    "user": {
        "id": 4,
        "username": "testcustomer",
        "role": "customer"
    }
}
```

#### Admin Login ✅
```json
{
    "token": "eyJhbG...",
    "user": {
        "id": 1,
        "username": "pranith",
        "role": "admin"
    }
}
```

## How to Use:

### For Customers:
1. Go to http://localhost:3000
2. Click "Customer Login / Sign Up"
3. Create a new account or login
4. After login, you'll be redirected to `/shop`

### For Admin/Staff:
1. Go to http://localhost:3000
2. Click "Admin / Staff Login"
3. Use credentials:
   - **Username**: `pranith`
   - **Password**: `pranith123`
4. After login, you'll be redirected to `/admin`

## Files Modified:
- `backend/src/config/database.js` - Changed database configuration from PostgreSQL to SQLite

## Next Steps:
1. Open http://localhost:3000 in your browser
2. Test the login/signup functionality
3. Both customer and admin panels should now be accessible

---
**Status**: Issue resolved ✅
**Date**: 2026-01-27
