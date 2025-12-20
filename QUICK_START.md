# Quick Start Guide - Table Management System

## Overview

This guide will help you set up and run the complete Table Management System with frontend and backend.

## Prerequisites

-   Node.js v18+ installed
-   PostgreSQL database (or configured database)
-   Git (optional)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with your database configuration
# Example:
# DATABASE_URL=postgresql://user:password@localhost:5432/restaurant_db
# PORT=5000

# Run database migrations (if needed)
# npm run migrate

# Start backend server
npm run dev
```

Backend will be available at: http://localhost:5000

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
# The .env file is already created with default values:
# VITE_API_BASE_URL=http://localhost:5000/api/admin

# Start frontend development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 3. Access the Application

Open your browser and navigate to:

-   **Frontend:** http://localhost:5173
-   **Backend API:** http://localhost:5000/api/admin/tables

## Important Note About Backend

**⚠️ Backend Route Fix Required**

There is a small typo in the backend routes file. Please verify:

In `backend/src/routes/table.routes.js`, line 6 imports `updatedTable`:

```javascript
import {
	getAllTable,
	createTable,
	getTableById,
	updatedTable, // ❌ This is incorrect
	updateTableStatus,
} from "../controllers/table.controller.js";
```

But the controller exports `updateTable` (without 'd').

**If you encounter errors, please update line 6 to:**

```javascript
  updateTable,  // ✅ Correct name
```

And update line 22:

```javascript
router.put("/tables/:id", updateTable); // ✅ Use updateTable
```

## Testing the Application

### 1. Create a Table

1. Click "Add New Table" button
2. Fill in the form:
    - Table Number: T1
    - Capacity: 4
    - Location: Indoor
    - Status: Active
3. Click "Create Table"

### 2. View Tables

-   The dashboard will display all tables
-   Use filters to search by status or location
-   Click column headers to sort

### 3. Edit a Table

1. Click "Edit" button on any table
2. Update the information
3. Click "Update Table"

### 4. Change Table Status

1. Click "Deactivate" or "Activate" button
2. Confirm the action in the dialog

## Project Structure

```
Table Management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── main/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/       # Reusable UI components
    │   │   ├── layout/       # Layout wrapper
    │   │   └── tables/       # Table management components
    │   ├── config/           # API configuration
    │   ├── services/         # API services
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## Features Implemented

### ✅ Completed Features

1. **Table CRUD Operations**

    - Create new tables
    - Read/View all tables
    - Update table information
    - Activate/Deactivate tables (soft delete)

2. **Advanced Filtering**

    - Filter by status (Active/Inactive)
    - Filter by location
    - Search by table number, location, or description

3. **Sorting**

    - Sort by table number
    - Sort by capacity
    - Sort by creation date
    - Toggle ascending/descending

4. **Dashboard Statistics**

    - Total tables count
    - Active tables count
    - Inactive tables count
    - Total seating capacity

5. **Form Validation**
    - Client-side validation
    - Server-side validation integration
    - User-friendly error messages

### 🔄 Under Development

-   QR Code generation with JWT tokens
-   QR Code download (PNG/PDF)
-   QR Code regeneration and invalidation
-   Bulk QR Code operations

## API Endpoints

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| GET    | /api/admin/tables            | Get all tables   |
| GET    | /api/admin/tables/:id        | Get single table |
| POST   | /api/admin/tables            | Create new table |
| PUT    | /api/admin/tables/:id        | Update table     |
| PATCH  | /api/admin/tables/:id/status | Update status    |

## Validation Rules

### Table Number

-   Required
-   Unique
-   Pattern: Letters, numbers, hyphens, underscores only
-   Max length: 50 characters

### Capacity

-   Required
-   Integer between 1 and 20

### Location

-   Optional
-   Max length: 100 characters
-   Predefined options available

### Status

-   Required
-   Values: 'active' or 'inactive'

## Troubleshooting

### Backend won't start

-   Check if database is running
-   Verify .env configuration
-   Check if port 5000 is available

### Frontend can't connect to backend

-   Ensure backend is running
-   Check VITE_API_BASE_URL in .env
-   Verify CORS is enabled in backend

### Tables not loading

-   Check browser console for errors
-   Verify API endpoint is accessible
-   Check network tab in browser DevTools

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

## Technologies Used

### Backend

-   Node.js + Express
-   Sequelize ORM
-   PostgreSQL
-   JWT for authentication
-   Joi for validation

### Frontend

-   React 19
-   React Router DOM
-   Axios for API calls
-   Tailwind CSS
-   Vite build tool

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

-   Backend: Uses nodemon
-   Frontend: Uses Vite HMR

### Debugging

-   Backend: Check console logs
-   Frontend: Use React DevTools and browser console

### Code Style

-   Frontend follows React best practices
-   Consistent component structure
-   Reusable component library

## Next Steps

1. **Complete QR Code Feature**

    - Install qrcode library
    - Implement JWT token signing
    - Create download endpoints
    - Build UI for QR management

2. **Add Authentication**

    - Admin login/logout
    - Protected routes
    - JWT token management

3. **Deploy**
    - Backend: Heroku, Railway, or VPS
    - Frontend: Vercel, Netlify, or similar
    - Database: PostgreSQL hosting

## Support

For issues or questions:

1. Check this guide first
2. Review the FRONTEND_README.md
3. Check backend documentation
4. Contact course instructor

## Assignment Completion

This implementation covers:

-   ✅ Table CRUD Operations (3 points)
-   ✅ Filtering and Sorting
-   ✅ Responsive UI
-   ✅ Form Validation
-   🔄 QR Code features (to be completed)

Good luck with your assignment! 🚀
