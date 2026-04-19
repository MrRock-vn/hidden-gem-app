# 🚀 Setup Guide - Hidden Gem App

## ⚠️ Important: node_modules is NOT included

Thư mục `node_modules` không được commit lên Git vì quá lớn. Khi clone, bạn cần cài dependencies.

---

## 📋 Prerequisites

Cài đặt những thứ sau trước khi bắt đầu:

1. **Node.js 18+** → [Download](https://nodejs.org/)
2. **Docker Desktop** → [Download](https://www.docker.com/products/docker-desktop)
3. **Git** → [Download](https://git-scm.com/)
4. **Expo Go** (trên điện thoại)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🔧 Step 1: Clone Repository

```bash
git clone https://github.com/MrRock-vn/hidden-gem-app.git
cd hidden-gem-app
```

---

## 📦 Step 2: Install Dependencies

### Backend

```bash
cd backend
npm install
cd ..
```

### Mobile

```bash
cd mobile
npm install
cd ..
```

---

## 🔐 Step 3: Setup Environment Variables

### Backend

```bash
cd backend

# Copy example file
cp .env.example .env

# Edit .env (optional - defaults should work)
# nano .env  (or use your editor)

cd ..
```

**Default .env values:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hiddenGem
JWT_SECRET=your_secret_key_here
```

### Mobile

```bash
cd mobile

# Copy example file
cp .env.example .env

# Edit .env - IMPORTANT: Set correct API URL
# nano .env  (or use your editor)

cd ..
```

**Important - Update API URL:**

```env
# Get your machine IP:
# Windows: ipconfig
# Mac/Linux: ifconfig

# Then set:
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:3000/api

# Example:
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

---

## 🐳 Step 4: Start Backend & Database

### Terminal 1 - Start Database Services

```bash
cd backend

# Start PostgreSQL, Redis, Elasticsearch
docker-compose up -d

# Wait 30 seconds for services to be ready
# Check status:
docker-compose ps
```

**Expected output:**
```
NAME                COMMAND                  SERVICE             STATUS
postgres            "docker-entrypoint.s…"   postgres            Up 30s
redis               "redis-server"           redis               Up 30s
elasticsearch       "/bin/tini -- /usr/l…"   elasticsearch       Up 30s
```

### Terminal 2 - Start Backend Server

```bash
cd backend

# Start NestJS development server
npm run start:dev
```

**Expected output:**
```
[Nest] 12345  - 01/15/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/15/2025, 10:30:02 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/15/2025, 10:30:02 AM     LOG [RoutesResolver] AppController {/api}:
[Nest] 12345  - 01/15/2025, 10:30:02 AM     LOG Listening on port 3000
```

✅ Backend is running at: **http://localhost:3000**
📚 Swagger API Docs: **http://localhost:3000/api-docs**

---

## 📱 Step 5: Start Mobile App

### Terminal 3 - Start Expo Development Server

```bash
cd mobile

# Start development server
npm start
```

**Expected output:**
```
Starting Expo server...
Tunnel ready.

To run the app with live reloading, choose one of the following:

  › Press 'i' to open iOS simulator
  › Press 'a' to open Android emulator
  › Press 'w' to open web
  › Press 'j' to open debugger
  › Press 'r' to reload app
  › Press 'q' to quit

Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### On Your Phone

1. **Open Expo Go app**
2. **Scan the QR code** shown in terminal
3. **Wait for app to load** (first time takes 1-2 minutes)
4. **App should open!** 🎉

---

## ✅ Verify Everything Works

### Backend

```bash
# Test API
curl http://localhost:3000/api

# Should return:
# {"message":"Welcome to Hidden Gem API"}
```

### Mobile

1. App should load without errors
2. You should see the home feed with 24 mock places
3. Try clicking on a place to see details
4. Try the category filter buttons

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if Docker containers are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Problem: "Mobile app shows blank screen"

**Solution:**
```bash
# 1. Check API URL in mobile/.env
cat mobile/.env | grep EXPO_PUBLIC_API_URL

# 2. Make sure it's your machine IP, not localhost
# Get IP:
# Windows: ipconfig
# Mac: ifconfig | grep inet

# 3. Update .env and restart
npm start -- --clear
```

### Problem: "Metro bundler error"

**Solution:**
```bash
# Clear cache
npm start -- --clear

# Or manually
rm -rf node_modules/.cache
rm -rf .expo
npm install
npm start
```

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>
```

### Problem: "Docker containers won't start"

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## 📁 Project Structure After Setup

```
hidden-gem-app/
├── backend/
│   ├── node_modules/          ← Created by npm install
│   ├── src/
│   ├── .env                   ← Created from .env.example
│   ├── docker-compose.yml
│   └── package.json
│
├── mobile/
│   ├── node_modules/          ← Created by npm install
│   ├── app/
│   ├── .env                   ← Created from .env.example
│   └── package.json
│
└── docs/
    ├── QUICK_START.md
    ├── PROJECT_SUMMARY.md
    └── ...
```

---

## 🎯 Next Steps

1. **Test the app** - Create a test account and explore
2. **Read documentation** - Check `docs/` folder
3. **Explore code** - Start with `mobile/app/(tabs)/index.tsx`
4. **Make changes** - Edit code and see hot reload
5. **Commit & push** - When ready, push to GitHub

---

## 📞 Need Help?

- Check `README.md` for full documentation
- Check `docs/` folder for detailed guides
- Open an issue on GitHub
- Check terminal output for error messages

---

**Happy coding! 🚀**
