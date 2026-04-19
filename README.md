# 🗺️ Hidden Gem

> Ứng dụng cộng đồng chia sẻ địa điểm ít người biết tại địa phương

## Tech Stack

### Mobile (Frontend)
- **React Native** + **Expo SDK 54** (Expo Go)
- **Expo Router** (file-based routing)
- **React Native Maps** (Google Maps)
- **Zustand** (state management)
- **TanStack React Query** (data fetching)
- **Axios** (HTTP client)

### Backend
- **NestJS** (TypeScript)
- **TypeORM** + **PostgreSQL** + **PostGIS**
- **JWT** authentication
- **Socket.io** (realtime)
- **Multer + Sharp** (image upload & processing)

### Infrastructure
- **Docker Compose** (PostgreSQL, Redis, Elasticsearch)
- **Local file storage** (development)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Expo Go app on your phone

### 1. Start Database Services
```bash
cd backend
docker-compose up -d
```

### 2. Start Backend
```bash
cd backend
cp .env.example .env   # Edit with your settings
npm install
npm run start:dev
```
Backend sẽ chạy tại `http://localhost:3000`

### 3. Start Mobile App
```bash
cd mobile
cp .env.example .env   # Edit with your API URL
npm install
npx expo start
```
Quét QR code bằng app Expo Go trên điện thoại

---

## 📁 Project Structure

```
hidden-gem/
├── mobile/                     # Expo React Native App
│   ├── app/                    # Expo Router (screens)
│   │   ├── (auth)/            # Login, Register, Forgot Password
│   │   ├── (tabs)/            # Home, Map, Search, Notifications, Profile
│   │   ├── place/             # Place Detail, Create, Comments
│   │   ├── user/              # User Profile, Following
│   │   ├── bookmarks/         # Bookmark Collections
│   │   └── settings/          # Settings, Edit Profile
│   ├── components/            # Shared UI components
│   ├── stores/                # Zustand stores
│   ├── services/              # API services
│   └── constants/             # Theme, colors, categories
│
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # JWT, OAuth, Guards
│   │   ├── users/             # User Service
│   │   ├── places/            # Place Service
│   │   ├── social/            # Comments, Follows, Likes
│   │   ├── bookmarks/         # Collections
│   │   └── notifications/     # Notifications
│   └── docker-compose.yml     # Database services
│
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Đăng xuất |

### Places
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places` | Danh sách (filter, pagination) |
| GET | `/api/places/nearby` | Gần đây (geo query) |
| GET | `/api/places/:id` | Chi tiết |
| POST | `/api/places` | Tạo mới + upload ảnh |
| POST | `/api/places/:id/like` | Like/Unlike |
| DELETE | `/api/places/:id` | Xóa |

### Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/:id/comments` | Bình luận |
| POST | `/api/places/:id/comments` | Tạo bình luận |
| DELETE | `/api/comments/:id` | Xóa bình luận |
| POST | `/api/users/:id/follow` | Follow/Unfollow |
| GET | `/api/users/:id/followers` | Followers |
| GET | `/api/users/:id/following` | Following |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Profile |
| PATCH | `/api/users/me` | Cập nhật profile |
| POST | `/api/users/me/avatar` | Upload avatar |
| POST | `/api/users/:id/block` | Block/Unblock |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/bookmarks` | Collections |
| POST | `/api/bookmarks/collections` | Tạo collection |
| POST | `/api/bookmarks/collections/:id/places` | Thêm địa điểm |
| DELETE | `/api/bookmarks/collections/:id/places/:placeId` | Xóa địa điểm |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Danh sách |
| PATCH | `/api/notifications/read` | Đánh dấu đã đọc |
| DELETE | `/api/notifications/:id` | Xóa |

---

## 📱 Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | Đăng nhập (email + Google) |
| Register | `/(auth)/register` | Đăng ký |
| Home Feed | `/(tabs)/` | Feed infinite scroll + filters |
| Map | `/(tabs)/map` | Bản đồ với markers |
| Search | `/(tabs)/search` | Tìm kiếm + trending |
| Notifications | `/(tabs)/notifications` | Thông báo |
| Profile | `/(tabs)/profile` | Hồ sơ cá nhân |
| Place Detail | `/place/[id]` | Chi tiết địa điểm |
| Create Place | `/place/create` | Đăng địa điểm mới |
| Comments | `/place/comments/[id]` | Bình luận |
| User Profile | `/user/[id]` | Profile người khác |
| Bookmarks | `/bookmarks/` | Bộ sưu tập |
| Settings | `/settings/` | Cài đặt |

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
