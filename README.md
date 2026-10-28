# 🏢 Apartment Visitor & Maintenance Manager

A Full Stack Development (FSD) project built to simplify apartment visitor management, maintenance requests, and residential community administration using Node.js, Express, React, and MongoDB (or SQLite in memory / local).

## 📌 Project Overview

The **Apartment Visitor & Maintenance Manager** is a web-based application that helps apartment residents, security guards, and administrators manage daily apartment activities efficiently.

The system allows security guards to register visitors, residents to track visitor entries and raise maintenance complaints, and administrators to manage apartments, users, and maintenance requests from a centralized dashboard.

## 🎯 Objectives

- Digitize apartment visitor entry and exit records.
- Improve apartment security through visitor tracking.
- Allow residents to submit and track maintenance complaints.
- Help administrators assign and monitor maintenance work.
- Provide a centralized dashboard for apartment management.
- Reduce paperwork and improve communication between residents and management.

## ✨ Key Features

### 1. Authentication and Authorization
- User registration and login with JWT and bcrypt password hashing.
- Role-based access for Admin, Resident, and Security Guard.
- Protected frontend routes and API endpoints.

### 2. Visitor Management
- Register visitor details (Name, Phone Number, Purpose, Destination Apartment, Resident).
- Record visitor entry and exit times.
- View real-time visitor log and history.
- Search and filter visitor records.

### 3. Maintenance Management
- Residents can submit maintenance complaints with categories (Electrical, Plumbing, Cleaning, etc.).
- Track complaint status (Pending, In Progress, Resolved).
- Admins can assign requests to personnel and update statuses.

### 4. Admin Dashboard
- Centralized view of total residents, today's visitors, and pending maintenance complaints.
- Apartment management (create apartments, associate residents).
- User management (manage roles and user directory).

### 5. Resident Dashboard
- Personal profile and assigned apartment info.
- Visitor history for their apartment.
- Submit and track maintenance complaints.

### 6. Security Guard Dashboard
- Quick visitor check-in form.
- Direct visitor check-out action with a single click.
- Live active visitor count and search tool.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React (Vite), React Router, Axios, CSS / Bootstrap |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) / SQLite (in-memory for testing/fallback) |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs |
| **Hosting / Cloud** | Vercel (Frontend & Serverless API functions) / MongoDB Atlas |

---

## 📂 Project Structure

```text
apartment-visitor-maintenance-manager/
├── client/                         # React Vite Frontend
│   ├── src/
│   │   ├── components/            # Header, Sidebar, ProtectedRoute
│   │   ├── context/               # AuthContext
│   │   ├── pages/                 # Login, Register, Dashboards, Visitors, Maintenance
│   │   ├── services/              # API Client (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── server/                         # Express Backend
│   ├── config/                    # Database Connection
│   ├── controllers/               # Auth, Visitors, Maintenance, Users, Apartments
│   ├── middleware/                # Auth & Role Middlewares
│   ├── models/                    # Mongoose Models (User, Apartment, Visitor, Maintenance)
│   ├── routes/                    # Express Routes
│   ├── app.js                     # Express Application
│   ├── server.js                  # Standalone Server Listener
│   ├── package.json
│   └── .env.example
├── vercel.json                     # Vercel Deployment Config
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup Instructions

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/apartment_manager
JWT_SECRET=super_secret_jwt_key_for_dev
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/).
3. Add Environment Variables in Vercel settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `NODE_ENV`: `production`
4. Deploy! Vercel uses `vercel.json` to automatically serve the React client and route `/api/*` calls to the serverless Express app.

---

## 📄 License

This project is open-source and intended for educational and demonstration purposes.
