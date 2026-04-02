<div align="center">

# Socially

**A full-stack social media platform built with the MERN stack**

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)[![Status](https://img.shields.io/badge/status-active-success.svg)]()

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Socket Events](#-socketio-events) · [Environment Variables](#-environment-variables)

</div>

---

## Features

**Authentication**

- Email + password signup with OTP email verification
- JWT authentication via HttpOnly cookies
- Forgot / reset password via OTP email
- Disposable email detection

**Social**

- Follow / unfollow users
- Suggested users list & user search
- User profiles with bio and profile picture

**Posts**

- Create posts with image upload (optimized via Sharp → Cloudinary)
- Infinite-scroll feed
- Like / unlike posts (with optimistic UI)
- Comment on posts
- Save / unsave posts
- Delete own posts

**Real-Time** _(Socket.IO)_

- Live feed updates — new posts appear instantly for followers
- Real-time notifications (likes, comments, follows)
- 1-on-1 messaging with image support
- Typing indicators & message seen/delivered status

**UX**

- Dark mode (system preference + manual toggle, persisted)
- Fully responsive — dedicated bottom nav on mobile
- Skeleton loaders & toast notifications
- Rate-limit-aware error pages

---

## Tech Stack

### Frontend

|                  |                   |
| ---------------- | ----------------- |
| **Framework**    | React 18 + Vite   |
| **Routing**      | React Router v6   |
| **Server State** | TanStack Query v5 |
| **HTTP**         | Axios             |
| **Real-time**    | Socket.IO Client  |
| **Styling**      | Tailwind CSS      |
| **Animations**   | Framer Motion     |

### Backend

|                  |                                                    |
| ---------------- | -------------------------------------------------- |
| **Runtime**      | Node.js ≥ 18 (ES Modules)                          |
| **Framework**    | Express 5                                          |
| **Database**     | MongoDB + Mongoose                                 |
| **Cache / OTP**  | Redis (ioredis)                                    |
| **Auth**         | JWT + bcryptjs                                     |
| **Real-time**    | Socket.IO                                          |
| **File Uploads** | Multer + Sharp + Cloudinary                        |
| **Email**        | Nodemailer + EJS templates                         |
| **Security**     | Helmet, express-mongo-sanitize, express-rate-limit |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Upstash](https://upstash.com))
- [Cloudinary](https://cloudinary.com) account
- Gmail app password (or any SMTP credentials)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/socially.git
cd socially
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables

**Backend** — copy and fill in `backend/.env`:

```env
NODE_ENV=development
PORT=8000

# MongoDB
DB_URL=mongodb://localhost:27017/social-media

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d
COOKIE_EXPIRES_IN=86400000   # 1 day in ms

# Email (Gmail example — use App Password)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:5173

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Frontend** — copy and fill in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

### 4. Run the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Service      | URL                          |
| ------------ | ---------------------------- |
| Frontend     | http://localhost:5173        |
| Backend API  | http://localhost:8000/api/v1 |
| Health check | http://localhost:8000/check  |

---

## API Reference

Base path: `/api/v1`

### Auth — `/auth`

| Method | Endpoint                | Auth                                                    | Description                |
| ------ | ----------------------- | ------------------------------------------------------- | -------------------------- |
| POST   | `/auth/signup`          | ![Yes](https://img.shields.io/badge/Required-No-red)    | Register new user          |
| POST   | `/auth/login`           | ![Yes](https://img.shields.io/badge/Required-No-red)    | Login, returns JWT cookie  |
| POST   | `/auth/verify`          | ![Yes](https://img.shields.io/badge/Required-No-red)    | Verify email with OTP      |
| POST   | `/auth/resend-otp`      | ![Yes](https://img.shields.io/badge/Required-No-red)    | Resend verification OTP    |
| POST   | `/auth/forget-password` | ![Yes](https://img.shields.io/badge/Required-No-red)    | Request password reset OTP |
| POST   | `/auth/reset-password`  | ![Yes](https://img.shields.io/badge/Required-No-red)    | Reset password with OTP    |
| POST   | `/auth/logout`          | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Clear JWT cookie           |

### Users — `/users`

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| GET    | `/users/me`              | Current authenticated user               |
| GET    | `/users/profile/:id`     | Get user profile by ID                   |
| GET    | `/users/suggested-users` | List of suggested users                  |
| GET    | `/users/search?query=`   | Search users by username or bio          |
| POST   | `/users/follow/:id`      | Follow a user                            |
| POST   | `/users/unfollow/:id`    | Unfollow a user                          |
| POST   | `/users/edit-profile`    | Update bio & profile picture (multipart) |

### Posts — `/posts`

| Method | Endpoint                      | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/posts/all-posts`            | Paginated feed (`?page=&limit=`)   |
| GET    | `/posts/user-posts/:id`       | All posts by a user                |
| GET    | `/posts/:postId/comments`     | Comments for a post                |
| POST   | `/posts/create-post`          | Create post with image (multipart) |
| POST   | `/posts/like-dislike/:postId` | Toggle like                        |
| POST   | `/posts/comment/:postId`      | Add comment                        |
| POST   | `/posts/save/:postId`         | Toggle save                        |
| DELETE | `/posts/delete/:postId`       | Delete own post                    |

### Messages — `/messages`

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/messages/conversations` | List all conversations               |
| GET    | `/messages/:userId`       | Message history with a user          |
| GET    | `/messages/unread/count`  | Unread message count                 |
| POST   | `/messages/send`          | Send message (text + optional image) |
| PATCH  | `/messages/:userId/seen`  | Mark messages as seen                |

### Notifications — `/notifications`

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| GET    | `/notifications`               | List notifications (latest 20) |
| GET    | `/notifications/unread-count`  | Unread count                   |
| PATCH  | `/notifications/mark-all-read` | Mark all as read               |
| PATCH  | `/notifications/:id/read`      | Mark one as read               |
| DELETE | `/notifications/:id`           | Delete a notification          |

---

## Socket.IO Events

### Client → Server

| Event            | Payload                    | Description                |
| ---------------- | -------------------------- | -------------------------- |
| `user-connected` | `userId`                   | Register socket on connect |
| `typing`         | `{ senderId, receiverId }` | User is typing             |
| `stopTyping`     | `{ senderId, receiverId }` | User stopped typing        |

### Server → Client

| Event               | Payload                                         | Description                          |
| ------------------- | ----------------------------------------------- | ------------------------------------ |
| `new-notification`  | notification object                             | Like / comment / follow notification |
| `newPost`           | post object                                     | New post from a followed user        |
| `postDeleted`       | `{ postId }`                                    | Post was deleted                     |
| `postLikeUpdated`   | `{ postId, likesCount, userId }`                | Like count changed                   |
| `newComment`        | `{ postId, comment, commentsCount }`            | New comment on a post                |
| `postSavedUpdated`  | `{ postId, isSaved, post }`                     | Post saved/unsaved                   |
| `message`           | `{ type: 'newMessage' \| 'messagesSeen', ... }` | New message or seen receipt          |
| `userTyping`        | `{ userId }`                                    | Remote user is typing                |
| `userStoppedTyping` | `{ userId }`                                    | Remote user stopped typing           |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                | Required                                                | Description                       |
| ----------------------- | ------------------------------------------------------- | --------------------------------- |
| `NODE_ENV`              | ![Yes](https://img.shields.io/badge/Required-Yes-green) | `development` or `production`     |
| `PORT`                  | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Server port (default: 8000)       |
| `DB_URL`                | ![Yes](https://img.shields.io/badge/Required-Yes-green) | MongoDB connection string         |
| `JWT_SECRET`            | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Secret key for JWT signing        |
| `JWT_EXPIRES_IN`        | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Token expiry (e.g. `1d`)          |
| `COOKIE_EXPIRES_IN`     | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Cookie expiry in milliseconds     |
| `EMAIL_USERNAME`        | ![Yes](https://img.shields.io/badge/Required-Yes-green) | SMTP email address                |
| `EMAIL_PASSWORD`        | ![Yes](https://img.shields.io/badge/Required-Yes-green) | SMTP password / app password      |
| `CLOUDINARY_CLOUD_NAME` | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Cloudinary cloud name             |
| `CLOUDINARY_API_KEY`    | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Cloudinary API key                |
| `CLOUDINARY_API_SECRET` | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Cloudinary API secret             |
| `FRONTEND_URL`          | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Frontend origin for CORS          |
| `REDIS_HOST`            | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Redis host (default: `127.0.0.1`) |
| `REDIS_PORT`            | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Redis port (default: `6379`)      |

### Frontend (`frontend/.env`)

| Variable          | Required                                                | Description           |
| ----------------- | ------------------------------------------------------- | --------------------- |
| `VITE_API_URL`    | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Backend API base URL  |
| `VITE_SOCKET_URL` | ![Yes](https://img.shields.io/badge/Required-Yes-green) | Backend Socket.IO URL |

---

## Project Structure

```
socially/
├── backend/
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── middleware/        # Auth, multer, rate limiter
│   ├── utils/             # Socket.IO, Cloudinary, Redis, email, helpers
│   ├── views/emails/      # EJS email templates
│   ├── app.js             # Express setup
│   └── server.js          # Entry point
└── frontend/
    └── src/
        ├── api/           # Axios instance
        ├── context/       # Auth, Socket, Theme contexts
        ├── components/    # Reusable UI components
        └── pages/         # Route-level page components
```

---

<!-- ## License

[ISC](LICENSE) © Divyesh Odedara -->

## License

This project is licensed under the MIT License.

Copyright (c) 2026 Divyesh Odedara

Permission is granted to use, copy, modify, and distribute this software freely.

See the [LICENSE](./LICENSE) file for more details.
