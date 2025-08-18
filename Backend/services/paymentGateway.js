const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PaymentGateway {
  constructor() {
    this.pendingPayments = new Map(); // Store pending payments
    this.completedPayments = new Map(); // Store completed payments
    this.paymentTimeout = 10 * 60 * 1000; // 10 minutes timeout
    
    // Initialize payment verification system
    this.initializePaymentSystem();
  }

  initializePaymentSystem() {
    console.log('🔄 Payment Gateway initialized');
    
    // Clean up expired pending payments every 5 minutes
    setInterval(() => {
      this.cleanupExpiredPayments();
    }, 5 * 60 * 1000);
  }

  // Generate unique payment ID
  generatePaymentId() {
    return 'PAY_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // Generate UPI deep link for payment
  generateUPILink(paymentData) {
    const {
      recipientUpiId,
      amount,
      paymentId,
      donorName,
      storyTitle,
      organizationName
    } = paymentData;

    const merchantName = organizationName || 'Humanity Charity';
    const transactionNote = `Donation for ${storyTitle} - ${merchantName}`;
    const transactionRef = paymentId;

    // Standard UPI URL format
    const upiUrl = `upi://pay?` +
      `pa=${encodeURIComponent(recipientUpiId)}` +
      `&pn=${encodeURIComponent(merchantName)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(transactionNote)}` +
      `&tr=${encodeURIComponent(transactionRef)}` +
      `&mc=5411` + // Merchant category code for charity
      `&mode=02`; // Person to merchant

    return upiUrl;
  }

  // Generate app-specific UPI links
  generateAppSpecificLinks(paymentData) {
    const baseData = {
      pa: paymentData.recipientUpiId,
      pn: encodeURIComponent(paymentData.organizationName || 'Humanity Charity'),
      am: paymentData.amount,
      cu: 'INR',
      tn: encodeURIComponent(`Donation for ${paymentData.storyTitle}`),
      tr: encodeURIComponent(paymentData.paymentId)
    };

    const queryString = Object.entries(baseData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return {
      phonepe: `phonepe://pay?${queryString}`,
      googlepay: `tez://upi/pay?${queryString}`,
      paytm: `paytmmp://pay?${queryString}`,
      bhim: `bhim://pay?${queryString}`,
      amazonpay: `amazonpay://pay?${queryString}`,
      generic: `upi://pay?${queryString}`
    };
  }

  // Initiate payment process
  async initiatePayment(paymentRequest) {
    try {
      const paymentId = this.generatePaymentId();
      const timestamp = new Date().toISOString();

      const paymentData = {
        paymentId,
        storyId: paymentRequest.storyId,
        storyTitle: paymentRequest.storyTitle,
        amount: parseFloat(paymentRequest.amount),
        donorName: paymentRequest.donorName || 'Anonymous',
        donorUpiId: paymentRequest.donorUpiId,
        recipientUpiId: paymentRequest.recipientUpiId,
        organizationName: paymentRequest.organizationName,
        status: 'initiated',
        createdAt: timestamp,
        expiresAt: new Date(Date.now() + this.paymentTimeout).toISOString()
      };

      // Store pending payment
      this.pendingPayments.set(paymentId, paymentData);

      // Generate UPI links
      const upiLinks = this.generateAppSpecificLinks(paymentData);
      const genericUpiLink = this.generateUPILink(paymentData);

      console.log(`💳 Payment initiated: ${paymentId} for ₹${paymentData.amount}`);

      return {
        success: true,
        paymentId,
        amount: paymentData.amount,
        upiLinks,
        genericUpiLink,
        expiresAt: paymentData.expiresAt,
        message: 'Payment initiated successfully'
      };

    } catch (error) {
      console.error('Error initiating payment:', error);
      return {
        success: false,
        error: 'Failed to initiate payment'
      };
    }
  }

  // Verify payment completion
  async verifyPayment(paymentId, verificationData) {
    try {
      const pendingPayment = this.pendingPayments.get(paymentId);
      
      if (!pendingPayment) {
        return {
          success: false,
          error: 'Payment not found or already processed'
        };
      }

      // Check if payment has expired
      if (new Date() > new Date(pendingPayment.expiresAt)) {
        this.pendingPayments.delete(paymentId);
        return {
          success: false,
          error: 'Payment has expired'
        };
      }

      // Validate UTR format (12 digits)
      const utr = verificationData.utr;
      if (!utr || !/^\d{12}$/.test(utr)) {
        return {
          success: false,
          error: 'Invalid UTR format. UTR should be 12 digits.'
        };
      }

      // Check if UTR is already used
      const existingPayment = Array.from(this.completedPayments.values())
        .find(payment => payment.utr === utr);
      
      if (existingPayment) {
        return {
          success: false,
          error: 'This UTR has already been used for another payment'
        };
      }

      // Create completed payment record
      const completedPayment = {
        ...pendingPayment,
        utr: utr,
        status: 'completed',
        completedAt: new Date().toISOString(),
        verificationMethod: 'manual_utr',
        paymentApp: verificationData.paymentApp || 'unknown'
      };

      // Move from pending to completed
      this.completedPayments.set(paymentId, completedPayment);
      this.pendingPayments.delete(paymentId);

      // Generate payment receipt
      const receipt = this.generatePaymentReceipt(completedPayment);

      console.log(`✅ Payment verified: ${paymentId} - UTR: ${utr}`);

      return {
        success: true,
        paymentId,
        utr,
        receipt,
        message: 'Payment verified successfully'
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: 'Failed to verify payment'
      };
    }
  }

  // Generate payment receipt
  generatePaymentReceipt(paymentData) {
    const receiptId = 'RCP_' + Date.now();
    
    const receipt = {
      receiptId,
      paymentId: paymentData.paymentId,
      transactionDetails: {
        amount: paymentData.amount,
        currency: 'INR',
        utr: paymentData.utr,
        paymentMethod: 'UPI',
        paymentApp: paymentData.paymentApp,
        status: 'SUCCESS'
      },
      donorDetails: {
        name: paymentData.donorName,
        upiId: paymentData.donorUpiId
      },
      recipientDetails: {
        name: paymentData.organizationName,
        upiId: paymentData.recipientUpiId
      },
      donationDetails: {
        storyId: paymentData.storyId,
        storyTitle: paymentData.storyTitle,
        purpose: 'Charitable Donation'
      },
      timestamps: {
        initiatedAt: paymentData.createdAt,
        completedAt: paymentData.completedAt,
        receiptGeneratedAt: new Date().toISOString()
      },
      receiptUrl: `/api/receipt/${receiptId}`,
      downloadUrl: `/api/receipt/${receiptId}/download`
    };

    // Store receipt for future access
    this.storeReceipt(receiptId, receipt);

    return receipt;
  }

  // Store receipt data
  storeReceipt(receiptId, receipt) {
    try {
      const receiptsDir = path.join(__dirname, '..', 'data', 'receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const receiptPath = path.join(receiptsDir, `${receiptId}.json`);
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
      
      console.log(`📄 Receipt stored: ${receiptId}`);
    } catch (error) {
      console.error('Error storing receipt:', error);
    }
  }

  // Get payment status
  getPaymentStatus(paymentId) {
    const pendingPayment = this.pendingPayments.get(paymentId);
    const completedPayment = this.completedPayments.get(paymentId);

    if (completedPayment) {
      return {
        success: true,
        status: 'completed',
        payment: completedPayment
      };
    }

    if (pendingPayment) {
      const isExpired = new Date() > new Date(pendingPayment.expiresAt);
      if (isExpired) {
        this.pendingPayments.delete(paymentId);
        return {
          success: false,
          status: 'expired',
          error: 'Payment has expired'
        };
      }

      return {
        success: true,
        status: 'pending',
        payment: pendingPayment
      };
    }

    return {
      success: false,
      status: 'not_found',
      error: 'Payment not found'
    };
  }

  // Get receipt data
  getReceipt(receiptId) {
    try {
      const receiptPath = path.join(__dirname, '..', 'data', 'receipts', `${receiptId}.json`);
      
      if (!fs.existsSync(receiptPath)) {
        return {
          success: false,
          error: 'Receipt not found'
        };
      }

      const receiptData = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      
      return {
        success: true,
        receipt: receiptData
      };
    } catch (error) {
      console.error('Error retrieving receipt:', error);
      return {
        success: false,
        error: 'Failed to retrieve receipt'
      };
    }
  }

  // Clean up expired payments
  cleanupExpiredPayments() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [paymentId, payment] of this.pendingPayments.entries()) {
      if (now > new Date(payment.expiresAt)) {
        this.pendingPayments.delete(paymentId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired payments`);
    }
  }

  // Get payment statistics
  getPaymentStats() {
    const completedPayments = Array.from(this.completedPayments.values());
    const totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalPayments: completedPayments.length,
      totalAmount: totalAmount,
      pendingPayments: this.pendingPayments.size,
      averageAmount: completedPayments.length > 0 ? totalAmount / completedPayments.length : 0,
      recentPayments: completedPayments
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10)
    };
  }
}

module.exports = PaymentGateway;