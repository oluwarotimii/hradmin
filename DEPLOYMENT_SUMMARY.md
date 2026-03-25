# ✅ HR Admin Deployment - Quick Summary

## 🎯 Ready to Deploy

**Application:** Femtech HR Admin Dashboard  
**URL:** https://hradmin.tripa.com.ng  
**Build:** ✅ Complete (build/ folder ready)

---

## 📦 What to Upload

Upload to `/home/[username]/hradmin.tripa.com.ng/`:

```
✅ server.js              ← Express server
✅ package.json           ← Dependencies  
✅ .env                   ← Environment variables
✅ build/                 ← Built frontend (index.html + assets)
```

---

## 🚀 Deploy Steps

### 1. Create Node.js App in cPanel

| Field | Value |
|-------|-------|
| Node.js version | `20.19.4` |
| Application mode | `Production` |
| Application root | `hradmin.tripa.com.ng` |
| Application URL | `https://hradmin.tripa.com.ng` |
| Startup file | `server.js` |

### 2. Upload Files

Via FTP/Git/cPanel File Manager:
- `server.js`
- `package.json`
- `.env`
- `build/` (entire folder)

### 3. Install Dependencies

On server (SSH):
```bash
cd ~/hradmin.tripa.com.ng
npm install --production
```

### 4. Create .env

```env
NODE_ENV=production
VITE_API_URL=https://hrapi.tripa.com.ng/api
```

### 5. Restart

In cPanel → Click **Restart**

---

## ✅ Verify

Visit: **https://hradmin.tripa.com.ng**

Should see:
- ✅ Login page
- ✅ "Femtech Human Resource" branding
- ✅ Working authentication
- ✅ Dashboard loads after login

---

## 📊 Build Stats

- **index.html:** 1.23 KB
- **CSS:** 46.31 KB (10.09 KB gzipped)
- **JS:** 1,455.56 KB (345.69 KB gzipped)
- **Total:** ~1.5 MB (356 KB gzipped)

---

**Status:** ✅ Ready for Deployment  
**Build Date:** March 25, 2026
