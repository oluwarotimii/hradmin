# 📦 Femtech HR App - Deployment Package

This folder contains the production-ready build of the Femtech HR Application.

---

## 🚀 Quick Deploy to cPanel

### Step 1: Create Node.js App in cPanel
- **Node.js version:** 20.19.4
- **Application mode:** Production
- **Application root:** app.tripa.com.ng
- **Application URL:** https://app.tripa.com.ng
- **Startup file:** server.js

### Step 2: Upload These Files
Upload ALL of these to `/home/[username]/app.tripa.com.ng/`:

```
✅ server.js           - Entry point
✅ package.json        - Dependencies
✅ .env.production     - Environment template
✅ build/              - Compiled app (46 KB CSS, 1.4 MB JS)
✅ node_modules/       - After npm install
```

### Step 3: Install Dependencies
```bash
cd /home/[username]/app.tripa.com.ng
npm install --production
```

### Step 4: Set Environment Variables
Create `.env` file:
```env
NODE_ENV=production
VITE_API_URL=https://hrapi.tripa.com.ng
```

### Step 5: Restart
Click **Restart** in cPanel Node.js interface

---

## 📁 What's Included

| File/Folder | Description |
|-------------|-------------|
| `server.js` | Express server to serve the SPA |
| `package.json` | Dependencies including express |
| `build/` | Production build (Vite output) |
| `.env.production` | Environment variable template |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment instructions |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `PRODUCTION_READY.md` | Summary of changes |

---

## ✅ Verification

After deployment, visit: **https://app.tripa.com.ng**

Expected behavior:
- Login page with "Femtech Human Resource" branding
- Professional gradient design
- Working authentication
- Dashboard accessible after login

---

## 🔧 Troubleshooting

**App won't start:**
```bash
cat logs/error.log
```

**404 errors:**
- Verify `server.js` is startup file
- Check `build/` folder exists

**API not working:**
- Check `VITE_API_URL` environment variable
- Verify backend is running at `https://hrapi.tripa.com.ng`

---

## 📞 Support

For detailed instructions, see:
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

**Version:** 1.0.0  
**Build Date:** March 25, 2026  
**Framework:** React 18 + Vite 6  
**Server:** Express 4
