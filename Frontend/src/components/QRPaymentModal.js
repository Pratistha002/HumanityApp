import React, { useState, useEffect } from 'react';
import './QRPaymentModal.css';

const QRPaymentModal = ({ post, onClose, onDonationComplete }) => {
  const [step, setStep] = useState(1); // 1: Amount, 2: QR Payment, 3: UTR Verification, 4: Success
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Your UPI ID
  const UPI_ID = 'pratisthasingh002003-1@okaxis';
  const ORGANIZATION_NAME = 'Humanity Charity Platform';

  const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
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
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const generateQRCodeURL = () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(ORGANIZATION_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Donation for ${post.title}`)}`;
    // Using Google Charts API to generate QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  };

  const handlePaymentMade = () => {
    if (!donorName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (donorName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    setError('');
    setStep(3);
  };

  const verifyPayment = async () => {
    if (!utr.trim()) {
      setError('Please enter the UTR number from your payment');
      return;
    }

    if (!/^\d{12}$/.test(utr.trim())) {
      setError('UTR should be exactly 12 digits. Please check your payment confirmation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/donate/${post.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donorName: donorName.trim(),
          paymentMethod: 'UPI',
          userUpiId: null,
          transactionId: utr.trim(),
          paymentStatus: 'completed'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setStep(4);

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

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(stepNum => (
        <div key={stepNum} className={`step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}>
          <span className="step-number">{stepNum}</span>
          <span className="step-label">
            {stepNum === 1 && 'Amount'}
            {stepNum === 2 && 'QR Payment'}
            {stepNum === 3 && 'UTR Verify'}
            {stepNum === 4 && 'Success'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="qr-payment-modal-overlay">
      <div className="qr-payment-modal">
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

          {/* Step 2: QR Code Payment */}
          {step === 2 && (
            <div className="step-content">
              <h3>📱 Scan QR Code to Pay</h3>
              <p className="amount-display">Amount: ₹{parseFloat(amount).toLocaleString()}</p>

              <div className="qr-payment-section">
                <div className="qr-code-container">
                  <img 
                    src={generateQRCodeURL()} 
                    alt="UPI Payment QR Code"
                    className="qr-code"
                  />
                  <p className="qr-instruction">Scan with any UPI app</p>
                </div>

                <div className="payment-details">
                  <h4>💳 Payment Details:</h4>
                  <div className="detail-row">
                    <span>UPI ID:</span>
                    <span className="upi-id">{UPI_ID}</span>
                  </div>
                  <div className="detail-row">
                    <span>Amount:</span>
                    <span>₹{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Purpose:</span>
                    <span>Donation for {post.title}</span>
                  </div>
                </div>

                <div className="payment-instructions">
                  <h4>📋 How to Pay:</h4>
                  <ol>
                    <li>Open any UPI app (PhonePe, GooglePay, Paytm, etc.)</li>
                    <li>Scan the QR code above</li>
                    <li>Verify the amount: ₹{parseFloat(amount).toLocaleString()}</li>
                    <li>Complete the payment</li>
                    <li>Note down the 12-digit UTR number</li>
                    <li>Click "I've Made Payment" below</li>
                  </ol>
                </div>

                <div className="donor-name-section">
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
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  Back
                </button>
                <button 
                  className="btn btn-primary payment-made-btn"
                  onClick={handlePaymentMade}
                  disabled={!donorName.trim()}
                >
                  ✅ I've Made the Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: UTR Verification */}
          {step === 3 && (
            <div className="step-content">
              <h3>🔍 Enter UTR Number</h3>
              <p className="payment-info">
                Amount: ₹{parseFloat(amount).toLocaleString()} | Donor: {donorName}
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
                    <li><strong>Other Apps:</strong> Look for "Transaction ID" or "Reference Number"</li>
                  </ul>
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  Back to QR Code
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={verifyPayment}
                  disabled={!utr.trim() || utr.length !== 12 || loading}
                >
                  {loading ? 'Verifying Payment...' : 'Complete Donation'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && success && (
            <div className="step-content success-content">
              <div className="success-icon">✅</div>
              <h3>Donation Successful!</h3>
              <p className="success-message">
                Thank you, {donorName}, for your generous donation of ₹{parseFloat(amount).toLocaleString()}!
              </p>

              <div className="donation-summary">
                <h4>📄 Donation Summary</h4>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Story:</span>
                    <span>{post.title}</span>
                  </div>
                  <div className="summary-row">
                    <span>Amount:</span>
                    <span>₹{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Donor:</span>
                    <span>{donorName}</span>
                  </div>
                  <div className="summary-row">
                    <span>UTR:</span>
                    <span>{utr}</span>
                  </div>
                  <div className="summary-row">
                    <span>Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Status:</span>
                    <span className="status-success">COMPLETED</span>
                  </div>
                </div>
              </div>

              <div className="impact-message">
                <h4>🌟 Your Impact</h4>
                <p>Your donation will directly help with "{post.title}" and make a real difference in someone's life. Thank you for your kindness!</p>
              </div>

              <div className="step-actions">
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

export default QRPaymentModal;