# Dinorah Jewellery — Backend API (Sprint 1)

This is the Node.js + Express + TypeScript backend for **Dinorah Jewellery**, featuring MySQL database integration, JWT authentication, bcrypt password hashing, and role-based access control (`customer` and `admin`).

---

## 🏗 Architecture Overview

The backend uses a clean, layered architecture:

```
Request from Client
       │
       ▼
1. [Routes]        (src/routes/auth.routes.ts)       -> Defines URLs & attaches middlewares
       │
       ▼
2. [Middlewares]   (src/middleware/auth.middleware.ts) -> Verifies JWT & extracts req.user
       │
       ▼
3. [Validators]    (src/validators/auth.validator.ts) -> Validates request data before processing
       │
       ▼
4. [Controllers]   (src/controllers/auth.controller.ts)-> Handles HTTP request / response & status codes
       │
       ▼
5. [Services]      (src/services/auth.service.ts)     -> Core business logic (hashing, JWT creation)
       │
       ▼
6. [Models]        (src/models/user.model.ts)         -> Executes typed SQL queries via MySQL pool
       │
       ▼
   [MySQL DB]      (`users` table)
```

---

## 🗄 Database Schema (`users` table)

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your database credentials:
```bash
cp .env.example .env
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build and Typecheck
```bash
npm run typecheck
npm run build
```

---

## 📡 API Endpoints

### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "Maria Silva",
    "email": "maria@example.com",
    "password": "Password123",
    "role": "customer"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "jwt-token-string",
    "user": {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@example.com",
      "role": "customer",
      "createdAt": "2026-08-27T12:00:00.000Z"
    }
  }
  ```

### 2. Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "maria@example.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt-token-string",
    "user": {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@example.com",
      "role": "customer",
      "createdAt": "2026-08-27T12:00:00.000Z"
    }
  }
  ```

### 3. Get Current User (Protected)
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@example.com",
      "role": "customer",
      "createdAt": "2026-08-27T12:00:00.000Z"
    }
  }
  ```

### 4. Admin Only Resource (Protected + Admin Role)
- **Method**: `GET`
- **Path**: `/api/auth/admin-only`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response (200 OK)**: Returns admin statistics and status.
