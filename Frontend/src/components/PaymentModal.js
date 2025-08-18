import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PaymentModal = ({ post, onClose, onDonationComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [userUpiId, setUserUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Amount, 2: Payment Method, 3: UPI Payment, 4: Completion
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentConfig, setPaymentConfig] = useState({
    upiId: '',
    organizationName: '',
    accountHolderName: '',
    bankDetails: {},
    qrCodePath: ''
  });

  const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const config = await apiService.getPaymentConfig();
      setPaymentConfig(config);
    } catch (error) {
      console.error('Error fetching payment config:', error);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleNext = () => {
    if (step === 1 && amount) {
      setStep(2);
    } else if (step === 2 && paymentMethod) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generateUPILink = (app, targetUpiId = null) => {
    const recipientUpiId = targetUpiId || paymentConfig.upiId;
    const name = paymentConfig.accountHolderName;
    const note = `Donation for ${post.title} - ${paymentConfig.organizationName}`;
    
    const baseUPI = `upi://pay?pa=${recipientUpiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // App-specific UPI links
    const appLinks = {
      phonepe: `phonepe://pay?pa=${recipientUpiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
      googlepay: `tez://upi/pay?pa=${recipientUpiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
      paytm: `paytmmp://pay?pa=${recipientUpiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
      bhim: baseUPI,
      generic: baseUPI
    };
    
    return appLinks[app] || baseUPI;
  };

  const handleUPIPayment = (app) => {
    const targetUpiId = userUpiId || paymentConfig.upiId;
    const upiLink = generateUPILink(app, targetUpiId);
    
    // Set payment method to UPI for app-based payments
    setPaymentMethod('UPI');
    
    // Try to open the UPI app
    window.location.href = upiLink;
    
    // Move to completion step
    setStep(4);
    setPaymentStatus('pending');
  };

  const handlePaymentCompletion = async (status) => {
    if (!amount || !paymentMethod) {
      alert('Please enter amount and select payment method');
      return;
    }

    // For UPI payments, UTR is compulsory when marking as completed
    if (paymentMethod === 'UPI' && status === 'completed' && !transactionId.trim()) {
      alert('⚠️ UTR (Transaction ID) is required for UPI payments. Please enter the 12-digit UTR from your payment app.');
      return;
    }

    // Validate UTR format for UPI payments (12 digits)
    if (paymentMethod === 'UPI' && status === 'completed' && transactionId.trim()) {
      const utrPattern = /^\d{12}$/;
      if (!utrPattern.test(transactionId.trim())) {
        alert('⚠️ Please enter a valid 12-digit UTR. You can find this in your UPI app payment history.');
        return;
      }
    }

    setLoading(true);
    try {
      const donationData = {
        amount: parseFloat(amount),
        donorName: donorName || 'Anonymous',
        paymentMethod,
        userUpiId: userUpiId || null,
        transactionId: transactionId || null,
        paymentStatus: status
      };

      console.log('Sending donation data:', donationData);
      console.log('Post ID:', post.id);

      const response = await apiService.makeDonation(post.id, donationData);
      console.log('Donation response:', response);

      if (response.success) {
        setPaymentStatus(status);
        
        if (status === 'completed') {
          alert(`✅ Donation of ₹${amount} completed successfully! Thank you for your contribution.`);
          // Show success message and close modal after delay
          setTimeout(() => {
            onDonationComplete();
            onClose();
          }, 2000);
        } else {
          alert(`Payment status updated to: ${status.toUpperCase()}`);
        }
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error processing donation: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleQRScan = () => {
    // Set payment method to UPI for QR code payments
    setPaymentMethod('UPI');
    // Move to completion step when QR is scanned
    setStep(4);
    setPaymentStatus('pending');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💝 Donate to Help</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="donation-info">
          <h3>{post.title}</h3>
          <p>Help {post.name} with your generous donation</p>
        </div>

        {/* Step Progress Indicator */}
        <div className="step-progress">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className={`step-line ${step >= 4 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>✓</div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h3>💰 Choose Donation Amount</h3>
            
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
              <label htmlFor="customAmount">Or enter custom amount:</label>
              <input
                type="number"
                id="customAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <div className="donor-info">
              <label htmlFor="donorName">Your Name (Optional):</label>
              <input
                type="text"
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Anonymous"
              />
            </div>

            <button 
              className="btn btn-primary next-btn"
              onClick={handleNext}
              disabled={!amount}
            >
              Next: Choose Payment Method →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>💳 Choose Payment Method</h3>
            
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <span className="payment-icon">📱</span>
                <div>
                  <strong>UPI Payment</strong>
                  <p>Pay with PhonePe, Google Pay, Paytm, etc.</p>
                </div>
              </button>

              <button
                className={`payment-method-btn ${paymentMethod === 'Bank Transfer' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Bank Transfer')}
              >
                <span className="payment-icon">🏦</span>
                <div>
                  <strong>Bank Transfer</strong>
                  <p>Direct bank account transfer</p>
                </div>
              </button>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!paymentMethod}
              >
                Next: Make Payment →
              </button>
            </div>
          </div>
        )}

        {step === 3 && paymentMethod === 'UPI' && (
          <div className="step-content">
            <h3>📱 UPI Payment - ₹{amount}</h3>
            
            <div className="payment-details">
              {/* UPI ID Input Option */}
              <div className="upi-input-section">
                <h4>💡 Pay to Your UPI ID (Optional)</h4>
                <p>Enter your UPI ID to pay from your preferred app:</p>
                <div className="upi-input-group">
                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    placeholder="yourname@paytm / yourname@phonepe"
                    className="upi-input"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleUPIPayment('generic')}
                    disabled={!userUpiId}
                  >
                    Pay Now
                  </button>
                </div>
                <p className="upi-note">This will redirect to your UPI app with payment details pre-filled</p>
              </div>

              <div className="divider">OR</div>

              <div className="qr-section">
                <h4>Scan QR Code</h4>
                <div className="qr-container">
                  <img 
                    src={paymentConfig.qrCodePath} 
                    alt="UPI QR Code" 
                    className="qr-code"
                  />
                  <p>Scan with any UPI app</p>
                  <button 
                    className="btn btn-success qr-scan-btn"
                    onClick={handleQRScan}
                  >
                    I've Scanned the QR Code
                  </button>
                </div>
              </div>

              <div className="divider">OR</div>

              <div className="upi-apps">
                <h4>Pay with UPI Apps</h4>
                <div className="upi-buttons">
                  <button 
                    className="upi-app-btn phonepe"
                    onClick={() => handleUPIPayment('phonepe')}
                  >
                    <span className="app-icon">📱</span>
                    PhonePe
                  </button>
                  
                  <button 
                    className="upi-app-btn googlepay"
                    onClick={() => handleUPIPayment('googlepay')}
                  >
                    <span className="app-icon">🔍</span>
                    Google Pay
                  </button>
                  
                  <button 
                    className="upi-app-btn paytm"
                    onClick={() => handleUPIPayment('paytm')}
                  >
                    <span className="app-icon">💙</span>
                    Paytm
                  </button>
                  
                  <button 
                    className="upi-app-btn bhim"
                    onClick={() => handleUPIPayment('bhim')}
                  >
                    <span className="app-icon">🇮🇳</span>
                    BHIM
                  </button>
                </div>
              </div>

              <div className="upi-details">
                <h4>UPI Details</h4>
                <div className="detail-row">
                  <span>UPI ID:</span>
                  <span className="copyable" onClick={() => copyToClipboard(paymentConfig.upiId)}>
                    {paymentConfig.upiId} 📋
                  </span>
                </div>
                <div className="detail-row">
                  <span>Amount:</span>
                  <span>₹{amount}</span>
                </div>
                <div className="detail-row">
                  <span>Beneficiary:</span>
                  <span>{paymentConfig.accountHolderName}</span>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && paymentMethod === 'Bank Transfer' && (
          <div className="step-content">
            <h3>🏦 Bank Transfer Details</h3>
            
            <div className="bank-details">
              <div className="bank-info-card">
                <h4>Transfer to this account:</h4>
                
                <div className="bank-detail-row">
                  <span className="label">Account Holder:</span>
                  <span className="value copyable" onClick={() => copyToClipboard(paymentConfig.accountHolderName)}>
                    {paymentConfig.accountHolderName} 📋
                  </span>
                </div>
                
                <div className="bank-detail-row">
                  <span className="label">Account Number:</span>
                  <span className="value copyable" onClick={() => copyToClipboard(paymentConfig.bankDetails.accountNumber)}>
                    {paymentConfig.bankDetails.accountNumber} 📋
                  </span>
                </div>
                
                <div className="bank-detail-row">
                  <span className="label">IFSC Code:</span>
                  <span className="value copyable" onClick={() => copyToClipboard(paymentConfig.bankDetails.ifscCode)}>
                    {paymentConfig.bankDetails.ifscCode} 📋
                  </span>
                </div>
                
                <div className="bank-detail-row">
                  <span className="label">Bank Name:</span>
                  <span className="value">{paymentConfig.bankDetails.bankName}</span>
                </div>
                
                <div className="bank-detail-row">
                  <span className="label">Branch:</span>
                  <span className="value">{paymentConfig.bankDetails.branchName}</span>
                </div>
                
                <div className="bank-detail-row highlight">
                  <span className="label">Amount to Transfer:</span>
                  <span className="value amount">₹{amount}</span>
                </div>
              </div>

              <div className="transfer-note">
                <p><strong>Note:</strong> Please mention "Donation for {post.title}" in the transfer description.</p>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn btn-success"
                onClick={() => {
                  setStep(4);
                  setPaymentStatus('pending');
                }}
              >
                I've Made the Transfer →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h3>🎯 Payment Completion</h3>
            
            <div className="payment-completion">
              <div className="completion-info">
                <h4>Payment Details:</h4>
                <p><strong>Amount:</strong> ₹{amount}</p>
                <p><strong>Method:</strong> {paymentMethod.toUpperCase()}</p>
                <p><strong>Donor:</strong> {donorName || 'Anonymous'}</p>
                {userUpiId && <p><strong>Your UPI ID:</strong> {userUpiId}</p>}
              </div>

              <div className="transaction-details">
                {paymentMethod === 'UPI' ? (
                  <>
                    <h4>UTR (Transaction ID) - Required for UPI:</h4>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit UTR from your UPI app"
                      className="transaction-input required"
                      maxLength="12"
                      pattern="\d{12}"
                    />
                    <p className="transaction-note required-note">
                      <strong>⚠️ UTR is mandatory for UPI payments.</strong> You can find the 12-digit UTR in your payment app's transaction history.
                    </p>
                  </>
                ) : (
                  <>
                    <h4>Transaction Reference (Optional):</h4>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID/reference (optional)"
                      className="transaction-input"
                    />
                    <p className="transaction-note">
                      This helps us track your donation better (optional)
                    </p>
                  </>
                )}
              </div>

              <div className="completion-actions">
                <h4>Did you complete the payment?</h4>
                <div className="completion-buttons">
                  <button 
                    className="btn btn-success completion-btn"
                    onClick={() => handlePaymentCompletion('completed')}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : '✅ Yes, Payment Completed'}
                  </button>
                  
                  <button 
                    className="btn btn-warning completion-btn"
                    onClick={() => handlePaymentCompletion('failed')}
                    disabled={loading}
                  >
                    ❌ Payment Failed/Cancelled
                  </button>
                </div>
              </div>

              {paymentStatus === 'completed' && (
                <div className="success-message">
                  <h4>🎉 Thank You for Your Donation!</h4>
                  <p>Your generous contribution of ₹{amount} will make a real difference.</p>
                  <p>This window will close automatically...</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="error-message">
                  <h4>😔 Payment Not Completed</h4>
                  <p>No worries! You can try again anytime.</p>
                  <button className="btn btn-primary" onClick={() => setStep(1)}>
                    Try Again
                  </button>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;