# ✅ Production Deployment Checklist - Femtech HR App

## 🎯 Pre-Deployment

### 1. Update API Configuration
- [ ] Verify backend API is deployed at `https://hrapi.tripa.com.ng`
- [ ] Test API endpoint: `GET https://hrapi.tripa.com.ng/api/system-complete/readiness`
- [ ] Ensure CORS allows requests from `https://app.tripa.com.ng`

### 2. Build Application Locally
```bash
cd /home/frobenius/Desktop/Femtech/HR/Frontend

# Install all dependencies
npm install

# Build for production
npm run build
```

### 3. Verify Build
- [ ] `build/` folder created successfully
- [ ] `build/index.html` exists
- [ ] `build/assets/` contains JS and CSS files
- [ ] Open `build/index.html` in browser (should work partially)

---

## 🚀 cPanel Setup

### 4. Create Node.js Application
In cPanel → Setup Node.js App → **Create Application**:

| Field | Value |
|-------|-------|
| Node.js version | `20.19.4` |
| Application mode | `Production` |
| Application root | `app.tripa.com.ng` |
| Application URL | `https://app.tripa.com.ng` |
| Startup file | `server.js` |

Click **Create** ✅

### 5. Upload Files
Upload to `/home/[username]/app.tripa.com.ng/`:

**Required Files:**
- [ ] `server.js` - Entry point
- [ ] `package.json` - Dependencies
- [ ] `build/` - Entire build folder

**Optional (for reference):**
- [ ] `.env.production` - Use as template only
- [ ] `DEPLOYMENT_GUIDE.md` - Documentation

**DO NOT Upload:**
- ❌ `node_modules/` - Install on server
- ❌ `src/` - Source code not needed
- ❌ `.env` files - Create on server
- ❌ `public/` - Already in build

### 6. Install Dependencies
Via SSH or cPanel Terminal:
```bash
cd /home/[username]/app.tripa.com.ng
npm install --production
```

### 7. Set Environment Variables
In cPanel Node.js App interface:

1. Click on your application
2. Scroll to **Environment Variables**
3. Add:
   - `NODE_ENV` = `production`
   - `VITE_API_URL` = `https://hrapi.tripa.com.ng`
4. Click **Save**

### 8. Restart Application
- [ ] Click **Restart** button in cPanel
- [ ] Wait 10-15 seconds for startup
- [ ] Check **Logs** for: "Femtech HR App is running on port XXXX"

---

## ✅ Post-Deployment Verification

### 9. Test Application
Open `https://app.tripa.com.ng` in browser:

- [ ] Login page loads correctly
- [ ] "Femtech Human Resource" branding visible
- [ ] No console errors (F12 → Console)
- [ ] Styles load properly
- [ ] Login form functional

### 10. Test Authentication
- [ ] Enter valid credentials
- [ ] Click "Sign In"
- [ ] Redirects to dashboard
- [ ] API calls succeed (check Network tab)
- [ ] Session persists on refresh

### 11. Test Navigation
- [ ] All menu items work
- [ ] Page refreshes don't 404 (SPA routing)
- [ ] Back/forward browser buttons work
- [ ] Deep links work (e.g., `app.tripa.com.ng/attendance`)

### 12. Test on Mobile
- [ ] Open on mobile device
- [ ] Responsive layout works
- [ ] Touch interactions smooth
- [ ] No horizontal scroll

---

## 🔍 Troubleshooting

### Application Won't Start
```bash
# SSH into server and check:
cd /home/[username]/app.tripa.com.ng
cat logs/error.log
npm list express  # Verify express installed
```

### 404 on All Pages
- [ ] Verify `server.js` exists and is correct
- [ ] Check startup file in cPanel is `server.js`
- [ ] Verify `build/` folder exists

### API Calls Failing
- [ ] Check browser console for CORS errors
- [ ] Verify `VITE_API_URL` is set correctly
- [ ] Test API directly: `https://hrapi.tripa.com.ng/api/system-complete/readiness`
- [ ] Ensure backend allows requests from app domain

### Styles Not Loading
- [ ] Check `build/assets/` folder has CSS files
- [ ] Verify file paths in `index.html` are correct
- [ ] Clear browser cache (Ctrl+Shift+R)

---

## 📊 Performance Check

### 13. Run Lighthouse Audit
In Chrome DevTools → Lighthouse:

- [ ] Performance: >80
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

### 14. Check Load Times
- [ ] First Contentful Paint: <2s
- [ ] Time to Interactive: <4s
- [ ] Total Bundle Size: <500KB (gzipped)

---

## 🔐 Security Verification

### 15. Security Checklist
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] SSL certificate valid
- [ ] No sensitive data in source code
- [ ] `.env` files not uploaded to public folder
- [ ] CORS configured on backend
- [ ] Authentication tokens stored securely (httpOnly cookies preferred)

---

## 📱 Optional: PWA Setup

If you want Progressive Web App features:

### 16. Add PWA Support
- [ ] Create `public/manifest.json`
- [ ] Add icons: `apple-touch-icon.png`, `favicon.svg`
- [ ] Register service worker
- [ ] Test "Add to Home Screen" prompt

---

## 🎉 Go Live!

### 17. Final Steps
- [ ] Share URL with team: `https://app.tripa.com.ng`
- [ ] Test with real user credentials
- [ ] Monitor logs for first 24 hours
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### 18. Documentation
- [ ] Update team on login credentials
- [ ] Document admin user setup
- [ ] Create user guide if needed

---

## 📞 Support Contacts

**Technical Issues:**
- Check logs: `/home/[username]/app.tripa.com.ng/logs/error.log`
- Restart app in cPanel
- Verify backend API is running

**Hosting Issues:**
- cPanel support
- Check server resources (disk space, memory)

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** 1.0.0  
**Status:** ⏳ Pending / ✅ Complete / ❌ Failed

---

## 🔄 Update Procedure

To deploy updates in the future:

```bash
# 1. Build locally
npm run build

# 2. Upload new build folder
# (via FTP, Git, or cPanel File Manager)

# 3. Restart app in cPanel
# Click Restart button
```
