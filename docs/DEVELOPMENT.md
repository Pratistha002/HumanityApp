# 🚀 Development Guide - Auto-Refresh Setup

## 🔄 Auto-Refresh Features

### ✅ What Auto-Refreshes:

**Backend Server (Node.js/Express):**
- ✅ `server.js` - Main server file
- ✅ Route files in `/routes` folder
- ✅ Model files in `/models` folder  
- ✅ Config files in `/config` folder
- ✅ `demo-data.js` - Demo data
- ✅ `.env` - Environment variables
- ✅ Any `.js`, `.json` files

**Frontend Client (React):**
- ✅ All React components (`.js`, `.jsx`)
- ✅ CSS files (`.css`)
- ✅ HTML files
- ✅ Any file in `/src` folder
- ✅ Hot Module Replacement (HMR) enabled

## 🚀 Quick Start Commands

### Option 1: Full Development Mode (Recommended)
```bash
# Start both backend and frontend with auto-refresh
npm run dev
```

### Option 2: Use the Batch File
```bash
# Double-click or run in terminal
dev-start.bat
```

### Option 3: Individual Servers
```bash
# Backend only (with auto-refresh)
npm run dev-server-only

# Frontend only (with hot reload)
npm run dev-client-only
```

## 📍 Development URLs

- **Frontend (React):** http://localhost:3000
- **Backend (API):** http://localhost:5000
- **Main App:** http://localhost:3000 (proxies to backend)

## 🔧 How Auto-Refresh Works

### Backend (Nodemon):
- Watches for file changes in specified directories
- Automatically restarts the server when changes detected
- Preserves uploaded files and data during restart
- Shows restart notifications in console

### Frontend (React Hot Reload):
- Instantly reflects changes without page refresh
- Preserves component state when possible
- Shows compilation errors in browser overlay
- Automatic browser refresh for CSS changes

## 📝 Making Changes

### Backend Changes:
1. Edit any `.js` file (like `server.js`)
2. Save the file
3. ✅ Server automatically restarts
4. See restart message in terminal

### Frontend Changes:
1. Edit any React component or CSS file
2. Save the file  
3. ✅ Browser automatically updates
4. Changes appear instantly

### Example Workflow:
```
1. Run: npm run dev
2. Edit: client/src/App.js
3. Save: Ctrl+S
4. ✅ Browser updates automatically

5. Edit: server.js
6. Save: Ctrl+S  
7. ✅ Server restarts automatically
```

## 🛠️ Configuration Files

### `nodemon.json` - Backend Auto-Refresh Config
- Specifies which files to watch
- Sets restart delay (1 second)
- Ignores unnecessary folders
- Enables colored output

### `package.json` - React Hot Reload
- Built-in with `react-scripts start`
- Automatic hot module replacement
- Error overlay in browser
- Proxy setup for API calls

## 🚨 Troubleshooting

### If Auto-Refresh Stops Working:

**Backend Issues:**
```bash
# Restart nodemon manually
npm run dev-server-only
```

**Frontend Issues:**
```bash
# Clear React cache and restart
cd client
rm -rf node_modules/.cache
npm start
```

**Both Not Working:**
```bash
# Fresh install everything
npm run fresh-install
npm run dev
```

### Common Issues:

1. **Port Already in Use:**
   - Kill existing processes on ports 3000/5000
   - Or change ports in configuration

2. **File Changes Not Detected:**
   - Check if files are in watched directories
   - Verify nodemon.json configuration
   - Restart development servers

3. **React Hot Reload Not Working:**
   - Check browser console for errors
   - Verify proxy configuration
   - Clear browser cache

## 💡 Development Tips

### Best Practices:
- ✅ Always use `npm run dev` for development
- ✅ Keep terminal open to see restart messages
- ✅ Use browser dev tools for debugging
- ✅ Check both terminals for errors

### File Organization:
- Backend files: Root directory
- Frontend files: `/client` directory
- Uploads: `/uploads` directory (ignored by nodemon)
- Config: `nodemon.json`, `.env`

### Performance Tips:
- Large files are ignored by nodemon
- React only rebuilds changed components
- API calls are proxied automatically
- Hot reload preserves application state

## 🎯 Ready to Develop!

Your development environment is now set up with:
- ✅ Automatic server restart on backend changes
- ✅ Hot module replacement for React components  
- ✅ Instant CSS updates
- ✅ Error overlays and notifications
- ✅ Proxy setup for seamless API calls

**Start developing:** `npm run dev`
**Make changes:** Save any file
**See results:** Instantly in browser! 🚀