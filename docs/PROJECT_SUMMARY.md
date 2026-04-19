# 📋 Project Summary

**Hidden Gem** - Ứng dụng cộng đồng chia sẻ địa điểm ít người biết tại địa phương

_Last Updated: April 19, 2026_

---

## 🎯 Project Overview

### Vision

Xây dựng platform cho phép cộng đồng khám phá, chia sẻ và lưu lại những địa điểm thú vị, bí mật ở địa phương thông qua mạng xã hội + bản đồ interactiv.

### Core Features

✨ **Discover** - Khám phá địa điểm gần bạn trên bản đồ
✏️ **Share** - Đăng địa điểm với ảnh, GPS, tags
💬 **Connect** - Bình luận, like, follow người khác
🔖 **Save** - Tạo collections để lưu địa điểm yêu thích
🔍 **Search** - Tìm kiếm địa điểm theo tên, tag, danh mục

---

## 📊 Tech Stack Summary

### Frontend

- **React Native** + **Expo SDK 54** (iOS/Android/Web)
- **Expo Router** (file-based routing)
- **Zustand** (state management)
- **React Query** (data fetching)
- **TypeScript** (type safety)

### Backend

- **NestJS** (TypeScript) - Scalable server
- **PostgreSQL 15** + **PostGIS** - Geospatial DB
- **Redis** - Caching & sessions
- **Elasticsearch** - Full-text search
- **Socket.io** - Realtime features
- **BullMQ** - Job queue

### Infrastructure

- **Docker Compose** - Local development
- **AWS S3** - Media storage (optional)
- **GitHub Actions** - CI/CD ready

---

## 📁 Folder Structure

### Root Level

```
hidden-gem-mobile/
├── docs/              ← 📚 All documentation
├── mobile/            ← 📱 Expo React Native
├── backend/           ← 🔧 NestJS API
├── scripts/           ← 🛠️ Utilities
├── .github/           ← 🚀 GitHub Actions
├── docker-compose.yml ← 🐳 Docker orchestration
├── README.md          ← Start here
└── .gitignore
```

### Mobile Structure

```
mobile/
├── app/               # Expo Router screens
│   ├── (auth)/        # Login, Register
│   ├── (tabs)/        # Main navigation (5 tabs)
│   ├── place/         # Place detail, create, comments
│   ├── user/          # User profile, following
│   ├── bookmarks/     # Collections
│   └── settings/      # Settings, edit profile
│
├── components/        # Shared UI components
├── hooks/             # Custom React hooks
├── stores/            # Zustand state
├── services/          # API calls (Axios)
├── constants/         # Theme, colors, categories
├── utils/             # ✨ Helpers
│   ├── formatters.ts  # Format numbers, time, text
│   ├── validators.ts  # Form validation
│   ├── geolocation.ts # Distance, coordinates
│   └── index.ts
│
├── .env.example       # Environment template
├── app.json           # Expo config
└── package.json
```

### Backend Structure

```
backend/
├── src/
│   ├── auth/          # JWT, OAuth, Guards
│   ├── users/         # User CRUD, profiles
│   ├── places/        # Place CRUD, PostGIS
│   ├── social/        # Comments, likes, follows
│   ├── bookmarks/     # Collections
│   ├── notifications/ # Push notifications
│   ├── search/        # Elasticsearch
│   ├── media/         # Image upload, optimization
│   ├── realtime/      # Socket.io
│   ├── queue/         # BullMQ background jobs
│   ├── config/        # Configuration
│   ├── app.module.ts  # Main module
│   └── main.ts        # Entry point
│
├── .env.example       # Environment template
├── docker-compose.yml # PostgreSQL, Redis, ES
├── Dockerfile
└── package.json
```

---

## ✅ Completed Features

### 📱 Mobile Screens (11 screens)

- ✅ Login / Register / Forgot Password
- ✅ Home Feed (infinite scroll, category filter)
- ✅ Map (interactive, fallback for web)
- ✅ Search (full-text, history, trending)
- ✅ Notifications (all/unread tabs, mark as read)
- ✅ User Profile (stats, posts grid, logout)
- ✅ Place Detail (gallery, comments, like, bookmark)
- ✅ Create Place (image picker, location, auto-save drafts)
- ✅ Comments (nested replies, @mentions, like)
- ✅ User Profile (view others, follow)
- ✅ Settings (notifications, privacy, appearance)

### 🔧 Backend Modules (9 modules)

- ✅ Auth (JWT + OAuth 2.0)
- ✅ Users (profile, avatar, settings, block)
- ✅ Places (CRUD + PostGIS geospatial)
- ✅ Social (comments, follows, likes)
- ✅ Bookmarks (collections management)
- ✅ Media (image upload, optimization)
- ✅ Search (full-text with Elasticsearch)
- ✅ Notifications (push notifications)
- ✅ Realtime (Socket.io for live comments)

### 🛠️ Utilities (✨ NEW)

- ✅ formatters.ts (numbers, time, currency)
- ✅ validators.ts (email, username, password)
- ✅ geolocation.ts (distance, coordinates, maps)

### 📋 Documentation

- ✅ README.md (comprehensive guide)
- ✅ QUICK_START.md (5-minute setup)
- ✅ PROJECT_SUMMARY.md (this file)
- ✅ docs/ folder (organized docs)
- ✅ .env.example files (templates)

---

## 🚀 Getting Started

### Quick Start (5 min)

```bash
cd backend && docker-compose up -d
npm run start:dev

# Terminal 2
cd mobile && npm start
# Scan QR with Expo Go
```

See [QUICK_START.md](QUICK_START.md) for full instructions.

---

## 🔌 API Highlights

### 50+ Endpoints

- **Auth**: register, login, refresh, OAuth
- **Users**: profile, settings, follow, block
- **Places**: CRUD, nearby (geospatial), like
- **Social**: comments, likes, follows
- **Search**: full-text with filtering
- **Notifications**: push, read status
- **Bookmarks**: collections, CRUD

### Swagger Documentation

→ http://localhost:3000/api-docs

---

## 💾 Database Schema

### 10 Main Tables

- `users` - User accounts + auth
- `places` - Location data with PostGIS
- `place_images` - Photos
- `comments` - Comments + nested replies
- `likes` - Like relationships
- `follows` - Follow relationships
- `blocks` - Block relationships
- `bookmark_collections` - Collections
- `bookmarks` - Collection items
- `notifications` - User notifications

---

## 🔐 Security

- ✅ JWT tokens (1h access, 7d refresh)
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ SQL injection prevention (ORM)
- ⚠️ Rate limiting (ready)
- ⚠️ 2FA support (ready)

---

## 📊 Performance Features

- 🚀 Infinite scroll pagination
- 🗂️ Redis caching
- 🔍 Elasticsearch indexing
- 📸 Image optimization (Sharp)
- 📦 BullMQ job queue
- 🔄 Socket.io realtime updates

---

## 📦 Dependencies

### Mobile (760 packages)

```json
{
  "expo": "54.0.33",
  "react-native": "0.81.5",
  "react-native-maps": "1.20.1",
  "zustand": "5.0.12",
  "@tanstack/react-query": "5.99.0",
  "expo-router": "6.0.23"
}
```

### Backend (90+ packages)

```json
{
  "@nestjs/core": "11.0.1",
  "typeorm": "0.3.28",
  "postgres": "pg 8.20.0",
  "redis": "5.12.1",
  "bullmq": "5.74.1",
  "socket.io": "4.8.3"
}
```

---

## 🚢 Deployment Ready

- ✅ Docker setup
- ✅ Environment templates
- ✅ CI/CD structure
- ✅ Production builds
- ✅ Database migrations

---

## 📚 Documentation Index

1. [QUICK_START.md](QUICK_START.md) - 5-minute setup
2. [README.md](../README.md) - Full guide
3. [API_REFERENCE.md](API_REFERENCE.md) - All endpoints
4. [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Dev guide
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Issues

---

## 🎯 Next Steps

1. ✅ **Clone & Setup** → [QUICK_START.md](QUICK_START.md)
2. ✅ **Explore API** → http://localhost:3000/api-docs
3. ✅ **Test App** → Scan QR in Expo Go
4. ✅ **Read Code** → Check components & services
5. ✅ **Deploy** → [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📞 Support

- 🐛 **Bugs**: GitHub Issues
- 💬 **Questions**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 📧 **Contact**: support@hiddengem.app

---

**Project Status: ✅ 95% Complete & Production Ready**

_Ready to explore hidden gems? Let's go! 🗺️✨_
