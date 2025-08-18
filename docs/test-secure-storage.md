# 🧪 Test Secure Contact Storage

## 🔍 How to Verify Contact Information is Secure

### Test 1: Submit a Collaboration Request

1. **Go to Collaboration Form:**
   ```
   http://localhost:3000/collaborate
   ```

2. **Fill out the form with test data:**
   ```
   Organization Name: Test Organization
   Contact Person: John Doe
   Email: john.doe@test.com
   Phone: +1234567890
   Organization Type: NGO
   Description: This is a test collaboration
   Collaboration Type: funding
   ```

3. **Submit the form**

4. **Check the response message:**
   - ✅ With MongoDB: "Contact information is securely stored"
   - ⚠️ Without MongoDB: "Development mode - contact info not stored"

### Test 2: Verify Public Dashboard Hides Contact Info

1. **Go to Public Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Check the collaboration cards:**
   - ✅ Should show: Organization name, contact person, type, description
   - ❌ Should NOT show: Email address, phone number
   - 🔒 Contact information should be completely hidden

### Test 3: Verify Admin Dashboard Shows Contact Info

1. **Go to Admin Dashboard:**
   ```
   http://localhost:3000/admin
   ```

2. **Enter admin key:**
   ```
   admin123
   ```

3. **Check the collaboration cards:**
   - ✅ Should show: ALL information including email and phone
   - ✅ Should show admin-only fields like priority and admin notes
   - 🔐 Contact information should be visible to admin only

### Test 4: Test API Endpoints Directly

#### Public API (should hide contact info):
```bash
# Test public collaborations endpoint
curl http://localhost:5000/api/collaborations
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "organizationName": "Test Organization",
      "contactPerson": "John Doe",
      "organizationType": "NGO",
      "description": "This is a test collaboration",
      "collaborationType": "funding",
      "status": "pending"
      // ❌ email and phone should NOT be present
    }
  ]
}
```

#### Admin API (should show contact info):
```bash
# Test admin collaborations endpoint (requires admin key)
curl -H "x-admin-key: admin123" http://localhost:5000/api/admin/collaborations
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "organizationName": "Test Organization",
      "contactPerson": "John Doe",
      "email": "john.doe@test.com",        // ✅ Should be present
      "phone": "+1234567890",              // ✅ Should be present
      "organizationType": "NGO",
      "description": "This is a test collaboration",
      "collaborationType": "funding",
      "status": "pending",
      "adminNotes": null,                  // ✅ Admin-only field
      "priority": "medium"                 // ✅ Admin-only field
    }
  ]
}
```

### Test 5: Test Admin Authentication

#### Without Admin Key (should fail):
```bash
curl http://localhost:5000/api/admin/collaborations
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

#### With Wrong Admin Key (should fail):
```bash
curl -H "x-admin-key: wrongkey" http://localhost:5000/api/admin/collaborations
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized: Admin access required"
}
```

## ✅ Expected Test Results

### 🔒 Security Verification:
- ✅ Public API responses do NOT contain email/phone
- ✅ Admin API responses DO contain email/phone (with valid key)
- ✅ Admin API rejects requests without proper authentication
- ✅ Database stores all information but schema hides sensitive fields

### 🎯 Functionality Verification:
- ✅ Collaboration form submission works
- ✅ Public dashboard shows collaborations without contact info
- ✅ Admin dashboard shows collaborations with contact info
- ✅ Admin can update collaboration status
- ✅ Admin can export data with contact information

### 📊 Database Verification (if MongoDB is connected):
```bash
# Connect to MongoDB shell
mongosh

# Switch to charity database
use charity-donation

# View collaborations (will show all fields including hidden ones)
db.collaborations.find().pretty()

# Count total collaborations
db.collaborations.countDocuments()
```

## 🚨 What to Look For

### ✅ Good Signs:
- Public dashboard shows collaborations without email/phone
- Admin dashboard requires authentication
- Admin dashboard shows email/phone after authentication
- API responses match expected format
- Database stores complete information

### ❌ Red Flags:
- Email/phone visible in public dashboard
- Admin dashboard accessible without authentication
- Public API responses contain email/phone
- Error messages when submitting collaborations

## 🛠️ Troubleshooting

### If Contact Info Appears in Public Dashboard:
1. Check if you're using the admin dashboard by mistake
2. Verify the API endpoint is `/api/collaborations` (not `/api/admin/collaborations`)
3. Check browser network tab to see actual API response

### If Admin Dashboard Doesn't Show Contact Info:
1. Verify you entered the correct admin key (`admin123`)
2. Check if MongoDB is connected (see console logs)
3. Verify the API endpoint is `/api/admin/collaborations`

### If Database Connection Issues:
1. Check MongoDB is running: `mongosh`
2. Check connection string in `.env` file
3. Look for connection messages in server console
4. App will work in development mode without MongoDB

## 🎉 Success Criteria

Your secure storage system is working correctly if:
- ✅ Contact information is hidden from public view
- ✅ Contact information is accessible to authenticated admins
- ✅ Database stores complete information securely
- ✅ API endpoints respect privacy settings
- ✅ Authentication prevents unauthorized access

**Your collaborator contact information is now secure! 🔒**