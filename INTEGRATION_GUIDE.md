# Frontend-Backend Integration Guide

## 🎯 Overview

This guide explains how the React frontend and Node.js backend are integrated in the Humanity Donation Platform.

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (Node.js/Express)
Port 3000 (dev)     Port 5000
     ↓                   ↓
API Service Layer ←→ REST API Endpoints
     ↓                   ↓
Components       ←→ Controllers & Routes
     ↓                   ↓
State Management ←→ Database & File Storage
```

## 🔧 Integration Features

### ✅ Completed Integrations

1. **CORS Configuration**: Properly configured for cross-origin requests
2. **API Service Layer**: Centralized API calls with error handling
3. **File Upload Integration**: Media files handled between frontend and backend
4. **Payment Integration**: UPI payments with transaction tracking
5. **Real-time Data**: Stats and donations update in real-time
6. **Admin Dashboard**: Full admin functionality integrated
7. **Database Integration**: Excel-based storage with MongoDB fallback
8. **Production Build**: Single-server deployment ready

### 🛠️ API Endpoints Integrated

| Endpoint | Method | Purpose | Frontend Component |
|----------|--------|---------|-------------------|
| `/api/posts` | GET | Fetch all stories | PostList, App |
| `/api/posts` | POST | Create new story | PostForm |
| `/api/donate/:id` | POST | Process donation | PaymentModal |
| `/api/stats` | GET | Get statistics | App, Dashboard |
| `/api/collaborations` | GET | Get collaborations | Dashboard |
| `/api/collaborate` | POST | Submit collaboration | CollaborationForm |
| `/api/success-stories` | GET/POST | Success stories | SuccessStories |
| `/api/payment-config` | GET | Payment configuration | PaymentModal |
| `/api/admin/*` | Various | Admin functions | AdminDashboard |

## 🚀 Running the Application

### Development Mode (Recommended for development)
```bash
# Run the start-both.bat and choose option 1
start-both.bat
# Choose: 1 (Development Mode)
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Uses proxy configuration for API calls

### Production Mode (Single server)
```bash
# Run the start-both.bat and choose option 2
start-both.bat
# Choose: 2 (Production Mode)
```
- Application: http://localhost:5000
- Backend serves React build files
- All requests go through single server

### Manual Setup

#### Backend Only
```bash
cd Backend
npm install
npm run dev-server-only
```

#### Frontend Only
```bash
cd Frontend
npm install
npm start
```

## 🔧 Configuration Files

### Frontend Configuration
- `Frontend/package.json`: Proxy configuration
- `Frontend/.env`: Environment variables
- `Frontend/src/config/api.js`: API configuration
- `Frontend/src/services/apiService.js`: API service layer

### Backend Configuration
- `Backend/server.js`: Main server with CORS and routes
- `Backend/.env`: Environment variables
- `Backend/package.json`: Scripts and dependencies

## 🧪 Testing Integration

### Automated Test
```bash
test-integration.bat
```

### Manual Testing Checklist

1. **API Connectivity**
   - [ ] Frontend can fetch posts from backend
   - [ ] Payment processing works
   - [ ] File uploads work
   - [ ] Admin functions accessible

2. **CORS Issues**
   - [ ] No CORS errors in browser console
   - [ ] API calls succeed from frontend

3. **File Handling**
   - [ ] Images display correctly
   - [ ] File uploads save to backend
   - [ ] Media files accessible via URL

4. **Real-time Updates**
   - [ ] Stats update after donations
   - [ ] New posts appear immediately
   - [ ] Admin changes reflect in frontend

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**: 
- Backend CORS is configured for localhost:3000
- Check if backend server is running
- Verify CORS configuration in `Backend/server.js`

#### 2. API Calls Failing
**Problem**: Frontend can't reach backend APIs

**Solutions**:
- Ensure backend is running on port 5000
- Check proxy configuration in `Frontend/package.json`
- Verify API endpoints in `Frontend/src/config/api.js`

#### 3. File Upload Issues
**Problem**: Images not displaying or uploads failing

**Solutions**:
- Check `Backend/uploads` directory exists
- Verify file permissions
- Check multer configuration in backend

#### 4. Payment Integration Issues
**Problem**: Payment modal not working

**Solutions**:
- Check payment config API endpoint
- Verify UPI configuration in backend `.env`
- Test payment flow step by step

### Debug Mode

Enable debug logging:
```javascript
// In Frontend components
console.log('API Request:', data);

// In Backend
console.log('Received request:', req.body);
```

## 📁 File Structure

```
Donation/
├── Frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── config/
│   │   │   └── api.js          # API configuration
│   │   ├── services/
│   │   │   └── apiService.js   # API service layer
│   │   └── App.js              # Main app component
│   ├── package.json            # Proxy configuration
│   └── .env                    # Environment variables
├── Backend/
│   ├── server.js               # Main server file
│   ├── routes/                 # API routes
│   ├── controllers/            # Route controllers
│   ├── uploads/                # File storage
│   └── package.json            # Server dependencies
├── start-both.bat              # Startup script
├── test-integration.bat        # Integration test
└── INTEGRATION_GUIDE.md        # This file
```

## 🔒 Security Considerations

1. **CORS**: Configured for specific origins
2. **File Uploads**: Limited file types and sizes
3. **Input Validation**: Server-side validation for all inputs
4. **Environment Variables**: Sensitive data in .env files
5. **Error Handling**: Proper error responses without exposing internals

## 🚀 Deployment

### Development Deployment
- Use development mode with separate servers
- Hot reloading enabled
- Debug logging active

### Production Deployment
- Build React app: `npm run build`
- Set `NODE_ENV=production`
- Single server serves both frontend and API
- Optimized for performance

## 📞 Support

If you encounter integration issues:

1. Check this guide first
2. Run the integration test script
3. Check browser console for errors
4. Verify both servers are running
5. Test API endpoints individually

## 🎉 Success Indicators

Integration is working correctly when:
- ✅ Frontend loads without errors
- ✅ API calls return data successfully
- ✅ File uploads work
- ✅ Payments can be processed
- ✅ Admin functions accessible
- ✅ Real-time updates work
- ✅ No CORS errors in console