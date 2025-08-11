# PetNest Frontend 🐾 (React + JavaScript)

A modern React frontend for **PetNest** — a pet marketplace where users can browse, post, chat about, and adopt/buy pets.  
This app talks to the **PetNest Django REST API**, handles authentication, messaging, payments (via **SSLCommerz**), and includes admin/moderator tools.

- **Live site:** [https://petnest-eta.vercel.app](https://petnest-eta.vercel.app)  
- **Backend API:** [https://petnest-backend.vercel.app](https://petnest-backend.vercel.app)  
- **Portfolio-friendly**, production-ready, and deployable on **Vercel**.

---

## 📑 Contents
- [Overview](#overview)
- [Features & Functionality](#features--functionality)
- [Tech Stack](#tech-stack)
- [Screens & Routing](#screens--routing)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Integration Notes](#api-integration-notes)
- [Core Flows](#core-flows)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Security & Best Practices](#security--best-practices)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This frontend provides a complete **PetNest user experience**:

- Discover pets by type, breed, and filters
- Create listings (sale or adoption), upload images, and complete payments
- Chat with other users about specific pets
- Update profile, request identity verification, and manage posts
- Admin/moderator dashboards for user verification and content oversight

It’s built with **React** and uses a **clean service layer** for API calls, structured for maintainability.

---

## Features & Functionality

### **User & Auth**
- JWT auth (Bearer/JWT header)
- Register, login, logout
- Password change/reset (email link flow)
- Profile update with avatar (Cloudinary upload)
- Verification request flow (NID + contact details)

### **Pets**
- Browse with filters (type, adoption vs sale)
- Pet detail with image gallery
- CRUD listings (multipart form)
- Price validation rules
- Multiple image uploads

### **Payments (SSLCommerz)**
- Payment triggered for paid listings
- Redirect to payment gateway
- Payment history view

### **Messaging**
- Conversations grouped by `Other User + Pet`
- Unread counts & latest message preview
- Conversation view + mark-as-read
- Send messages

### **Admin/Moderator**
- Manage users, posts, and verification requests
- Approve/reject verification
- Role-based access (admin-only)

### **UX/Dev**
- Protected and role-gated routes
- Centralized API service with interceptors
- Toasts/alerts for feedback
- Vercel-ready deployment

---

## Tech Stack
- **React 18 + Vite**
- **JavaScript**
- **React Router**
- **Axios**
- **TailwindCSS / MUI / CSS**
- **React Hook Form** (optional)
- **Vercel Deployment**

---

## Screens & Routing

### **Public**
- `/` — Home
- `/pets` — Browse pets
- `/pets/:id` — Pet details
- `/login`, `/register`
- `/forgot-password`, `/reset-password/:token`

### **Authenticated**
- `/dashboard` — Overview
- `/dashboard/profile`
- `/dashboard/posts` & CRUD routes
- `/dashboard/payments`
- `/dashboard/messages` & `/dashboard/messages/:userId/:petId`

### **Admin/Moderator**
- `/admin/users`, `/admin/users/:id`
- `/admin/verification`
- `/admin/posts`

### **Payment Callback**
- `/dashboard/client?payment=success|failed|error|not_found`

---

## Architecture & Folder Structure

```plaintext
petnest-frontend/
├─ public/
├─ src/
│  ├─ api/
│  │  ├─ axios.js
│  │  ├─ auth.js
│  │  ├─ pets.js
│  │  ├─ payments.js
│  │  ├─ messages.js
│  │  └─ admin.js
│  ├─ components/
│  ├─ contexts/AuthContext.jsx
│  ├─ hooks/useAuth.js
│  ├─ pages/
│  ├─ routes/
│  ├─ utils/
│  ├─ styles/
│  ├─ App.jsx
│  └─ main.jsx
├─ .env.local
├─ index.html
└─ package.json
```

---

## Environment Variables

**Development** (`.env.local`)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FRONTEND_URL=http://127.0.0.1:5173
```

**Production (Vercel)**
```env
VITE_API_BASE_URL=https://petnest-backend.vercel.app
VITE_FRONTEND_URL=https://petnest-eta.vercel.app
```

---

## Getting Started

### **Prerequisites**
- Node.js 18+

### **Installation**
```sh
git clone <your-repo-url>
cd petnest-frontend
npm install
cp .env.example .env.local
npm run dev
```

### **Build**
```sh
npm run build
npm run preview
```

---

## API Integration Notes

### Axios Instance
```javascript
// src/api/axios.js
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
```

### Example Endpoints
- **Auth:** `/api/users/login/`, `/api/users/register/`
- **Pets:** `/api/pets/`, `/api/pets/:id/`
- **Messaging:** `/api/messages/conversations/`
- **Payments:** `/api/payments/history/`
- **Admin:** `/api/admin/users/`

---

## Core Flows

### Auth
1. Login stores `accessToken`
2. Attach token to API requests
3. Handle token expiry (401 → logout or refresh)

### Password Reset
1. Request reset → email link
2. User resets via `/reset-password/:token`

### Create Listing + Payment
1. Create listing → may trigger payment
2. Payment redirect handled by backend → `/dashboard/client`

### Messaging
- Conversation list with previews
- Auto mark-as-read
- Send messages via POST

### Verification
- Upload NID + details
- Status managed by admin/mod

---

## Scripts
```sh
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Lint code
npm run format    # Format code
```

---

## Deployment

**Vercel**
1. Push repo to GitHub
2. Import in Vercel
3. Set env variables
4. Build Command: `npm run build`
5. Output Directory: `dist`

---

## Security & Best Practices
- Use HTTPS in production
- Store tokens securely
- Sanitize user input
- Tighten CORS rules
- Never commit secrets

---

## Roadmap
- WebSocket-based real-time chat
- Push/email notifications
- Advanced filters & sorting
- Skeleton loaders
- E2E testing

---

## Contributing
1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a PR with screenshots or demos

---

