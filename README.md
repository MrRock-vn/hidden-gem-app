# 🗺️ Hidden Gem - Location-Based Social Discovery

> **Ứng dụng cộng đồng chia sẻ địa điểm ít người biết tại địa phương**
>
> Khám phá, chia sẻ và lưu lại những địa điểm thú vị, quán cà phê ẩn tại, góc chụp ảnh, và những bí mật địa phương qua mạng xã hội.

![Build Status](https://img.shields.io/badge/status-active-brightgreen)
![Node Version](https://img.shields.io/badge/node-18%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Features

✨ **Khám phá & Chia Sẻ**

- Duyệt bản đồ các địa điểm gần bạn
- Đăng địa điểm với ảnh, vị trí GPS, tags
- Tìm kiếm địa điểm theo tên, tag, danh mục

💬 **Mạng Xã Hội**

- Comment & trả lời (nested replies)
- Like địa điểm & comments
- Follow/unfollow người dùng
- @mention người khác trong bình luận

🔖 **Quản Lý Cá Nhân**

- Tạo collections để lưu địa điểm yêu thích
- Xem lịch sử bài đăng
- Chỉnh sửa hồ sơ & cài đặt
- Bật/tắt push notifications

📲 **Cross-Platform**

- Chạy trên iOS/Android via Expo Go (không cần build)
- Web version (React Native Web)
- Responsive design

---
## 👥 Thành viên nhóm

| STT | Họ và tên        | MSSV        | Vai trò     |
| --- | ---------------- | ----------- | ----------- |
| 1   | Nguyễn Công Sơn  | 23810310102 | Nhóm trưởng |
| 2   | Nguyễn Văn Quang | 23810310108 | Thành viên  |
| 3   | Nguyễn Văn Danh  | 23810310136 | Thành viên  |
---

## 🛠️ Tech Stack

### Frontend - Mobile/Web

- **React Native** + **Expo SDK 54**
- **Expo Router** - file-based routing
- **React Native Maps** - bản đồ interactiv
- **Zustand** - state management
- **TanStack React Query** - data fetching & caching
- **Axios** - HTTP client
- **React Native Reanimated** - smooth animations

### Backend - REST API

- **NestJS** (TypeScript) - scalable backend framework
- **PostgreSQL 15** + **PostGIS** - geospatial database
- **Redis** - caching & session management
- **Elasticsearch** - full-text search
- **BullMQ** - job queue (image processing, notifications)
- **Socket.io** - realtime comments
- **JWT + OAuth 2.0** - authentication
- **Sharp** - image optimization
- **AWS S3** - media storage (optional)

### Infrastructure

- **Docker Compose** - local development
- **PostgreSQL**, **Redis**, **Elasticsearch**, **Kibana**
- **GitHub Actions** - CI/CD ready

---

## 📋 Prerequisites

Trước khi bắt đầu, cài đặt những thứ sau:

- **Node.js 18+** → [Download](https://nodejs.org/)
- **Docker Desktop** → [Download](https://www.docker.com/products/docker-desktop)
- **Expo Go** (trên điện thoại) → [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) | [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Git** → [Download](https://git-scm.com/)

---

## 🚀 Quick Start (5 phút)

### Bước 1: Clone & Cài Đặt

```bash
# Clone repository
git clone https://github.com/yourusername/hidden-gem-mobile.git
cd hidden-gem-mobile

# Cài backend dependencies
cd backend
npm install
cd ../

# Cài mobile dependencies
cd mobile
npm install
cd ../
```

### Bước 2: Setup Environment Variables

```bash
# Backend
cd backend
cp .env.example .env
# Chỉnh sửa .env với settings của bạn (nếu cần)
cd ../

# Mobile
cd mobile
cp .env.example .env
# Sửa EXPO_PUBLIC_API_URL=http://localhost:3000/api
cd ../
```

### Bước 3: Start Backend & Database

```bash
cd backend

# Khởi động database services (PostgreSQL, Redis, Elasticsearch)
docker-compose up -d

# Chờ 30 giây cho database khởi động, sau đó:
npm run start:dev
```

✅ Backend chạy tại: **http://localhost:3000**
📚 Swagger Docs: **http://localhost:3000/api-docs**

### Bước 4: Start Mobile App

```bash
cd mobile
npm start
```

Sẽ thấy QR code ở terminal. **Quét bằng Expo Go app** trên điện thoại!

---

## 📁 Project Structure

```
hidden-gem-mobile/
├── 📚 docs/                    # Documentation
│   ├── PROJECT_SUMMARY.md
│   ├── FEATURE_SUMMARY.md
│   ├── QUICK_START.md
│   └── ...
│
├── 📱 mobile/                  # React Native + Expo
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Home Feed
│   │   │   ├── map.tsx         # Map view
│   │   │   ├── search.tsx      # Search
│   │   │   ├── notifications.tsx
│   │   │   └── profile.tsx     # User profile
│   │   ├── place/              # Place screens
│   │   │   ├── [id].tsx        # Detail
│   │   │   ├── create.tsx      # Create place
│   │   │   └── comments/[id].tsx
│   │   ├── user/               # User screens
│   │   ├── bookmarks/          # Collections
│   │   └── settings/           # Settings
│   │
│   ├── components/             # Shared UI
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   ├── services/               # API calls
│   ├── utils/                  # Helpers (✨ NEW)
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── geolocation.ts
│   │   └── index.ts
│   ├── constants/              # Theme, colors
│   ├── .env.example
│   ├── app.json
│   └── package.json
│
├── 🔧 backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT, OAuth
│   │   ├── users/              # User management
│   │   ├── places/             # Places + PostGIS
│   │   ├── social/             # Comments, Follows, Likes
│   │   ├── bookmarks/          # Collections
│   │   ├── notifications/      # Push notifications
│   │   ├── search/             # Elasticsearch
│   │   ├── media/              # Image upload
│   │   ├── realtime/           # Socket.io
│   │   ├── queue/              # BullMQ jobs
│   │   ├── config/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── .env.example
│   ├── docker-compose.yml      # PostgreSQL, Redis, ES
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── 🐳 docker-compose.yml       # Root orchestration
├── 📜 .github/                 # GitHub Actions CI/CD
├── 🔧 scripts/                 # Utilities
├── 📖 README.md                # This file
└── .gitignore

```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register          Đăng ký
POST   /api/auth/login             Đăng nhập
POST   /api/auth/refresh           Refresh token
POST   /api/auth/google            Google OAuth
```

### Users

```
GET    /api/users/me               Thông tin user hiện tại
GET    /api/users/:id              Xem profile
PATCH  /api/users/me               Cập nhật profile
POST   /api/users/me/avatar        Upload avatar
POST   /api/users/:id/follow       Follow user
DELETE /api/users/:id/follow       Unfollow user
GET    /api/users/:id/followers    Danh sách followers
GET    /api/users/:id/following    Danh sách following
```

### Places

```
GET    /api/places                 Danh sách (pagination, filter)
GET    /api/places/:id             Chi tiết
POST   /api/places                 Tạo mới
PUT    /api/places/:id             Cập nhật
DELETE /api/places/:id             Xóa
GET    /api/places/nearby          Gần bạn (geospatial)
POST   /api/places/:id/like        Like
DELETE /api/places/:id/like        Unlike
GET    /api/places/:id/comments    Comments
```

### Social

```
POST   /api/places/:id/comments           Comment
POST   /api/comments/:id/like             Like comment
DELETE /api/comments/:id                  Delete comment
GET    /api/notifications                 Thông báo
PATCH  /api/notifications/:id/read        Mark as read
```

### Bookmarks

```
GET    /api/bookmarks/collections         Danh sách collections
POST   /api/bookmarks/collections         Tạo collection
POST   /api/bookmarks/collections/:id/places/:placeId  Thêm vào collection
DELETE /api/bookmarks/collections/:id/places/:placeId  Xóa khỏi collection
```

### Search

```
GET    /api/search?q=...&filters=category  Full-text search
```

---

## 📖 Documentation

Xem chi tiết trong folder **`docs/`**:

- [**PROJECT_SUMMARY.md**](docs/PROJECT_SUMMARY.md) - Tổng quan dự án
- [**FEATURE_SUMMARY.md**](docs/FEATURE_SUMMARY.md) - Danh sách features
- [**QUICK_START.md**](docs/QUICK_START.md) - Hướng dẫn nhanh
- [**AWS_S3_SETUP.md**](docs/AWS_S3_SETUP.md) - Cấu hình S3 upload
- [**ELASTICSEARCH_SETUP.md**](docs/ELASTICSEARCH_SETUP.md) - Search setup
- [**DATABASE_MIGRATIONS.md**](docs/DATABASE_MIGRATIONS.md) - Database versioning

---

## 🔧 Development Commands

### Backend

```bash
cd backend

# Phát triển (auto-reload)
npm run start:dev

# Build production
npm build

# Chạy production
npm run start:prod

# Tests
npm test
npm run test:e2e

# Database
docker-compose up -d postgres     # Start database only
docker-compose down               # Stop all services
```

### Mobile

```bash
cd mobile

# Start development server
npm start

# Chạy trên web
npm start -- --web

# Chạy trên iOS simulator
npm start -- --ios

# Chạy trên Android emulator
npm start -- --android

# Clear cache & rebuild
npm start -- --clear

# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios
```

---

## 🐛 Troubleshooting

### Backend không connect tới database

```bash
# Kiểm tra containers chạy không
docker-compose ps

# Nếu postgres unhealthy
docker-compose logs postgres

# Khởi động lại
docker-compose down
docker-compose up -d
```

### Mobile app không kết nối backend

```bash
# Kiểm tra API_URL trong mobile/.env
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:3000/api

# Trên Windows, lấy IP:
ipconfig

# Sửa lại .env rồi khởi động lại
npm start
```

### Metro bundler cache lỗi

```bash
# Clear cache
npm start -- --clear

# Hoặc xóa thủ công
rm -rf node_modules/.cache
rm -rf .expo

# Cài lại
npm install
npm start
```

---

## 📱 Testing

### Test Registration & Login

1. **Web Browser**: http://localhost:8081
2. **Expo Go**: Quét QR code
3. Đăng ký tài khoản
4. Quét mã QR Google Maps (nếu cần)
5. Tạo địa điểm với ảnh

### API Testing với Swagger

→ http://localhost:3000/api-docs

- Copy JWT token từ login response
- Click "Authorize" 🔒
- Paste token vào
- Test các endpoints

---

## 🚀 Deployment

### Backend Deployment

#### Option 1: AWS EC2

```bash
# SSH vào instance
ssh -i key.pem ec2-user@instance-ip

# Clone & setup
git clone ...
cd backend
npm install

# Start with PM2
pm2 start npm --name "hidden-gem" -- run start:prod
```

#### Option 2: Railway/Render

```bash
# Kết nối GitHub repo
# Auto-deploy trên push
```

### Mobile Deployment

#### iOS

```bash
eas build --platform ios
```

#### Android

```bash
eas build --platform android --release
```

---

## 📊 Database Schema

### Key Tables

- `users` - User accounts
- `places` - Locations with PostGIS geometry
- `place_images` - Photos
- `likes` - Place/comment likes
- `comments` - Comments + nested replies
- `follows` - User relationships
- `bookmark_collections` - Collections
- `bookmarks` - Collection items
- `notifications` - User notifications

---

## 🔐 Security

- ✅ JWT tokens (1h access, 7d refresh)
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ SQL injection prevention (ORM)
- ✅ Rate limiting ready
- ⚠️ TODO: API key authentication
- ⚠️ TODO: 2FA support

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Contact & Support

- 📧 Email: support@hiddengem.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/hidden-gem-mobile/issues)
- 💬 Discord: [Join Community](https://discord.gg/your-server)

---

## 📈 Roadmap

- [ ] Video uploads
- [ ] Messaging system
- [ ] Advanced analytics
- [ ] AR features
- [ ] AI recommendations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA version

---

**Happy exploring! 🗺️✨**
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Đăng xuất |

### Places

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/api/places`          | Danh sách (filter, pagination) |
| GET    | `/api/places/nearby`   | Gần đây (geo query)            |
| GET    | `/api/places/:id`      | Chi tiết                       |
| POST   | `/api/places`          | Tạo mới + upload ảnh           |
| POST   | `/api/places/:id/like` | Like/Unlike                    |
| DELETE | `/api/places/:id`      | Xóa                            |

### Social

| Method | Endpoint                   | Description     |
| ------ | -------------------------- | --------------- |
| GET    | `/api/places/:id/comments` | Bình luận       |
| POST   | `/api/places/:id/comments` | Tạo bình luận   |
| DELETE | `/api/comments/:id`        | Xóa bình luận   |
| POST   | `/api/users/:id/follow`    | Follow/Unfollow |
| GET    | `/api/users/:id/followers` | Followers       |
| GET    | `/api/users/:id/following` | Following       |

### Users

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/users/:id`       | Profile          |
| PATCH  | `/api/users/me`        | Cập nhật profile |
| POST   | `/api/users/me/avatar` | Upload avatar    |
| POST   | `/api/users/:id/block` | Block/Unblock    |

### Bookmarks

| Method | Endpoint                                         | Description    |
| ------ | ------------------------------------------------ | -------------- |
| GET    | `/api/users/me/bookmarks`                        | Collections    |
| POST   | `/api/bookmarks/collections`                     | Tạo collection |
| POST   | `/api/bookmarks/collections/:id/places`          | Thêm địa điểm  |
| DELETE | `/api/bookmarks/collections/:id/places/:placeId` | Xóa địa điểm   |

### Notifications

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| GET    | `/api/notifications`      | Danh sách       |
| PATCH  | `/api/notifications/read` | Đánh dấu đã đọc |
| DELETE | `/api/notifications/:id`  | Xóa             |

---

## 📱 Screens

| Screen        | Route                   | Description                    |
| ------------- | ----------------------- | ------------------------------ |
| Login         | `/(auth)/login`         | Đăng nhập (email + Google)     |
| Register      | `/(auth)/register`      | Đăng ký                        |
| Home Feed     | `/(tabs)/`              | Feed infinite scroll + filters |
| Map           | `/(tabs)/map`           | Bản đồ với markers             |
| Search        | `/(tabs)/search`        | Tìm kiếm + trending            |
| Notifications | `/(tabs)/notifications` | Thông báo                      |
| Profile       | `/(tabs)/profile`       | Hồ sơ cá nhân                  |
| Place Detail  | `/place/[id]`           | Chi tiết địa điểm              |
| Create Place  | `/place/create`         | Đăng địa điểm mới              |
| Comments      | `/place/comments/[id]`  | Bình luận                      |
| User Profile  | `/user/[id]`            | Profile người khác             |
| Bookmarks     | `/bookmarks/`           | Bộ sưu tập                     |
| Settings      | `/settings/`            | Cài đặt                        |

---

## 🛡️ Environment Variables

### Backend (.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hiddenGem
JWT_SECRET=your_secret
```

### Mobile (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

---

## 📝 License

MIT
