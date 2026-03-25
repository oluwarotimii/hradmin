# 🚀 HR Admin Dashboard - Deployment Guide (hradmin.tripa.com.ng)

## 📦 What We're Deploying

**Frontend:** Vite + React Admin Dashboard  
**Build Output:** `build/` folder  
**URL:** https://hradmin.tripa.com.ng

---

## 🎯 cPanel Configuration

### Setup Node.js App

| Field | Value |
|-------|-------|
| **Node.js version** | `20.19.4` |
| **Application mode** | `Production` |
| **Application root** | `hradmin.tripa.com.ng` |
| **Application URL** | `https://hradmin.tripa.com.ng` |
| **Application startup file** | `server.js` |

---

## 📁 File Structure

Upload to `/home/[username]/hradmin.tripa.com.ng/`:

```
hradmin.tripa.com.ng/
├── server.js              ← Express server (serves static files)
├── package.json           ← Dependencies
├── .env                   ← Environment variables
├── build/                 ← Vite build output
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│   ├── _headers
│   └── _redirects
└── node_modules/          ← Dependencies
```

---

## 🔧 Deployment Steps

### Step 1: Build Locally (Already Done ✅)

```bash
cd /home/frobenius/Desktop/Femtech/HR/Frontend
npm run build
```

Build output: `build/` folder

### Step 2: Upload to cPanel

Upload these to `hradmin.tripa.com.ng`:

**Required:**
- ✅ `server.js`
- ✅ `package.json`
- ✅ `.env` (or create on server)
- ✅ `build/` (entire folder)

### Step 3: Install Dependencies

On server via SSH:
```bash
cd /home/[username]/hradmin.tripa.com.ng
npm install --production
```

### Step 4: Create Environment File

Create `.env` on server:
```env
NODE_ENV=production
VITE_API_URL=https://hrapi.tripa.com.ng/api
VITE_APP_NAME=Femtech HR Admin
```

### Step 5: Restart Application

In cPanel Node.js App interface:
1. Click **Restart**
2. Wait 10-15 seconds

---

## ✅ Verification

### Check Logs
```bash
tail -f /home/[username]/hradmin.tripa.com.ng/logs/error.log
```

**Expected:**
```
✅ Femtech HR Admin serving on port XXXX
```

### Test in Browser

Visit: **https://hradmin.tripa.com.ng**

Should see:
- ✅ Login page loads
- ✅ "Femtech Human Resource" branding
- ✅ No console errors
- ✅ Can authenticate with backend

---

## 🐛 Troubleshooting

### 404 on Refresh

Add `.htaccess` in `build/` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### API Calls Failing

Check `.env`:
```env
VITE_API_URL=https://hrapi.tripa.com.ng/api
```

### Build Folder Missing Files

Rebuild locally:
```bash
npm run build
```

Upload fresh `build/` folder.

---

## 🔄 Update Procedure

To deploy updates:

### Locally:
```bash
cd /home/frobenius/Desktop/Femtech/HR/Frontend
npm run build
```

### Upload:
Upload new `build/` folder to server

### Or via Git:
```bash
# Server
cd ~/hradmin.tripa.com.ng
git pull origin main
```

---

**Version:** 1.0.0  
**Status:** ✅ Ready for Deployment
