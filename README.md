# Sweet Shop Management System 🍭

A full-stack application for managing a sweet shop inventory, including user authentication, browsing sweets, and administrative dashboard for stock management.

## 🛠️ Technology Stack

### Backend (`/server`)
*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database**: SQLite (local file database)
*   **ORM**: Drizzle ORM
*   **Authentication**: JWT (JSON Web Tokens)
*   **Validation**: Zod
*   **Testing**: Jest, Supertest

### Frontend (`/client`)
*   **Framework**: React (v18)
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Modern CSS (Glassmorphism, CSS Variables, Responsive Grid)
*   **Routing**: React Router v6
*   **State Management**: React Context API
*   **HTTP Client**: Axios

## ✨ Features
*   **User Authentication**: Secure Register and Login flows.
*   **Sweets Catalog**: Browse available sweets with search and price filtering.
*   **Admin Dashboard**: Protected route for Admins to Add, Edit, Delete, and Restock sweets.
*   **Inventory Management**: Real-time stock updates upon purchase.
*   **Purchase History**: Track past orders (Database implemented).
*   **Responsive Design**: Mobile-friendly UI with separate views for Users and Admins.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm

### Installation & Running

**1. Backend**
```bash
cd server
npm install
npm run db:push  # Initialize Database
npm run dev      # Start Server on port 3000
```

**2. Frontend**
```bash
cd client
npm install
npm run dev      # Start Client on port 5173
```

**3. Verification**
Run backend tests:
```bash
cd server
npm test
```
