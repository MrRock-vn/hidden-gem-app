# 🗺️ HIDDEN GEM – Project Prompt

> Ứng dụng cộng đồng chia sẻ địa điểm ít người biết tại địa phương  
> Stack: **React Native + Expo Go** · **Node.js/NestJS** · **PostgreSQL + PostGIS**

---

## 1. Tổng quan dự án

Xây dựng ứng dụng mobile cho phép người dùng **đăng, khám phá và lưu lại** các địa điểm thú vị ít người biết (quán cà phê, góc chụp ảnh, món ăn ngon...) kết hợp mạng xã hội (like, comment, follow) với bản đồ thực tế.

---

## 2. Tech Stack

### Mobile (Frontend)
- **React Native** (với **Expo SDK 51+**)
- **Expo Go** – chạy thử trực tiếp trên điện thoại không cần build
- **Expo Router** (file-based routing, tương tự Next.js)
- **React Native Maps** hoặc **expo-maps** (Google Maps / MapBox)
- **Expo Location** – lấy GPS người dùng
- **Expo Image Picker** – chụp/chọn ảnh từ thư viện
- **Expo Notifications** – push notification (FCM / APNs)
- **Expo Camera** – chụp ảnh địa điểm
- **Zustand** hoặc **Redux Toolkit** – state management
- **React Query (TanStack Query)** – data fetching & caching
- **Axios** – HTTP client
- **React Native Reanimated** – animation mượt
- **NativeWind** (Tailwind CSS cho React Native) – styling

### Backend
- **Node.js + NestJS** (TypeScript)
- **REST API** + **Socket.io** (realtime comment/notification)
- **JWT** + **OAuth2** (Google, Apple Sign-In)
- **BullMQ + Redis** – job queue (resize ảnh, gửi thông báo)
- **Multer + Sharp** – upload & xử lý ảnh
- **AWS S3 + CloudFront** – lưu trữ media

### Database
- **PostgreSQL** + **PostGIS** – dữ liệu chính + geo query
- **Redis** – cache, session, rate limiting
- **Elasticsearch** – full-text search + geo bounding box

### DevOps
- **Docker + Docker Compose** – local development
- **GitHub Actions** – CI/CD pipeline
- **AWS EC2 / Railway / Render** – hosting backend

---

## 3. Cấu trúc thư mục

```
hidden-gem/
├── mobile/                        # Expo React Native App
│   ├── app/                       # Expo Router (file-based routing)
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Home Feed (Dev A)
│   │   │   ├── map.tsx            # Bản đồ (Dev A)
│   │   │   ├── search.tsx         # Tìm kiếm (Dev A)
│   │   │   ├── notifications.tsx  # Thông báo (Dev B)
│   │   │   └── profile.tsx        # Hồ sơ (Dev C)
│   │   ├── place/
│   │   │   ├── [id].tsx           # Chi tiết địa điểm (Dev A)
│   │   │   ├── create.tsx         # Đăng địa điểm (Dev B)
│   │   │   └── comments/[id].tsx  # Bình luận (Dev B)
│   │   ├── user/
│   │   │   ├── [id].tsx           # Xem profile người khác (Dev C)
│   │   │   └── following.tsx      # Danh sách follow (Dev B)
│   │   ├── bookmarks/
│   │   │   └── index.tsx          # Bookmark / Collection (Dev C)
│   │   └── settings/
│   │       ├── index.tsx          # Cài đặt (Dev C)
│   │       └── edit-profile.tsx   # Chỉnh sửa profile (Dev C)
│   ├── components/                # Shared UI components
│   ├── hooks/                     # Custom hooks
│   ├── stores/                    # Zustand stores
│   ├── services/                  # API services
│   ├── utils/
│   ├── constants/
│   ├── app.json                   # Expo config
│   └── babel.config.js
│
├── backend/                       # NestJS API
│   ├── src/
│   │   ├── auth/                  # JWT, OAuth
│   │   ├── users/                 # User Service
│   │   ├── places/                # Place Service + PostGIS
│   │   ├── social/                # Like, Comment, Follow
│   │   ├── media/                 # Upload, S3
│   │   ├── search/                # Elasticsearch
│   │   ├── notifications/         # FCM, APNs, Socket.io
│   │   ├── bookmarks/             # Collection
│   │   └── admin/                 # Admin Panel
│   ├── prisma/                    # Prisma ORM + migrations
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

## 4. Phân chia công việc

### Dev A – Khám phá & Bản đồ
**Screens:** Home Feed · Bản đồ · Tìm kiếm · Chi tiết địa điểm  
**Backend:** Place Service · Search Service · Elasticsearch · PostGIS

**Chi tiết màn hình:**

| Screen | Tính năng |
|--------|-----------|
| Home Feed | Infinite scroll, filter danh mục/khu vực, pull-to-refresh, card địa điểm |
| Bản đồ | MapBox markers, cluster khi zoom out, preview card khi tap, vị trí GPS |
| Tìm kiếm | Full-text search, gợi ý realtime, lịch sử, filter nâng cao, tag |
| Chi tiết địa điểm | Gallery ảnh, like/bookmark, mini map, cuộn bình luận, báo cáo |

**API cần xây dựng:**
```
GET    /places?lat=&lng=&radius=&category=&page=
GET    /places/:id
GET    /places/nearby
GET    /search?q=&filters=
POST   /places/:id/like
POST   /places/:id/bookmark
```

---

### Dev B – Mạng xã hội & Đăng bài
**Screens:** Đăng địa điểm · Bình luận · Thông báo · Theo dõi  
**Backend:** Social Service · Media Service · Notification Service · Socket.io

**Chi tiết màn hình:**

| Screen | Tính năng |
|--------|-----------|
| Đăng địa điểm | Upload 10 ảnh, chọn vị trí trên map, tag danh mục, preview, draft |
| Bình luận | Nested reply, like comment, tag người dùng, xóa/báo cáo, input realtime |
| Thông báo | List like/follow/comment, đánh dấu đọc, xóa, tab tất cả/chưa đọc |
| Theo dõi | Danh sách following/follower, gợi ý, feed từ người follow, block |

**API cần xây dựng:**
```
POST   /places              (tạo địa điểm + upload ảnh)
GET    /places/:id/comments
POST   /places/:id/comments
POST   /comments/:id/like
DELETE /comments/:id
GET    /notifications
PATCH  /notifications/read
POST   /users/:id/follow
DELETE /users/:id/follow
GET    /users/:id/followers
GET    /users/:id/following
```

---

### Dev C – Hồ sơ & Cá nhân hóa
**Screens:** Hồ sơ cá nhân · Bookmark/Collection · Chỉnh sửa profile · Cài đặt  
**Backend:** User Service · Bookmark Service · Admin Panel

**Chi tiết màn hình:**

| Screen | Tính năng |
|--------|-----------|
| Hồ sơ cá nhân | Ảnh đại diện, bio, grid bài, tab bài đăng/lưu, nút follow |
| Bookmark | Tạo/đặt tên collection, lưu/bỏ lưu địa điểm, share collection |
| Chỉnh sửa profile | Đổi ảnh, tên, username, bio, liên kết, thành phố, đổi mật khẩu |
| Cài đặt | Push notification, quyền riêng tư, danh sách chặn, theme, xóa tài khoản |

**API cần xây dựng:**
```
GET    /users/:id
PATCH  /users/me
POST   /users/me/avatar
GET    /users/me/bookmarks
POST   /bookmarks/collections
POST   /bookmarks/collections/:id/places
DELETE /bookmarks/collections/:id/places/:placeId
GET    /users/me/settings
PATCH  /users/me/settings
POST   /users/:id/block
```

---

## 5. Database Schema (chính)

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(50) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255),
  avatar_url  TEXT,
  bio         TEXT,
  city        VARCHAR(100),
  is_private  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Places
CREATE TABLE places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  location    GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS
  address     TEXT,
  tags        TEXT[],
  is_published BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Place Images
CREATE TABLE place_images (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id  UUID REFERENCES places(id) ON DELETE CASCADE,
  url       TEXT NOT NULL,
  order_idx INT DEFAULT 0
);

-- Likes
CREATE TABLE likes (
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id  UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

-- Comments
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id   UUID REFERENCES places(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES comments(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Bookmark Collections
CREATE TABLE bookmark_collections (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  name     VARCHAR(100) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE
);

-- Bookmarks
CREATE TABLE bookmarks (
  collection_id UUID REFERENCES bookmark_collections(id) ON DELETE CASCADE,
  place_id      UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, place_id)
);

-- Notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50),  -- like, comment, follow, reply
  actor_id   UUID REFERENCES users(id),
  place_id   UUID REFERENCES places(id),
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Setup dự án – Expo Go

### Bước 1: Cài đặt Expo
```bash
# Cài Node.js 18+ trước
npm install -g expo-cli

# Tạo project
npx create-expo-app mobile --template tabs
cd mobile
```

### Bước 2: Cài dependencies
```bash
# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens

# Maps & Location
npx expo install react-native-maps expo-location

# Camera & Media
npx expo install expo-image-picker expo-camera expo-file-system

# Notifications
npx expo install expo-notifications expo-device

# UI & Animation
npx expo install react-native-reanimated react-native-gesture-handler

# State & Data
npm install zustand @tanstack/react-query axios

# Styling
npm install nativewind
npm install --save-dev tailwindcss
```

### Bước 3: Cấu hình app.json
```json
{
  "expo": {
    "name": "Hidden Gem",
    "slug": "hidden-gem",
    "version": "1.0.0",
    "scheme": "hiddenGem",
    "plugins": [
      "expo-router",
      "expo-location",
      [
        "expo-image-picker",
        { "photosPermission": "Cho phép truy cập ảnh để đăng địa điểm" }
      ],
      [
        "expo-camera",
        { "cameraPermission": "Cho phép chụp ảnh địa điểm" }
      ],
      "expo-notifications"
    ],
    "android": {
      "config": {
        "googleMaps": { "apiKey": "YOUR_GOOGLE_MAPS_API_KEY" }
      }
    }
  }
}
```

### Bước 4: Chạy Expo Go
```bash
# Chạy development server
npx expo start

# Quét QR bằng app Expo Go trên điện thoại
# iOS: Camera app → quét QR
# Android: Expo Go app → quét QR
```

> **Lưu ý Expo Go:** Một số tính năng cần bare workflow (không dùng được Expo Go):  
> - Custom native modules  
> - In-app purchases  
> Nhưng Maps, Camera, Location, Notifications đều chạy được trên Expo Go ✅

---

## 7. Setup Backend

```bash
# Tạo NestJS project
npm i -g @nestjs/cli
nest new backend
cd backend

# Cài dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt passport-jwt bcrypt
npm install @nestjs/bull bull redis
npm install @aws-sdk/client-s3 multer sharp
npm install @elastic/elasticsearch socket.io
npm install prisma @prisma/client

# Chạy với Docker
docker-compose up -d
npm run start:dev
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: hiddenGem
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
```

---

## 8. Environment Variables

### mobile/.env
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
EXPO_PUBLIC_MAPBOX_TOKEN=your_token
```

### backend/.env
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hiddenGem
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=hidden-gem-media
AWS_REGION=ap-southeast-1
ELASTICSEARCH_URL=http://localhost:9200
GOOGLE_CLIENT_ID=your_google_client_id
APPLE_CLIENT_ID=your_apple_client_id
FCM_SERVER_KEY=your_fcm_key
```

---

## 9. Git Workflow

```bash
# Branch convention
main           # production
develop        # staging
feature/A-home-feed
feature/A-map
feature/A-search
feature/A-place-detail
feature/B-create-place
feature/B-comments
feature/B-notifications
feature/B-following
feature/C-profile
feature/C-bookmarks
feature/C-edit-profile
feature/C-settings

# Commit convention
feat: thêm tính năng mới
fix: sửa bug
chore: cấu hình, dependencies
refactor: cải thiện code
```

---

## 10. Checklist MVP

### Dev A
- [ ] Home Feed với infinite scroll
- [ ] Bản đồ với markers + cluster
- [ ] Tìm kiếm full-text + geo
- [ ] Màn chi tiết địa điểm
- [ ] Place Service API + PostGIS setup

### Dev B
- [ ] Form đăng địa điểm + upload ảnh
- [ ] Màn bình luận + realtime Socket.io
- [ ] Màn thông báo + push notification
- [ ] Màn following/follower
- [ ] Social Service API

### Dev C
- [ ] Màn hồ sơ cá nhân
- [ ] Màn bookmark/collection
- [ ] Màn chỉnh sửa profile
- [ ] Màn cài đặt + quyền riêng tư
- [ ] User Service API

### Chung (cả nhóm)
- [ ] Auth: đăng ký, đăng nhập, OAuth Google
- [ ] Docker Compose local dev
- [ ] API Gateway + JWT middleware
- [ ] CI/CD GitHub Actions
- [ ] Deploy backend lên Railway/Render
