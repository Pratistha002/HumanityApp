# 🧪 Test Payment Integration

## 🔍 Quick Payment System Test

### Test 1: Verify QR Code Display
1. **Start the application:** `npm run dev`
2. **Go to:** http://localhost:3000
3. **Click "Donate Now"** on any story
4. **Select amount:** ₹100
5. **Choose:** UPI Payment
6. **Check:** QR code should display your actual QR image
7. **Verify:** UPI ID shows `pratisthasingh002003-1@okaxis`

### Test 2: Test UPI App Integration
1. **In payment modal, click "PhonePe" button**
2. **Expected:** PhonePe app should try to open (or show app not found)
3. **Check URL:** Should contain your UPI ID and amount
4. **Repeat for:** Google Pay, Paytm, BHIM buttons

### Test 3: Test Bank Transfer Details
1. **In payment modal, choose "Bank Transfer"**
2. **Verify details:**
   - Account Number: 75113959698
   - IFSC Code: BARB0BUPGBX
   - Bank Name: Bank of Baroda UP Gramin
   - Account Holder: PRATISTHA SINGH
3. **Test copy-to-clipboard** by clicking on any detail

### Test 4: Test Payment Configuration API
```bash
# Test the payment config endpoint
curl http://localhost:5000/api/payment-config
```

**Expected Response:**
```json
{
  "upiId": "pratisthasingh002003-1@okaxis",
  "organizationName": "Humanity - Charity Platform",
  "accountHolderName": "PRATISTHA SINGH",
  "bankDetails": {
    "accountNumber": "75113959698",
    "ifscCode": "BARB0BUPGBX",
    "bankName": "Bank of Baroda UP Gramin",
    "branchName": "UP Gramin"
  },
  "qrCodePath": "/qr-code.jpg"
}
```

## ✅ Success Criteria

### Payment Modal Should Show:
- ✅ Your QR code image
- ✅ Correct UPI ID: pratisthasingh002003-1@okaxis
- ✅ Correct bank account: 75113959698
- ✅ Correct IFSC: BARB0BUPGBX
- ✅ Correct bank name: Bank of Baroda UP Gramin
- ✅ Working copy-to-clipboard functionality
- ✅ UPI app buttons that generate correct links

### UPI Links Should Contain:
- ✅ `pa=pratisthasingh002003-1@okaxis` (your UPI ID)
- ✅ `pn=PRATISTHA%20SINGH` (your name)
- ✅ `am=100` (selected amount)
- ✅ `cu=INR` (currency)
- ✅ `tn=Donation%20for%20[Story]` (transaction note)

## 🚨 Troubleshooting

### If QR Code Doesn't Show:
1. Check if file exists: `c:\Users\PratisthaSingh\Desktop\Donation\client\public\qr-code.jpg`
2. Verify image path in browser: http://localhost:3000/qr-code.jpg
3. Check browser console for image loading errors

### If UPI Apps Don't Open:
- This is normal on desktop/laptop
- UPI apps only open on mobile devices
- Links are generated correctly for mobile use

### If Bank Details Are Wrong:
1. Check `.env` file has correct values
2. Restart server after changing `.env`
3. Verify API response with curl command above

## 📱 Mobile Testing

### On Mobile Device:
1. **Open website** on mobile browser
2. **Click "Donate Now"** and select UPI payment
3. **Click UPI app button** (PhonePe/Google Pay/etc.)
4. **Verify app opens** with pre-filled payment details
5. **DON'T complete payment** during testing

### Expected Mobile Behavior:
- ✅ UPI app opens automatically
- ✅ Payment details are pre-filled
- ✅ Amount and recipient are correct
- ✅ Transaction note includes story title

## 🎯 Final Verification

### Before Going Live:
- [ ] QR code displays correctly
- [ ] All bank details are accurate
- [ ] UPI ID is correct
- [ ] Copy-to-clipboard works
- [ ] Mobile UPI apps open correctly
- [ ] Payment modal is responsive
- [ ] All amounts work (₹100, ₹500, custom amounts)

### When Everything Works:
- ✅ **Your payment system is ready!**
- ✅ **Donations will go directly to account: 75113959698**
- ✅ **UPI payments will credit to: pratisthasingh002003-1@okaxis**
- ✅ **Bank transfers will credit to: Bank of Baroda UP Gramin**

**Test completed! Your payment integration is ready to accept real donations! 🎉💰**