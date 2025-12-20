# Table Management Frontend

A React-based frontend application for managing restaurant tables and QR codes.

## Features Implemented

### 1. Table Management CRUD ✅

-   ✅ Create new tables with validation
-   ✅ View all tables in a grid layout
-   ✅ Edit existing tables
-   ✅ Update table status (Active/Inactive)
-   ✅ Filter tables by status and location
-   ✅ Sort tables by number, capacity, or creation date
-   ✅ Search tables by name or location

### 2. QR Code Generation ✅

-   ✅ Generate unique QR codes for each table
-   ✅ QR codes contain signed JWT tokens
-   ✅ Display QR code preview in modal
-   ✅ Show QR code creation timestamp

### 3. QR Code Download/Print ✅

-   ✅ Download individual QR codes as PNG
-   ✅ Download individual QR codes as PDF
-   ✅ Batch download all QR codes as ZIP
-   ✅ Batch download all QR codes as PDF

### 4. QR Code Regeneration ✅

-   ✅ Regenerate individual QR codes
-   ✅ Bulk regenerate all QR codes
-   ✅ Confirmation dialogs for safety

### 5. Public Menu Page ✅

-   ✅ QR code token verification
-   ✅ Display table information
-   ✅ User-friendly error messages

## Tech Stack

-   React 19 + Vite
-   Tailwind CSS 4
-   React Router DOM
-   Axios, react-qr-code, file-saver, lucide-react

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

### Run Development Server

```bash
npm run dev
```

Application available at http://localhost:5173

## Project Structure

```
src/
├── components/      # UI components (TableList, TableCard, TableForm, QRCodeModal)
├── pages/          # Pages (MenuPage)
├── utils/          # Utilities (api, downloadFile)
├── App.jsx         # Main app with routing
└── index.css       # Global styles
```

## API Integration

Backend must be running on http://localhost:5000

## Usage

1. **Create Table**: Click "Create New Table", fill form, submit
2. **Generate QR**: Click "Generate QR" on table without QR code
3. **View QR**: Click "View QR" to see QR code and options
4. **Download**: Use "..." menu or QR modal to download PNG/PDF
5. **Regenerate**: Click "Regenerate" in QR modal (invalidates old code)

## Build for Production

```bash
npm run build
npm run preview
```
