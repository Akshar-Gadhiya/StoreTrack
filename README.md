# StoreTrack

## Overview
StoreTrack is an inventory management platform for multi‑store operations. It provides role-based access control, store and item management, employee management, notifications, and a responsive interface.

## App Context
This repository includes two main parts:
- **frontend/** — React + Vite application with authentication, protected routes, and admin pages.
- **backend/** — Express API with MongoDB, JWT authentication, user roles, and store/item management.

The app uses a shared context model to manage user authentication and state across the UI. Important pages like account creation and admin tools are protected and require valid login and proper role permissions.

## Features
- Role-based access: owner, manager, employee
- Store and section management
- Item creation, editing, and inventory tracking
- Protected dashboard and user management
- Admin-only account creation and setup flows
- Real-time notification support

## Tech Stack
- **Frontend** — React, Vite, Tailwind CSS, Lucide icons
- **Backend** — Node.js, Express, MongoDB
- **Auth** — JWT-based authentication with role checks

## Getting Started
```bash
# Clone the repository
git clone <repo-url>
cd StoreTrack

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Running the App
Start the backend first, then start the frontend in a separate terminal:

```bash
# Backend
cd backend
npm start
```

```bash
# Frontend
cd frontend
npm run dev
```

The application uses configuration values from the backend `.env` file, and the frontend connects to the backend API through the app environment settings.

## Environment Variables
Create a `.env` file in the `backend` folder with your own values:
```
MONGODB_URI=mongodb://localhost:27017/storetrack
JWT_SECRET=your_secret_key
PORT=5000
```

## Notes
- Do not store hardcoded passwords or secret keys in the README.
- Use environment variables for sensitive values.
- The admin account creation page is protected by app-level access control and should be accessed through the authenticated UI.

## Contributing
Feel free to open issues or submit pull requests. Follow the code style in the repository and run linting/tests before committing.

## License
MIT © 2026 StoreTrack Team
