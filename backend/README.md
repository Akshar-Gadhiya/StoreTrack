# StoreTrack Backend

The backend engine for the StoreTrack inventory management system, providing a robust REST API for authentication, store management, and inventory control.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Security**: JWT Authentication, Bcrypt password hashing
- **Middleware**: CORS, Custom Auth & Role Hierarchies

## Features

- **Authentication System**: Secure register and login flows with JWT.
- **Role-Based Permissions**: REST API endpoints protected by role-based hierarchies (Owner, Manager, Employee).
- **Store Management**: CRUD operations for store entities and their organizational structure.
- **Item Registry**: Comprehensive SKU management with location tracking and QR data integration.
- **Activity Logging**: Automated logging of all significant state-changing operations.
- **Data Isolation**: Ensures users only access data relevant to their role and assigned location.

## API Documentation (Endpoints)

### Auth
- `POST /api/auth/register` - Create a new owner account.
- `POST /api/auth/login` - Authenticate and retrieve token.

### Stores
- `GET /api/stores` - List all accessible stores.
- `POST /api/stores` - Create a new store (Owner only).
- `PUT /api/stores/:id` - Update store configuration.
- `DELETE /api/stores/:id` - Remove a store (Owner only).

### Items (Inventory)
- `GET /api/items` - Retrieve inventory items filtered by store and role.
- `POST /api/items` - Add a new SKU (Owner/Manager).
- `PUT /api/items/:id` - Update item specifications or quantities.
- `DELETE /api/items/:id` - Erase item from registry.

### Users
- `GET /api/users` - View team registry.
- `POST /api/users` - Authorize new personnel (Owner creates Managers, Managers create Employees).

## Setup & Configuration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables (`.env`):
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. Run in Development:
   ```bash
   npm run dev
   ```

4. Run for Production:
   ```bash
   npm start
   ```

---
**StoreTrack API** - Powering Smart Inventory Management
