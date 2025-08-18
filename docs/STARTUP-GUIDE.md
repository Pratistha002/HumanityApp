# 🚀 Quick Startup Guide - Humanity

## 🎯 **Multiple Ways to Start Your Server**

### **Method 1: Terminal Command (Recommended)**
```bash
cd "c:\Users\PratisthaSingh\Desktop\Donation"
npm start
```

**You'll see this beautiful output:**
```
✅ Demo data loaded successfully - 3 sample stories available

🚀 Humanity Server Started Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on port: 5000
🌐 Local URL: http://localhost:5000
🌐 Network URL: http://127.0.0.1:5000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Click on any URL above to open your charity website
💰 Your real UPI: pratisthasingh002003-1@okaxis
🎯 Ready to accept donations and help people!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Method 2: Double-Click Batch File**
Simply double-click: `start-with-links.bat`
- Opens a green terminal window
- Shows server status
- Displays clickable links

### **Method 3: Auto-Open Browser**
```bash
npm run open
```
- Automatically opens browser
- Starts the server
- Perfect for quick testing

### **Method 4: Development Mode**
```bash
npm run server
```
- Uses nodemon for auto-restart
- Perfect for development
- Restarts on file changes

## 🌐 **Access Your Website**

Once the server starts, you can access your charity website at:

### **Primary URLs:**
- **http://localhost:5000** ← Click this in terminal
- **http://127.0.0.1:5000** ← Alternative URL

### **What You'll See:**
- ✅ Interactive homepage with animated statistics
- ✅ 3 demo stories ready for donations
- ✅ Your real QR code for payments
- ✅ Smooth animations and effects
- ✅ Mobile-responsive design

## 💰 **Payment Integration**

Your website is configured with **REAL** payment details:
- **UPI ID**: `pratisthasingh002003-1@okaxis`
- **Account Holder**: PRATISTHA SINGH
- **Bank**: Axis Bank
- **QR Code**: Your actual QR code image

## 🎨 **Interactive Features You'll Experience**

### **Homepage:**
- Animated particle background
- Counting statistics animation
- Smooth section transitions
- 3D card hover effects

### **Donation Process:**
1. Click "Donate Now" on any story
2. Select amount (₹100, ₹500, ₹1000, etc.)
3. Choose payment method
4. See your real QR code
5. Confetti celebration after donation!

### **Real-time Notifications:**
- Success notifications for donations
- Error handling with user-friendly messages
- Celebration effects with confetti
- Auto-dismissing toast notifications

## 🛠️ **Troubleshooting**

### **If Port 5000 is Busy:**
```bash
# Kill existing processes
taskkill /f /im node.exe

# Then start again
npm start
```

### **If Server Won't Start:**
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Try different port in server.js

### **If Website Won't Load:**
1. Check terminal for error messages
2. Ensure server shows "Server running on port 5000"
3. Try http://127.0.0.1:5000 instead

## 📱 **Testing on Mobile**

1. Find your computer's IP address
2. Connect mobile to same WiFi
3. Visit: `http://YOUR_IP:5000`
4. Test UPI payments directly on mobile

## 🎯 **Quick Demo**

1. **Start server**: `npm start`
2. **Open browser**: Click the link in terminal
3. **View stories**: See 3 demo stories
4. **Test donation**: Click "Donate Now"
5. **Select amount**: Choose ₹100
6. **See QR code**: Your real payment QR
7. **Enjoy effects**: Confetti and notifications!

## 🔧 **Customization**

### **Change Port:**
Edit `server.js` line 9:
```javascript
const PORT = process.env.PORT || 3000; // Change 5000 to 3000
```

### **Update Payment Details:**
Edit `.env` file or `server.js` payment config section

### **Modify Demo Stories:**
Edit `demo-data.js` to change sample stories

## 📞 **Support**

If you need help:
- **Email**: pratisthasingh002003@gmail.com
- **UPI**: pratisthasingh002003-1@okaxis

---

## 🎉 **You're All Set!**

Your interactive charity website is ready to:
- ✅ Accept real donations
- ✅ Share inspiring stories  
- ✅ Connect with collaborators
- ✅ Make a positive impact

**🌐 Start now: `npm start` and click the link!**