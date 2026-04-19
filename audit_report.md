# 🔍 Báo cáo Kiểm tra Code vs Yêu cầu Project

Đối chiếu toàn bộ code hiện tại với [hidden-gem-project-prompt.md](file:///f:/hiden_gem_moblie/hidden-gem-project-prompt.md)

---

## 1. Cấu trúc thư mục (Section 3)

| Yêu cầu | Hiện trạng | Trạng thái |
|----------|-----------|:----------:|
| `mobile/app/(auth)/login.tsx` | ✅ Có | ✅ |
| `mobile/app/(auth)/register.tsx` | ✅ Có | ✅ |
| `mobile/app/(auth)/forgot-password.tsx` | ✅ Có | ✅ |
| `mobile/app/(tabs)/index.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/(tabs)/map.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/(tabs)/search.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/(tabs)/notifications.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/(tabs)/profile.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/place/[id].tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/place/create.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/place/comments/[id].tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/user/[id].tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/user/following.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/bookmarks/index.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/app/settings/index.tsx` | ✅ Có | ✅ |
| `mobile/app/settings/edit-profile.tsx` | ✅ Có, kết nối API | ✅ |
| `mobile/components/` | ✅ Có (4 components) | ✅ |
| `mobile/hooks/` | ✅ Có (5 hooks) | ✅ |
| `mobile/stores/` | ✅ Có (authStore.ts) | ✅ |
| `mobile/services/` | ✅ Có (api.ts) | ✅ |
| `mobile/constants/` | ✅ Có (theme.ts) | ✅ |
| `backend/src/auth/` | ✅ Có | ✅ |
| `backend/src/users/` | ✅ Có | ✅ |
| `backend/src/places/` | ✅ Có | ✅ |
| `backend/src/social/` | ✅ Có | ✅ |
| `backend/src/bookmarks/` | ✅ Có | ✅ |
| `backend/src/notifications/` | ✅ Có | ✅ |
| `backend/src/media/` | ❌ **Thiếu** - Chưa có module riêng | ⚠️ |
| `backend/src/search/` | ❌ **Thiếu** - Chưa có module riêng | ⚠️ |
| `backend/src/admin/` | ❌ **Thiếu** - Chưa có Admin panel | ⚠️ |
| `backend/docker-compose.yml` | ✅ Có | ✅ |

> [!WARNING]
> **3 module backend thiếu**: `media/`, `search/`, `admin/`. Tuy nhiên, chức năng upload ảnh đang được xử lý inline trong `PlacesController` và `UsersController`. Search API chưa có endpoint riêng ở backend. Admin panel chưa được triển khai.

---

## 2. Tech Stack (Section 2)

### Mobile Frontend ✅

| Công nghệ | Yêu cầu | Hiện trạng |
|-----------|---------|:----------:|
| React Native + Expo SDK 51+ | ✅ | ✅ |
| Expo Router (file-based) | ✅ | ✅ |
| React Native Maps | ✅ | ✅ |
| Expo Location | ✅ | ✅ |
| Expo Image Picker | ✅ | ✅ |
| Expo Notifications | ❌ Chưa tích hợp thực | ⚠️ |
| Expo Camera | ❌ Import nhưng chưa dùng | ⚠️ |
| Zustand | ✅ (authStore) | ✅ |
| React Query (TanStack) | ✅ (5 custom hooks) | ✅ |
| Axios | ✅ (api.ts) | ✅ |
| React Native Reanimated | ❌ Chưa dùng animations | ⚠️ |
| NativeWind | ❌ Dùng StyleSheet thay vì NativeWind | ⚠️ |

> [!NOTE]
> **NativeWind**: Prompt yêu cầu NativeWind nhưng code dùng `StyleSheet.create()` thuần. Đây KHÔNG phải lỗi - cả 2 approach đều hợp lệ, nhưng nếu cần NativeWind thì phải refactor styling.

### Backend ✅ (phần lớn)

| Công nghệ | Yêu cầu | Hiện trạng |
|-----------|---------|:----------:|
| Node.js + NestJS | ✅ | ✅ |
| REST API | ✅ | ✅ |
| Socket.io (realtime) | ❌ **Chưa triển khai** | ❌ |
| JWT + OAuth2 (Google) | ✅ JWT hoàn chỉnh, Google mock | ✅ |
| Apple Sign-In | ❌ Chưa triển khai | ❌ |
| BullMQ + Redis | ❌ Redis config có nhưng BullMQ chưa tích hợp | ⚠️ |
| Multer + Sharp | Multer có, Sharp chưa | ⚠️ |
| AWS S3 + CloudFront | ❌ Upload local (`/uploads/`) | ⚠️ |
| TypeORM | ✅ (thay Prisma) | ✅ |

### Database

| Công nghệ | Yêu cầu | Hiện trạng |
|-----------|---------|:----------:|
| PostgreSQL + PostGIS | ✅ Docker image `postgis/postgis:15-3.3` | ✅ |
| PostGIS geo queries | ⚠️ Entity dùng `latitude/longitude` thay vì `GEOGRAPHY(POINT)` | ⚠️ |
| Redis | ✅ Docker service có | ✅ |
| Elasticsearch | ✅ Docker service có, **module chưa có** | ⚠️ |

---

## 3. Tính năng Màn hình (Section 4)

### Dev A – Khám phá & Bản đồ

| Tính năng | Yêu cầu | Hiện trạng | Trạng thái |
|-----------|---------|-----------|:----------:|
| Home: Infinite scroll | Có | ⚠️ FlatList nhưng chưa onEndReached pagination | ⚠️ |
| Home: Filter danh mục/khu vực | ✅ | ✅ Category filter chips | ✅ |
| Home: Pull-to-refresh | ✅ | ✅ RefreshControl | ✅ |
| Home: Card địa điểm | ✅ | ✅ PlaceCard component | ✅ |
| Map: Markers | ✅ | ✅ Custom emoji markers | ✅ |
| Map: Cluster khi zoom out | ❌ | ❌ **Chưa có cluster** | ❌ |
| Map: Preview card khi tap | ✅ | ✅ | ✅ |
| Map: GPS vị trí | ✅ | ✅ expo-location | ✅ |
| Search: Full-text search | ✅ | ⚠️ Frontend filter only, backend search module thiếu | ⚠️ |
| Search: Gợi ý realtime | ✅ | ⚠️ Có trending tags, chưa có gợi ý từ API | ⚠️ |
| Search: Lịch sử | ✅ | ⚠️ Mock data, chưa persist | ⚠️ |
| Search: Filter nâng cao | ✅ | ✅ Category filter | ✅ |
| Detail: Gallery ảnh | ✅ | ✅ ScrollView paginated | ✅ |
| Detail: Like/Bookmark | ✅ | ✅ Optimistic updates | ✅ |
| Detail: Mini map | ✅ | ⚠️ Có placeholder, chưa hiển thị map thật | ⚠️ |
| Detail: Cuộn bình luận | ✅ | ✅ Link tới comments screen | ✅ |
| Detail: Báo cáo | ✅ | ✅ Nút báo cáo có sẵn | ✅ |

### Dev B – Mạng xã hội & Đăng bài

| Tính năng | Yêu cầu | Hiện trạng | Trạng thái |
|-----------|---------|-----------|:----------:|
| Create: Upload 10 ảnh | ✅ | ✅ Limit 10, real ImagePicker | ✅ |
| Create: Chọn vị trí trên map | ✅ | ⚠️ Nút placeholder, chưa mở map picker | ⚠️ |
| Create: Tag danh mục | ✅ | ✅ Category chips + tags input | ✅ |
| Create: Preview | ✅ | ✅ Image preview thumbnails | ✅ |
| Create: Draft | ❌ | ❌ **Chưa có draft** | ❌ |
| Comments: Nested reply | ✅ | ✅ Có replies array + reply UI | ✅ |
| Comments: Like comment | ✅ | ✅ useLikeComment hook | ✅ |
| Comments: Tag người dùng | ❌ | ❌ **Chưa có @mention** | ❌ |
| Comments: Xóa/Báo cáo | ✅ | ⚠️ Có API deleteComment, chưa có UI | ⚠️ |
| Comments: Input realtime (Socket.io) | ❌ | ❌ **Socket.io chưa có** | ❌ |
| Notifications: List hoạt động | ✅ | ✅ Đầy đủ type icons | ✅ |
| Notifications: Đánh dấu đọc | ✅ | ✅ useMarkAsRead | ✅ |
| Notifications: Xóa | ✅ | ✅ useDeleteNotification | ✅ |
| Notifications: Tab tất cả/chưa đọc | ✅ | ✅ | ✅ |
| Notifications: Push notification | ❌ | ❌ **FCM/APNs chưa tích hợp** | ❌ |
| Following: Danh sách | ✅ | ✅ useFollowing/useFollowers | ✅ |
| Following: Gợi ý | ❌ | ❌ **Chưa có suggest** | ❌ |
| Following: Feed từ người follow | ❌ | ❌ **Chưa filter feed** | ❌ |
| Following: Block | ✅ | ✅ API blockUser | ✅ |

### Dev C – Hồ sơ & Cá nhân hóa

| Tính năng | Yêu cầu | Hiện trạng | Trạng thái |
|-----------|---------|-----------|:----------:|
| Profile: Ảnh đại diện | ✅ | ✅ UserAvatar component | ✅ |
| Profile: Bio | ✅ | ✅ | ✅ |
| Profile: Grid bài | ✅ | ✅ Grid layout | ✅ |
| Profile: Tab bài đăng/lưu | ✅ | ✅ Posts/Saved tabs | ✅ |
| Profile: Nút follow | ✅ | ✅ useToggleFollow | ✅ |
| Bookmark: Tạo collection | ✅ | ✅ Modal + useCreateCollection | ✅ |
| Bookmark: Lưu/bỏ lưu | ✅ | ✅ addPlace/removePlace hooks | ✅ |
| Bookmark: Share collection | ❌ | ❌ **Chưa có** | ❌ |
| Edit: Đổi ảnh | ✅ | ✅ ImagePicker + useUpdateAvatar | ✅ |
| Edit: Username/Bio/City | ✅ | ✅ Form fields | ✅ |
| Edit: Đổi mật khẩu | ❌ | ❌ **Settings có nút, chưa có API** | ❌ |
| Settings: Push notification toggle | ✅ | ✅ Switch UI | ✅ |
| Settings: Quyền riêng tư | ✅ | ✅ Private account switch | ✅ |
| Settings: Danh sách chặn | ✅ | ⚠️ Nút có, chưa có screen | ⚠️ |
| Settings: Theme | ✅ | ✅ Dark mode switch | ✅ |
| Settings: Xóa tài khoản | ✅ | ✅ Alert confirm | ✅ |

---

## 4. API Endpoints (Section 4)

### Dev A APIs

| Endpoint | Yêu cầu | Frontend (api.ts) | Backend Controller | Trạng thái |
|----------|---------|:-:|:-:|:----------:|
| `GET /places?lat=&lng=&radius=&category=&page=` | ✅ | ✅ `placesAPI.getAll` | ✅ `PlacesController.findAll` | ✅ |
| `GET /places/:id` | ✅ | ✅ `placesAPI.getById` | ✅ `PlacesController.findOne` | ✅ |
| `GET /places/nearby` | ✅ | ✅ `placesAPI.getNearby` | ✅ `PlacesController.findNearby` | ✅ |
| `GET /search?q=&filters=` | ✅ | ✅ `searchAPI.search` | ❌ **Backend chưa có** | ⚠️ |
| `POST /places/:id/like` | ✅ | ✅ `placesAPI.toggleLike` | ✅ `PlacesController.toggleLike` | ✅ |
| `POST /places/:id/bookmark` | ✅ | ❌ **Thiếu trong api.ts** | ❌ **Thiếu endpoint** | ❌ |

### Dev B APIs

| Endpoint | Yêu cầu | Frontend (api.ts) | Backend Controller | Trạng thái |
|----------|---------|:-:|:-:|:----------:|
| `POST /places` (tạo + upload) | ✅ | ✅ `placesAPI.create` | ✅ `PlacesController.create` | ✅ |
| `GET /places/:id/comments` | ✅ | ✅ `socialAPI.getComments` | ✅ `SocialController.getPlaceComments` | ✅ |
| `POST /places/:id/comments` | ✅ | ✅ `socialAPI.createComment` | ✅ `SocialController.createComment` | ✅ |
| `POST /comments/:id/like` | ✅ | ✅ `socialAPI.likeComment` | ✅ `SocialController.likeComment` | ✅ |
| `DELETE /comments/:id` | ✅ | ✅ `socialAPI.deleteComment` | ✅ `SocialController.deleteComment` | ✅ |
| `GET /notifications` | ✅ | ✅ `notificationsAPI.getAll` | ✅ `NotificationsController.getNotifications` | ✅ |
| `PATCH /notifications/read` | ✅ | ✅ `notificationsAPI.markAsRead` | ✅ `NotificationsController.markAsRead` | ✅ |
| `POST /users/:id/follow` | ✅ | ✅ `socialAPI.followUser` | ✅ `SocialController.followUser` | ✅ |
| `DELETE /users/:id/follow` | ✅ | ✅ `socialAPI.unfollowUser` | ✅ `SocialController.unfollowUser` | ✅ |
| `GET /users/:id/followers` | ✅ | ✅ `socialAPI.getFollowers` | ✅ `SocialController.getFollowers` | ✅ |
| `GET /users/:id/following` | ✅ | ✅ `socialAPI.getFollowing` | ✅ `SocialController.getFollowing` | ✅ |

### Dev C APIs

| Endpoint | Yêu cầu | Frontend (api.ts) | Backend Controller | Trạng thái |
|----------|---------|:-:|:-:|:----------:|
| `GET /users/:id` | ✅ | ✅ `usersAPI.getProfile` | ✅ `UsersController.getUser` | ✅ |
| `PATCH /users/me` | ✅ | ✅ `usersAPI.updateProfile` | ✅ `UsersController.updateProfile` | ✅ |
| `POST /users/me/avatar` | ✅ | ✅ `usersAPI.updateAvatar` | ✅ `UsersController.updateAvatar` | ✅ |
| `GET /users/me/bookmarks` | ✅ | ✅ `bookmarksAPI.getCollections` | ✅ `BookmarksController.getMyCollections` | ✅ |
| `POST /bookmarks/collections` | ✅ | ✅ `bookmarksAPI.createCollection` | ✅ `BookmarksController.createCollection` | ✅ |
| `POST /bookmarks/collections/:id/places` | ✅ | ✅ `bookmarksAPI.addPlace` | ✅ `BookmarksController.addPlace` | ✅ |
| `DELETE /bookmarks/collections/:id/places/:placeId` | ✅ | ✅ `bookmarksAPI.removePlace` | ✅ `BookmarksController.removePlace` | ✅ |
| `GET /users/me/settings` | ✅ | ❌ **Thiếu** | ❌ **Thiếu** | ❌ |
| `PATCH /users/me/settings` | ✅ | ❌ **Thiếu** | ❌ **Thiếu** | ❌ |
| `POST /users/:id/block` | ✅ | ✅ `usersAPI.blockUser` | ✅ `UsersController.blockUser` | ✅ |

---

## 5. Database Schema (Section 5)

| Table | Schema yêu cầu | Entity hiện tại | Trạng thái |
|-------|----------------|----------------|:----------:|
| `users` | ✅ | ✅ `User` entity | ✅ |
| `places` | `GEOGRAPHY(POINT, 4326)` | ⚠️ `latitude/longitude` float riêng biệt | ⚠️ |
| `place_images` | ✅ | ✅ `PlaceImage` entity | ✅ |
| `likes` | ✅ | ✅ `Like` entity | ✅ |
| `comments` | ✅ (có parent_id nested) | ✅ `Comment` entity | ✅ |
| `follows` | ✅ | ✅ `Follow` entity | ✅ |
| `bookmark_collections` | ✅ | ✅ `BookmarkCollection` entity | ✅ |
| `bookmarks` | ✅ | ✅ `Bookmark` entity | ✅ |
| `notifications` | ✅ | ✅ `Notification` entity | ✅ |

> [!IMPORTANT]
> **PostGIS**: Schema yêu cầu `GEOGRAPHY(POINT, 4326)` cho `places.location`, nhưng entity dùng 2 column `latitude`/`longitude` riêng. Điều này vẫn hoạt động nhưng **không tận dụng được PostGIS geo indexing** cho nearby queries hiệu quả. Backend `findNearby` có thể đang dùng simple distance calculation thay vì `ST_DWithin`.

---

## 6. Backend Setup (Section 7)

| Item | Yêu cầu | Hiện trạng | Trạng thái |
|------|---------|-----------|:----------:|
| Docker Compose (Postgres + PostGIS) | ✅ | ✅ `postgis/postgis:15-3.3` | ✅ |
| Docker Compose (Redis) | ✅ | ✅ `redis:7-alpine` | ✅ |
| Docker Compose (Elasticsearch) | ✅ | ✅ `elasticsearch:8.11.0` | ✅ |
| .env file | ✅ | ✅ Đầy đủ biến | ✅ |
| Backend Dockerfile | ❌ | ❌ **Chưa có** | ❌ |

---

## 7. Login - Bug tiềm ẩn

> [!WARNING]
> **Unfolllow bug**: Trong [social.controller.ts](file:///f:/hiden_gem_moblie/backend/src/social/social.controller.ts#L68-L73), hàm `unfollowUser` gọi `this.socialService.followUser()` thay vì `unfollowUser()`. Đây là **bug logic** - unfollow sẽ tạo follow mới thay vì xóa.

```diff
// social.controller.ts line 72
- return this.socialService.followUser(followerId, followingId);
+ return this.socialService.unfollowUser(followerId, followingId);
```

---

## 8. Tổng kết MVP Checklist (Section 10)

### Dev A ✅ (4/5)
- [x] Home Feed với infinite scroll (⚠️ thiếu pagination thật)
- [x] Bản đồ với markers (❌ thiếu cluster)
- [x] Tìm kiếm full-text + geo (⚠️ local filter only)
- [x] Màn chi tiết địa điểm
- [ ] ❌ Place Service API + PostGIS setup (dùng lat/lng thay vì PostGIS)

### Dev B ✅ (4/5)
- [x] Form đăng địa điểm + upload ảnh
- [x] Màn bình luận (❌ chưa realtime Socket.io)
- [x] Màn thông báo (❌ chưa push notification)
- [x] Màn following/follower
- [x] Social Service API

### Dev C ✅ (4/5)
- [x] Màn hồ sơ cá nhân
- [x] Màn bookmark/collection
- [x] Màn chỉnh sửa profile
- [x] Màn cài đặt + quyền riêng tư
- [ ] ❌ User Service API (thiếu settings endpoint)

### Chung (2/5)
- [x] Auth: đăng ký, đăng nhập, OAuth Google (mock)
- [x] Docker Compose local dev
- [ ] ❌ API Gateway + JWT middleware (JWT guard có, gateway chưa)
- [ ] ❌ CI/CD GitHub Actions
- [ ] ❌ Deploy backend lên Railway/Render

---

## 🔴 7 Vấn đề cần fix ngay

| # | Mức độ | Vấn đề | File cần sửa |
|:-:|:------:|--------|-------------|
| 1 | 🔴 **Bug** | `unfollowUser` gọi sai `followUser` | [social.controller.ts](file:///f:/hiden_gem_moblie/backend/src/social/social.controller.ts#L72) |
| 2 | 🟡 **Thiếu** | Backend Search module chưa có | Tạo `backend/src/search/` |
| 3 | 🟡 **Thiếu** | Settings API (`GET/PATCH /users/me/settings`) | Thêm vào `users.controller.ts` + `api.ts` |
| 4 | 🟡 **Thiếu** | `POST /places/:id/bookmark` endpoint | Thêm vào places hoặc bookmarks controller |
| 5 | 🟡 **Thiếu** | PostGIS `GEOGRAPHY(POINT)` thay vì lat/lng | Refactor `place.entity.ts` |
| 6 | 🟢 **Tính năng** | Map marker clustering | Cần `react-native-maps` clustering |
| 7 | 🟢 **Tính năng** | Socket.io realtime comments | Tạo WebSocket gateway |

---

## ✅ Kết luận

**Tổng thể: ~75% MVP hoàn thành**

- **Frontend**: ~85% - Tất cả 16 screens có, kết nối API + mock fallback, shared components, auth flow
- **Backend**: ~70% - 6/9 module có, API endpoints phần lớn khớp prompt, thiếu search/media/admin
- **Infra**: ~50% - Docker Compose OK, thiếu CI/CD, Dockerfile, deploy

**Ưu tiên fix**: Bug #1 (unfollowUser) > #3 (settings API) > #4 (bookmark endpoint) > #2 (search module)
