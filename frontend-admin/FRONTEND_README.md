# Table Management Frontend

React-based frontend application for the Smart Restaurant Table Management System.

## Features

### Implemented

-   ✅ **Table CRUD Operations**

    -   Create new tables with validation
    -   View all tables in a responsive dashboard
    -   Edit existing table information
    -   Activate/Deactivate tables

-   ✅ **Advanced Filtering & Sorting**

    -   Filter by status (Active/Inactive)
    -   Filter by location
    -   Search by table number, location, or description
    -   Sort by table number, capacity, or creation date

-   ✅ **Responsive UI**

    -   Clean, modern interface built with Tailwind CSS
    -   Mobile-friendly design
    -   Intuitive navigation and user experience

-   ✅ **Real-time Statistics**
    -   Total tables count
    -   Active/Inactive tables count
    -   Total seating capacity

### Coming Soon

-   🔄 **QR Code Generation** (Under Development)
    -   Generate unique QR codes for each table
    -   Secure JWT-based tokens
    -   Download as PNG or PDF
    -   Regenerate and invalidate QR codes

## Tech Stack

-   **Framework:** React 19.2.0
-   **Routing:** React Router DOM 7.10.1
-   **Styling:** Tailwind CSS 4.1.18
-   **HTTP Client:** Axios 1.13.2
-   **Build Tool:** Vite 7.2.4

## Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Backend API running on http://localhost:5000

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
# Copy .env.example to .env
cp .env.example .env

# Update VITE_API_BASE_URL if needed
VITE_API_BASE_URL=http://localhost:5000/api/admin
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Select.jsx
│   │   ├── layout/          # Layout components
│   │   │   └── Layout.jsx
│   │   └── tables/          # Table-specific components
│   │       ├── TableList.jsx
│   │       ├── TableForm.jsx
│   │       └── QRCodePage.jsx
│   ├── config/
│   │   └── api.js          # Axios configuration
│   ├── services/
│   │   └── tableService.js # API service layer
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── .env                     # Environment variables
├── .env.example            # Environment template
├── package.json
└── vite.config.js
```

## Component Overview

### Common Components

-   **Button:** Reusable button with multiple variants and sizes
-   **Input:** Form input with label and error handling
-   **Select:** Dropdown select with options
-   **Modal:** Overlay modal dialog
-   **Card:** Container card with optional header
-   **Badge:** Status badge with color variants
-   **Alert:** Notification alert messages
-   **Loading:** Loading spinner with optional text
-   **ConfirmDialog:** Confirmation dialog for critical actions

### Table Components

-   **TableList:** Main dashboard displaying all tables with filtering and sorting
-   **TableForm:** Form for creating and editing tables
-   **QRCodePage:** Placeholder for QR code management (coming soon)

### Layout Components

-   **Layout:** Main layout wrapper with navigation and footer

## API Integration

The frontend communicates with the backend API through the `tableService`:

### Endpoints Used

-   `GET /api/admin/tables` - Get all tables
-   `GET /api/admin/tables/:id` - Get table by ID
-   `POST /api/admin/tables` - Create new table
-   `PUT /api/admin/tables/:id` - Update table
-   `PATCH /api/admin/tables/:id/status` - Update table status

## Validation Rules

### Table Number

-   Required
-   Must be unique
-   Only letters, numbers, hyphens, and underscores
-   Maximum 50 characters

### Capacity

-   Required
-   Integer between 1 and 20

### Location

-   Optional
-   Predefined options or custom input
-   Maximum 100 characters

### Status

-   Required
-   Either 'active' or 'inactive'

## Features in Detail

### Table Management Dashboard

-   View all tables in a clean, organized table
-   Real-time statistics cards
-   Quick action buttons for edit, status change, and QR code access

### Filtering & Sorting

-   **Filters:**
    -   Search box for quick text search
    -   Status dropdown (All/Active/Inactive)
    -   Location dropdown (dynamically populated)
-   **Sorting:**
    -   Click column headers to sort
    -   Toggle between ascending and descending
    -   Visual indicators for current sort

### Table Form

-   Single form for both create and edit operations
-   Client-side validation with error messages
-   Helpful guidelines and tooltips
-   Loading states during submission

## Environment Variables

| Variable          | Description          | Default                         |
| ----------------- | -------------------- | ------------------------------- |
| VITE_API_BASE_URL | Backend API base URL | http://localhost:5000/api/admin |

## Troubleshooting

### Backend Connection Issues

-   Ensure backend is running on port 5000
-   Check CORS configuration in backend
-   Verify API_BASE_URL in .env file

### Build Errors

-   Clear node_modules and reinstall: `rm -rf node_modules && npm install`
-   Clear Vite cache: `rm -rf node_modules/.vite`

## Future Enhancements

1. **QR Code Features**

    - Generate QR codes with JWT tokens
    - Download as PNG/PDF
    - Bulk download all QR codes
    - Regenerate and invalidate codes

2. **Authentication**

    - Admin login/logout
    - Protected routes
    - User session management

3. **Additional Features**
    - Table reservations
    - Order history per table
    - Analytics and reporting
    - Multi-language support

## Contributing

This is an academic project for the WAD course Table Management assignment.

## License

Academic Project - University Assignment

## Contact

For questions or issues, please contact your course instructor.
