# 🍃 MongoDB Setup Guide

## 📋 Overview

Your application now uses MongoDB to securely store collaborator contact information. The contact details (email and phone) are stored in the database but **hidden from the public collaboration dashboard** for privacy.

## 🔒 Security Features Implemented

### ✅ **Contact Information Protection:**
- 📧 **Email addresses** are stored in database but **NOT visible** in public API responses
- 📞 **Phone numbers** are stored in database but **NOT visible** in public API responses
- 🔐 Only admin users can access contact information through special admin endpoints
- 🛡️ Database schema automatically excludes sensitive fields from JSON responses

### ✅ **Admin Access:**
- 🔑 Admin dashboard requires authentication key (`admin123`)
- 📊 Admin can view all collaboration requests **with contact information**
- ✏️ Admin can update collaboration status and add notes
- 📈 Admin can view detailed statistics and analytics
- 💾 Admin can export all data for backup/analysis

## 🚀 Quick Start (Works Without MongoDB)

**Your app works immediately without MongoDB installation:**
- ✅ Uses in-memory storage as fallback
- ✅ All features work normally
- ⚠️ Contact info is not stored in development mode (for security)
- 📝 Shows warning message when submitting collaborations

## 📦 MongoDB Installation (Optional but Recommended)

### For Windows:

1. **Download MongoDB Community Server:**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Start MongoDB Service:**
   ```powershell
   # Option 1: Start as Windows Service (automatic)
   net start MongoDB
   
   # Option 2: Start manually
   mongod --dbpath "C:\data\db"
   ```

4. **Verify Installation:**
   ```powershell
   # Open MongoDB shell
   mongosh
   
   # Should connect successfully
   ```

### For Mac:

1. **Install using Homebrew:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```

### For Linux (Ubuntu):

1. **Install MongoDB:**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## 🔧 Configuration

### Environment Variables (`.env`):
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/charity-donation
DB_NAME=charity-donation

# Admin Configuration  
ADMIN_KEY=admin123
```

### Connection Status:
- ✅ **Connected:** Contact info stored securely in database
- ⚠️ **Not Connected:** Falls back to in-memory storage (development mode)

## 🎯 How It Works

### Public Collaboration Dashboard:
```json
{
  "organizationName": "Help Foundation",
  "contactPerson": "John Doe",
  "organizationType": "NGO",
  "description": "We want to help...",
  "status": "pending"
  // ❌ email and phone are NOT included
}
```

### Admin Dashboard (with authentication):
```json
{
  "organizationName": "Help Foundation", 
  "contactPerson": "John Doe",
  "email": "john@helpfoundation.org",     // ✅ Visible to admin
  "phone": "+1234567890",                 // ✅ Visible to admin
  "organizationType": "NGO",
  "description": "We want to help...",
  "status": "pending",
  "adminNotes": "Follow up next week",    // ✅ Admin-only field
  "priority": "high"                      // ✅ Admin-only field
}
```

## 🔐 Admin Dashboard Access

### 1. Navigate to Admin Dashboard:
```
http://localhost:3000/admin
```

### 2. Enter Admin Key:
```
admin123
```

### 3. Admin Features:
- 📋 View all collaborations with contact information
- 📊 View detailed statistics and analytics  
- ✏️ Update collaboration status (pending → approved/contacted/rejected)
- 📝 Add internal notes and set priority levels
- 💾 Export all data as CSV for backup/analysis
- 🔍 Search and filter collaborations

## 🛡️ Security Best Practices

### Database Security:
- 🔒 Sensitive fields marked with `select: false` in schema
- 🛡️ Automatic data transformation removes sensitive fields from responses
- 🔑 Admin endpoints require authentication
- 📝 Audit trail for all admin actions

### Production Recommendations:
- 🔐 Change default admin key in production
- 🌐 Use MongoDB Atlas (cloud) for production
- 🔒 Enable MongoDB authentication
- 🛡️ Use HTTPS for all communications
- 📊 Set up proper logging and monitoring

## 🚨 Troubleshooting

### MongoDB Connection Issues:

1. **"MongoDB Connection Failed":**
   ```bash
   # Check if MongoDB is running
   mongosh
   
   # If not running, start it:
   # Windows: net start MongoDB
   # Mac: brew services start mongodb/brew/mongodb-community  
   # Linux: sudo systemctl start mongod
   ```

2. **"Database not found":**
   - Database is created automatically when first collaboration is submitted
   - No manual setup required

3. **"Admin authentication failed":**
   - Check admin key in `.env` file
   - Default key is `admin123`
   - Make sure to use the correct key in admin dashboard

### Development Mode (No MongoDB):
- ✅ App works normally without MongoDB
- ⚠️ Contact information is not stored for security
- 📝 Shows appropriate warning messages
- 🔄 Automatically switches to database when MongoDB becomes available

## 📊 Database Schema

### Collaboration Model:
```javascript
{
  organizationName: String,     // ✅ Public
  contactPerson: String,        // ✅ Public  
  email: String,               // 🔒 Admin-only (select: false)
  phone: String,               // 🔒 Admin-only (select: false)
  organizationType: String,     // ✅ Public
  description: String,          // ✅ Public
  collaborationType: String,    // ✅ Public
  status: String,              // ✅ Public
  resources: [String],         // ✅ Public
  submittedAt: Date,           // ✅ Public
  lastContactedAt: Date,       // ✅ Public
  notes: String,               // ✅ Public
  adminNotes: String,          // 🔒 Admin-only (select: false)
  priority: String             // 🔒 Admin-only (select: false)
}
```

## 🎉 Ready to Use!

Your secure collaboration system is now set up with:
- ✅ **Privacy Protection:** Contact info hidden from public view
- ✅ **Admin Management:** Full admin dashboard with contact access
- ✅ **Fallback Support:** Works with or without MongoDB
- ✅ **Security Features:** Authentication, data protection, audit trails
- ✅ **Export Capability:** CSV export for data analysis

**Start the application:** `npm run dev`
**Access admin dashboard:** http://localhost:3000/admin
**Admin key:** `admin123`