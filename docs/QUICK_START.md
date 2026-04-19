# 🚀 Quick Start (5 Minutes)

Khởi động Hidden Gem chỉ trong 5 phút!

---

## 📋 Prerequisites (Chuẩn Bị)

✅ Node.js 18+ - [Download](https://nodejs.org/)
✅ Docker Desktop - [Download](https://docker.com/download)
✅ Expo Go - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
✅ Git

**Kiểm tra:**

```bash
node --version      # v18.0.0+
docker --version    # Docker 20+
```

---

## ⚡ 5-Step Setup

### Step 1️⃣: Clone Repo (1 min)

```bash
git clone https://github.com/yourusername/hidden-gem-mobile.git
cd hidden-gem-mobile

# Cài dependencies
npm install --workspaces
```

### Step 2️⃣: Setup Environment (1 min)

```bash
# Backend
cd backend
cp .env.example .env
# Không cần sửa gì, mặc định đã đúng cho local dev
cd ../

# Mobile
cd mobile
cp .env.example .env
# Không cần sửa gì, mặc định là localhost
cd ../
```

### Step 3️⃣: Start Database (1 min)

```bash
cd backend
docker-compose up -d

# Chờ 20 giây cho database khởi động...
sleep 20
echo "✅ Database ready!"
```

### Step 4️⃣: Start Backend (1 min)

```bash
# Terminal mới hoặc tab mới
cd backend
npm run start:dev

# Chờ cho đến khi thấy:
# [NestFactory] Application successfully started
# 🚀 Hidden Gem API running on http://localhost:3000
```

**Kiểm tra:** http://localhost:3000/api-docs → Swagger UI

### Step 5️⃣: Start Mobile (1 min)

```bash
# Terminal mới hoặc tab mới
cd mobile
npm start

# Quét QR code bằng Expo Go app!
```

---

## ✨ You're Done!

### 🎉 Congratulations!

- ✅ Backend chạy tại **http://localhost:3000**
- ✅ API Docs tại **http://localhost:3000/api-docs**
- ✅ Mobile app chạy trên điện thoại

---

## 🧪 Test It Out

### 1. Đăng Ký

```
Mobile app → (auth) → Register
Username: testuser
Email: test@example.com
Password: Test@123
```

### 2. Xem API Swagger

```
Browser → http://localhost:3000/api-docs
Click "Authorize" 🔒
Paste JWT token from login
```

### 3. Tạo Địa Điểm

```
Mobile app → + button
Select location
Upload photo
Post!
```

---

## 🆘 Quick Troubleshooting

### ❌ "Cannot connect to database"

```bash
# Check Docker
docker-compose ps

# Restart
docker-compose down
docker-compose up -d
sleep 20
```

### ❌ "Mobile can't connect to backend"

```bash
# Get your machine IP
ipconfig (Windows) / ifconfig (Mac/Linux)

# Update mobile/.env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api

# Restart mobile
npm start -- --clear
```

### ❌ "Module not found error"

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

---

## 📚 Next Steps

1. **Read Documentation** → [docs/README.md](../docs/README.md)
2. **Explore API** → [API_REFERENCE.md](API_REFERENCE.md)
3. **Start Developing** → [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
4. **Need Help?** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎓 Useful Commands

```bash
# Backend development
cd backend
npm run start:dev          # Start with auto-reload
npm run build              # Build for production
npm test                   # Run tests
npm run test:e2e          # E2E tests
npm run lint              # Check code style

# Mobile development
cd mobile
npm start                  # Start development
npm start -- --web        # Run on web
npm start -- --ios        # Run on iOS
npm start -- --android    # Run on Android
npm start -- --clear      # Clear cache
```

---

## 🔗 Useful Links

- **Backend**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api-docs
- **PostgreSQL UI (pgAdmin)**: http://localhost:5050
- **Redis UI**: http://localhost:8090
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

---

**Happy Coding! 🚀**
