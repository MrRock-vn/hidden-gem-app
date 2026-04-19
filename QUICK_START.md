# ⚡ Quick Start - 5 Phút

**Muốn demo ngay không?** Hãy làm theo đây!

---

## 🚀 Cách Nhanh Nhất - Chạy Backend với Docker

### Bước 1: Cài Docker

- Download từ: https://www.docker.com/products/docker-desktop
- Cài đặt và restart máy

### Bước 2: Chạy backend

```powershell
cd f:\hiden_gem_moblie
docker-compose up
```

**⏱️ Chờ 2-3 phút** cho services khởi động...

### Bước 3: Test API

```
Mở browser: http://localhost:3000/api-docs
```

✅ **Xong!** Bạn đang sử dụng Hidden Gem API!

---

## 🧪 Thử Features

### Từ Swagger UI (http://localhost:3000/api-docs):

1. **Đăng ký user**
   - Click "Auth" > "Register"
   - Nhấn "Try it out"
   - Nhập email + password
   - Nhấn "Execute"

2. **Đăng nhập**
   - Click "Auth" > "Login"
   - Dùng email/password từ bước 1
   - Copy access token

3. **Xem Places**
   - Click "Places" > "Get all places"
   - Nhấn "Execute"

4. **Tìm kiếm**
   - Click "Search" > "Search places"
   - Nhập query: "cafe"
   - Nhấn "Execute"

---

## 📱 Chạy Mobile (thêm 15 phút)

Backend vẫn chạy ở terminal 1:

```powershell
docker-compose up
```

Mở terminal 2 mới:

```powershell
cd f:\hiden_gem_moblie\mobile
npm start
# Nhấn 'w' để chạy web
```

Mở browser: `http://localhost:19006`

✅ **Xong!** Full app demo!

---

## ⚠️ Troubleshooting

### Docker không chạy?

```powershell
# Kiểm tra Docker
docker --version

# Nếu lỗi: Cài Docker Desktop
```

### Port 3000 đang bị dùng?

```powershell
# Tìm process
netstat -ano | findstr :3000

# Kill nó (thay PID)
taskkill /PID <PID> /F
```

### Backend không respond?

```powershell
# Kiểm tra logs
docker-compose logs backend

# Chờ thêm vài phút cho database khởi động
```

---

## 📚 Cần Giúp?

- **Đầy đủ hướng dẫn:** Xem `DEMO_READINESS_CHECK.md`
- **Setup chi tiết:** Xem `DEPLOYMENT_GUIDE.md`
- **API docs:** `http://localhost:3000/api-docs`

---

**🎉 Vậy là bạn sẵn sàng demo!**
