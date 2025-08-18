import React, { useState, useEffect } from 'react';
import './EnhancedPaymentModal.css';

const EnhancedPaymentModal = ({ post, onClose, onDonationComplete }) => {
  const [step, setStep] = useState(1); // 1: Amount, 2: Details, 3: Payment, 4: Verification, 5: Success
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorUpiId, setDonorUpiId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [upiLinks, setUpiLinks] = useState({});
  const [utr, setUtr] = useState('');
  const [paymentApp, setPaymentApp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [paymentExpiry, setPaymentExpiry] = useState(null);

  const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const paymentApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱' },
    { id: 'googlepay', name: 'Google Pay', icon: '🔵' },
    { id: 'paytm', name: 'Paytm', icon: '💙' },
    { id: 'bhim', name: 'BHIM', icon: '🇮🇳' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '🟠' },
    { id: 'generic', name: 'Other UPI App', icon: '💳' }
  ];

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (paymentExpiry) {
        clearTimeout(paymentExpiry);
      }
    };
  }, [paymentExpiry]);

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const validateUpiId = (upiId) => {
    if (!upiId || upiId.trim() === '') return true; // Optional field
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiPattern.test(upiId.trim());
  };

  const handleNext = () => {
    if (step === 1) {
      const amountValue = parseFloat(amount);
      if (!amount || amountValue <= 0) {
        setError('Please enter a valid donation amount');
        return;
      }
      if (amountValue < 1) {
        setError('Minimum donation amount is ₹1');
        return;
      }
      if (amountValue > 100000) {
        setError('Maximum donation amount is ₹100,000');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!donorName.trim()) {
        setError('Please enter your name');
        return;
      }
      if (donorName.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        return;
      }
      // Validate UPI ID if provided
      if (donorUpiId.trim() && !validateUpiId(donorUpiId)) {
        setError('Please enter a valid UPI ID (e.g., yourname@paytm)');
        return;
      }
      setError(''); // Clear any previous errors
      initiatePayment();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storyId: post.id,
          amount: parseFloat(amount),
          donorName: donorName.trim(),
          donorUpiId: donorUpiId.trim() || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentId(data.paymentId);
        setUpiLinks(data.upiLinks);
        setStep(3);

        // Set payment expiry timer
        const expiryTime = new Date(data.expiresAt).getTime() - Date.now();
        const timer = setTimeout(() => {
          setError('Payment session has expired. Please start again.');
          setStep(1);
        }, expiryTime);
        setPaymentExpiry(timer);

      } else {
        setError(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = (appId) => {
    const upiLink = upiLinks[appId];
    if (upiLink) {
      // Open UPI app
      window.location.href = upiLink;
      
      // Move to verification step
      setStep(4);
      setPaymentApp(appId);
    }
  };

  const verifyPayment = async () => {
    if (!utr.trim()) {
      setError('Please enter the UTR number from your payment app');
      return;
    }

    if (!/^\d{12}$/.test(utr.trim())) {
      setError('UTR should be exactly 12 digits. Please check your payment confirmation.');
      return;
    }

    if (!paymentId) {
      setError('Payment session expired. Please start again.');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          utr: utr.trim(),
          paymentApp
        })
      });

      const data = await response.json();

      if (data.success) {
        setReceipt(data.receipt);
        setStep(5);
        
        // Clear expiry timer
        if (paymentExpiry) {
          clearTimeout(paymentExpiry);
          setPaymentExpiry(null);
        }

        // Notify parent component
        if (onDonationComplete) {
          onDonationComplete(data.donation);
        }

      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (receipt && receipt.downloadUrl) {
      const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${receipt.downloadUrl}`;
      window.open(downloadUrl, '_blank');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map(stepNum => (
        <div key={stepNum} className={`step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}>
          <span className="step-number">{stepNum}</span>
          <span className="step-label">
            {stepNum === 1 && 'Amount'}
            {stepNum === 2 && 'Details'}
            {stepNum === 3 && 'Payment'}
            {stepNum === 4 && 'Verify'}
            {stepNum === 5 && 'Success'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="enhanced-payment-modal-overlay">
      <div className="enhanced-payment-modal">
        <div className="modal-header">
          <h2>💝 Make a Donation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {renderStepIndicator()}

        <div className="modal-content">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Step 1: Amount Selection */}
          {step === 1 && (
            <div className="step-content">
              <h3>Select Donation Amount</h3>
              <p className="story-title">For: {post.title}</p>
              
              <div className="amount-grid">
                {predefinedAmounts.map(amt => (
                  <button
                    key={amt}
                    className={`amount-btn ${amount === amt.toString() ? 'selected' : ''}`}
                    onClick={() => handleAmountSelect(amt)}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="custom-amount">
                <label>Or enter custom amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 1 && parseFloat(value) <= 100000)) {
                      setAmount(value);
                      if (error && error.includes('amount')) setError('');
                    }
                  }}
                  placeholder="Enter amount (₹1 - ₹100,000)"
                  min="1"
                  max="100000"
                />
                <small>Minimum: ₹1, Maximum: ₹100,000</small>
              </div>

              <div className="step-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue ₹{amount ? parseFloat(amount).toLocaleString() : '0'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Donor Details */}
          {step === 2 && (
            <div className="step-content">
              <h3>Your Details</h3>
              <p className="amount-display">Amount: ₹{parseFloat(amount).toLocaleString()}</p>

              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(e.target.value);
                    if (error && error.includes('name')) setError('');
                  }}
                  placeholder="Enter your full name"
                  required
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label>Your UPI ID (Optional)</label>
                <input
                  type="text"
                  value={donorUpiId}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setDonorUpiId(value);
                    if (error && error.includes('UPI')) setError('');
                  }}
                  placeholder="yourname@paytm, yourname@okaxis, etc."
                  className={donorUpiId.trim() && !validateUpiId(donorUpiId) ? 'invalid' : ''}
                />
                <small>
                  {donorUpiId.trim() && !validateUpiId(donorUpiId) ? 
                    '⚠️ Invalid UPI ID format' : 
                    'This helps us identify your payment faster. Leave blank if unsure.'
                  }
                </small>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  Back
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!donorName.trim() || loading}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method Selection */}
          {step === 3 && (
            <div className="step-content">
              <h3>Choose Your UPI App</h3>
              <p className="payment-info">
                Amount: ₹{parseFloat(amount).toLocaleString()} | Payment ID: {paymentId}
              </p>

              <div className="payment-apps-grid">
                {paymentApps.map(app => (
                  <button
                    key={app.id}
                    className="payment-app-btn"
                    onClick={() => handleUPIPayment(app.id)}
                  >
                    <span className="app-icon">{app.icon}</span>
                    <span className="app-name">{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="payment-instructions">
                <h4>📋 Instructions:</h4>
                <ol>
                  <li>Click on your preferred UPI app above</li>
                  <li>Your app will open with payment details pre-filled</li>
                  <li>Complete the payment in your app</li>
                  <li>Note down the UTR number from payment confirmation</li>
                  <li>Return here to verify your payment</li>
                </ol>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment Verification */}
          {step === 4 && (
            <div className="step-content">
              <h3>Verify Your Payment</h3>
              <p className="payment-info">
                Amount: ₹{parseFloat(amount).toLocaleString()} | Payment ID: {paymentId}
              </p>

              <div className="verification-section">
                <div className="form-group">
                  <label>UTR Number * (12 digits)</label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setUtr(value);
                      if (error && error.includes('UTR')) setError('');
                    }}
                    placeholder="123456789012"
                    maxLength="12"
                    className={utr.length > 0 && utr.length !== 12 ? 'invalid' : ''}
                  />
                  <small>
                    {utr.length > 0 && utr.length !== 12 ? 
                      `⚠️ UTR must be exactly 12 digits (${utr.length}/12)` :
                      'Find this 12-digit number in your UPI app\'s payment confirmation screen'
                    }
                  </small>
                </div>

                <div className="utr-help">
                  <h4>🔍 Where to find UTR?</h4>
                  <ul>
                    <li><strong>PhonePe:</strong> Transaction History → Select Payment → UTR</li>
                    <li><strong>Google Pay:</strong> Activity → Select Payment → Transaction ID</li>
                    <li><strong>Paytm:</strong> Passbook → Select Payment → UTR Number</li>
                    <li><strong>BHIM:</strong> Transaction History → Select Payment → UTR</li>
                  </ul>
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>
                  Back to Payment
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={verifyPayment}
                  disabled={!utr.trim() || utr.length !== 12 || loading}
                >
                  {loading ? 'Verifying...' : 'Verify Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success & Receipt */}
          {step === 5 && receipt && (
            <div className="step-content success-content">
              <div className="success-icon">✅</div>
              <h3>Payment Successful!</h3>
              <p className="success-message">
                Thank you for your generous donation of ₹{parseFloat(amount).toLocaleString()}!
              </p>

              <div className="receipt-summary">
                <h4>📄 Payment Receipt</h4>
                <div className="receipt-details">
                  <div className="receipt-row">
                    <span>Receipt ID:</span>
                    <span>{receipt.receiptId}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Amount:</span>
                    <span>₹{receipt.transactionDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="receipt-row">
                    <span>UTR:</span>
                    <span>{receipt.transactionDetails.utr}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Date:</span>
                    <span>{new Date(receipt.timestamps.completedAt).toLocaleString()}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Status:</span>
                    <span className="status-success">{receipt.transactionDetails.status}</span>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={downloadReceipt}>
                  📥 Download Receipt
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentModal;