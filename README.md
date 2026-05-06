# Automex Invoice Micro-SaaS

Automex is now structured as a micro-SaaS style invoicing app with:
- page-based workflow (`Invoice`, `Customer Details`, `Company Details`)
- tenant-aware customer APIs
- MongoDB-ready customer persistence
- invoice generation (PDF + optional Google Drive upload)

## Micro-SaaS Baseline

- **Tenant context**: customer endpoints use `x-tenant-id` header.
- **Customer persistence**: customers are served from `/api/customers`.
- **SaaS-safe fallback**: if Mongo is not configured yet, invoice features still run and customer API returns a clear setup message.
- **Frontend API mode**: customer page uses backend APIs first, then falls back to in-browser session memory if API is unavailable.

## Tech Stack

- **Frontend**: React (Vite), Axios, Lucide React
- **Backend**: Node.js, Express, Puppeteer, Handlebars, Google Drive API
- **Database**: MongoDB (via Mongoose, configured through env)

## Setup

### 1) Backend

1. Go to `api`:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example` and fill placeholders:
   ```env
   PORT=5000
   GOOGLE_APPLICATION_CREDENTIALS=service-account.json
   DRIVE_FOLDER_ID=your_google_drive_folder_id_here
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   MONGODB_DB_NAME=automex_invoice
   ```
4. Add your Google service account file as `api/service-account.json` (if Drive upload is required).

### 2) Frontend

1. Go to `client`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `client/.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_TENANT_ID=default-workspace
   ```
4. Start frontend:
   ```bash
   npm run dev
   ```

### 3) Run

- Start backend: `npm start --prefix api`
- Start frontend: `npm run dev --prefix client`
- Open `http://localhost:5173`

## API Overview

- `POST /api/generate-invoice` - generate invoice PDF
- `GET /api/customers` - list tenant customers
- `POST /api/customers` - create customer
- `PUT /api/customers/:id` - update customer
- `DELETE /api/customers/:id` - delete customer

## Environment Variables

### Backend (`api/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Backend server port (default: 5000) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON |
| `DRIVE_FOLDER_ID` | Google Drive folder ID for PDF uploads |
| `MONGODB_URI` | MongoDB connection string placeholder (fill with your creds later) |
| `MONGODB_DB_NAME` | MongoDB database name |

### Frontend (`client/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL |
| `VITE_TENANT_ID` | Tenant/workspace ID sent via `x-tenant-id` |

## Invoice File Naming

Generated files follow:
`INV-{invoiceNumber}_{customerName}_{total}_{date}.pdf`
