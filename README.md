# Train Seat Booking System

This is a full-stack train seat booking system developed using **Next.js**, **Node.js**, and **PostgreSQL**, with **Supabase** as the database layer. The application allows users to book train seats, handles authentication with JWT, and ensures responsiveness across devices.

---

## Features

- User Authentication: Signup and login with secure JWT-based sessions.
- Train Seat Booking: Reserve up to 7 seats at a time with priority for booking seats in the same row.
- Responsive Design: Mobile and desktop-friendly UI built with Next.js.
- Backend: RESTful APIs for user authentication and seat booking.
- Database: PostgreSQL with Supabase for data storage and retrieval.
- Input Validation: Secure and sanitized user input.

---

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT stored in HTTP-only cookies
- **Deployment**: Vercel for frontend and Supabase backend (can be hosted elsewhere if needed)

---

## Setup Instructions

### Prerequisites

1. Node.js (v16+ recommended)
2. Supabase account with a configured database
3. PostgreSQL (if not using Supabase)
4. Environment variables for JWT and Supabase keys

---

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/train-seat-booking.git
   cd train-seat-booking/backend
2. Install dependencies:
    ```bash
    npm install
3. Set up environment variables: Create a .env file in the backend folder and add:
    env file
    ```bash
    JWT_SECRET=your_jwt_secret_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_KEY=your_supabase_service_key
    PORT=5000
4. Run the backend server:
    ```bash
    npm start

The backend will run on http://localhost:5000.

### Frontend Setup
1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    npm install

2. Configure environment variables: Create a .env.local file in the frontend folder:
    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:5000
    npm run dev

### SupaBase DB Setup

1. Users:
```bash
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
```
2. Seats:
```bash
Copy code
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  row_number INT NOT NULL,
  seat_number INT NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id)
);
```

## Endpoints

### 1. User Authentication

#### Signup
- **Endpoint**: `POST /auth/signup`
- **Description**: Creates a new user account.
- **Request Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123",
    "email": "testuser@example.com"
  }

### **POST** `/auth/login`

#### Description:
Logs in an existing user and provides a JWT token stored in an HTTP-only cookie. This token can be used for subsequent authenticated requests.

#### Request Body:
The request body should contain the following fields:

```json
{
  "username": "testuser",
  "password": "password123"
}   
```

### 2. Book Seats

- **Endpoint**: `POST /seats/book`
- **Method**: `POST`
- **Description**: Allows users to book specific seats. The user must be authenticated via JWT token.

- **Request Headers**:
  - **Authorization**: `Bearer <JWT_TOKEN>` (The user must be logged in)
  
- **Request Body**:
  - An array of seat IDs the user wants to book.

    ```json
    {
      "seatIds": [1, 2, 3]
    }
    ```
