// Payment Gateway JavaScript - Complete LMS Integration

class PaymentGateway {
    constructor() {
        this.currentStep = 1;
        this.captchaCode = '';
        this.otpTimer = null;
        this.otpTimeLeft = 300; // 5 minutes
        this.customerData = null;
        this.loanData = null;
        this.selectedPaymentMethod = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateCaptcha();
    }
    
    initializeElements() {
        // Step elements
        this.steps = document.querySelectorAll('.payment-step');
        this.stepNumbers = document.querySelectorAll('.step-number');
        
        // Form elements
        this.verificationForm = document.getElementById('verificationForm');
        this.otpForm = document.getElementById('otpForm');
        this.accountNumberInput = document.getElementById('accountNumber');
        this.mobileNumberInput = document.getElementById('mobileNumber');
        this.captchaInput = document.getElementById('captchaInput');
        this.captchaDisplay = document.getElementById('captchaDisplay');
        
        // OTP elements
        this.otpInputs = document.querySelectorAll('.otp-input');
        this.otpTimer = document.getElementById('otpTimer');
        this.resendOtpBtn = document.getElementById('resendOtp');
        
        // Payment elements
        this.paymentOptions = document.querySelectorAll('.payment-option');
        this.paymentFormContainer = document.getElementById('paymentFormContainer');
        
        // Summary elements
        this.paymentAmountInput = document.getElementById('paymentAmount');
        this.totalAmountSpan = document.getElementById('totalAmount');
        this.summaryAccount = document.getElementById('summaryAccount');
        this.summaryName = document.getElementById('summaryName');
        this.summaryOutstanding = document.getElementById('summaryOutstanding');
        
        // Buttons
        this.sendOtpBtn = document.getElementById('sendOtpBtn');
        this.proceedToPaymentBtn = document.getElementById('proceedToPayment');
    }
    
    setupEventListeners() {
        // Form submissions
        this.verificationForm.addEventListener('submit', (e) => this.handleVerification(e));
        this.otpForm.addEventListener('submit', (e) => this.handleOTPVerification(e));
        
        // Captcha refresh
        document.getElementById('refreshCaptcha').addEventListener('click', () => this.generateCaptcha());
        
        // OTP input handling
        this.otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleOTPInput(e, index));
            input.addEventListener('keydown', (e) => this.handleOTPKeydown(e, index));
        });
        
        // Payment method selection
        this.paymentOptions.forEach(option => {
            option.addEventListener('click', () => this.selectPaymentMethod(option));
        });
        
        // Payment amount input
        this.paymentAmountInput.addEventListener('input', () => this.updateTotalAmount());
        
        // Proceed to payment
        this.proceedToPaymentBtn.addEventListener('click', () => this.showPaymentOptions());
        
        // Resend OTP
        this.resendOtpBtn.addEventListener('click', () => this.resendOTP());
    }
    
    // Captcha Generation
    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        this.captchaCode = '';
        for (let i = 0; i < 6; i++) {
            this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.captchaDisplay.textContent = this.captchaCode;
        this.captchaInput.value = '';
        
        // Add some visual noise
        const noise = Math.floor(Math.random() * 3) + 1;
        this.captchaDisplay.style.transform = `rotate(${Math.random() * 4 - 2}deg)`;
        this.captchaDisplay.style.letterSpacing = `${8 + Math.random() * 4}px`;
    }
    
    // Step Navigation
    showStep(stepNumber) {
        this.steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === stepNumber);
        });
        
        this.currentStep = stepNumber;
        this.updateStepProgress();
    }
    
    updateStepProgress() {
        this.stepNumbers.forEach((number, index) => {
            if (index + 1 < this.currentStep) {
                number.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                number.innerHTML = '✓';
            } else if (index + 1 === this.currentStep) {
                number.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                number.innerHTML = index + 1;
            } else {
                number.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                number.innerHTML = index + 1;
            }
        });
    }
    
    // Form Validation
    validateForm(formData) {
        const errors = [];
        
        // Account number validation - should be format LA + 9 digits (total 11 chars)
        if (!formData.accountNumber || !/^LA\d{9}$/.test(formData.accountNumber)) {
            errors.push('Please enter a valid account number (Format: LA123456789)');
        }
        
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
            errors.push('Please enter a valid 10-digit mobile number');
        }
        
        if (!formData.captcha || formData.captcha.toLowerCase() !== this.captchaCode.toLowerCase()) {
            errors.push('Please enter the correct captcha code');
        }
        
        return errors;
    }
    
    // Handle Verification Form Submission
    async handleVerification(e) {
        e.preventDefault();
        
        const formData = {
            accountNumber: this.accountNumberInput.value.trim(),
            mobileNumber: this.mobileNumberInput.value.trim(),
            captcha: this.captchaInput.value.trim()
        };
        
        const errors = this.validateForm(formData);
        if (errors.length > 0) {
            this.showError(errors[0]);
            return;
        }
        
        this.showLoading(this.sendOtpBtn);
        
        try {
            // Call LMS API to verify customer
            const response = await fetch('/api/chatbot/verify-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobileNumber: formData.mobileNumber,
                    loanAccount: formData.accountNumber
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.customerData = data.customer;
                this.loanData = data.customer.loans[0]; // Assuming first loan
                
                // Send OTP via LMS
                await this.sendOTP(formData.mobileNumber);
                
                // Update summary
                this.updateSummary();
                
                // Show OTP step
                this.showStep(2);
                this.startOTPTimer();
            } else {
                this.showError(data.message || 'Customer verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            this.showError('Unable to verify customer. Please try again.');
        } finally {
            this.hideLoading(this.sendOtpBtn);
        }
    }
    
    // Send OTP
    async sendOTP(mobileNumber) {
        try {
            const response = await fetch('/api/payments/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobileNumber })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            this.showSuccess('OTP sent successfully to your mobile number');
        } catch (error) {
            console.error('OTP send error:', error);
            throw error;
        }
    }
    
    // OTP Input Handling
    handleOTPInput(e, index) {
        const input = e.target;
        const value = input.value;
        
        // Only allow numbers
        input.value = value.replace(/[^0-9]/g, '');
        
        // Move to next input
        if (input.value && index < this.otpInputs.length - 1) {
            this.otpInputs[index + 1].focus();
        }
        
        // Check if all inputs are filled
        if (this.getAllOTPInputs().length === 6) {
            this.otpForm.requestSubmit();
        }
    }
    
    handleOTPKeydown(e, index) {
        const input = e.target;
        
        // Handle backspace
        if (e.key === 'Backspace' && !input.value && index > 0) {
            this.otpInputs[index - 1].focus();
        }
        
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            this.otpInputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < this.otpInputs.length - 1) {
            this.otpInputs[index + 1].focus();
        }
    }
    
    getAllOTPInputs() {
        return Array.from(this.otpInputs)
            .map(input => input.value)
            .filter(value => value !== '');
    }
    
    // Handle OTP Verification
    async handleOTPVerification(e) {
        e.preventDefault();
        
        const otp = this.getAllOTPInputs().join('');
        
        if (otp.length !== 6) {
            this.showError('Please enter all 6 digits of OTP');
            return;
        }
        
        try {
            const response = await fetch('/api/payments/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobileNumber: this.customerData.mobile,
                    otp: otp
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('OTP verified successfully');
                this.showAccountDetails();
                this.showStep(3);
            } else {
                this.showError(data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showError('Unable to verify OTP. Please try again.');
        }
    }
    
    // OTP Timer
    startOTPTimer() {
        this.otpTimeLeft = 300;
        this.updateOTPTimer();
        
        this.otpTimerInterval = setInterval(() => {
            this.otpTimeLeft--;
            this.updateOTPTimer();
            
            if (this.otpTimeLeft <= 0) {
                clearInterval(this.otpTimerInterval);
                this.resendOtpBtn.disabled = false;
                this.otpTimer.textContent = 'OTP expired';
            }
        }, 1000);
        
        this.resendOtpBtn.disabled = true;
    }
    
    updateOTPTimer() {
        const minutes = Math.floor(this.otpTimeLeft / 60);
        const seconds = this.otpTimeLeft % 60;
        this.otpTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Resend OTP
    async resendOTP() {
        try {
            await this.sendOTP(this.customerData.mobile);
            this.startOTPTimer();
            this.clearOTPInputs();
            this.showSuccess('OTP resent successfully');
        } catch (error) {
            this.showError('Unable to resend OTP. Please try again.');
        }
    }
    
    clearOTPInputs() {
        this.otpInputs.forEach(input => {
            input.value = '';
        });
        this.otpInputs[0].focus();
    }
    
    // Show Account Details
    showAccountDetails() {
        const accountDetails = document.getElementById('accountDetails');
        
        // Fetch detailed loan information
        this.fetchLoanDetails();
        
        accountDetails.innerHTML = `
            <div class="account-details">
                <div class="detail-item">
                    <span class="detail-label">Customer Name:</span>
                    <span class="detail-value">${this.customerData.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Loan Account:</span>
                    <span class="detail-value">${this.loanData.loan_account}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Loan Type:</span>
                    <span class="detail-value">${this.loanData.loan_type}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${this.loanData.status}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Outstanding Amount:</span>
                    <span class="detail-value">₹${this.formatNumber(this.loanData.outstanding || 0)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Next Due Date:</span>
                    <span class="detail-value">${this.loanData.next_due_date || 'N/A'}</span>
                </div>
            </div>
        `;
    }
    
    // Fetch Loan Details from LMS
    async fetchLoanDetails() {
        try {
            // Get outstanding balance
            const outstandingResponse = await fetch('/api/chatbot/lms-outstanding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loanId: this.loanData.loan_id })
            });
            
            const outstandingData = await outstandingResponse.json();
            if (outstandingData.success) {
                this.loanData.outstanding = outstandingData.data.total;
                this.loanData.next_due_date = outstandingData.data.dueDate;
            }
            
            // Get EMI status
            const emiResponse = await fetch('/api/chatbot/emi-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loanId: this.loanData.loan_id })
            });
            
            const emiData = await emiResponse.json();
            if (emiData.success) {
                this.loanData.emi_status = emiData.data;
            }
            
        } catch (error) {
            console.error('Error fetching loan details:', error);
        }
    }
    
    // Update Payment Summary
    updateSummary() {
        this.summaryAccount.textContent = this.loanData.loan_account;
        this.summaryName.textContent = this.customerData.name;
        this.summaryOutstanding.textContent = `₹${this.formatNumber(this.loanData.outstanding || 0)}`;
        
        // Set default payment amount to outstanding amount
        if (this.loanData.outstanding) {
            this.paymentAmountInput.value = this.loanData.outstanding;
            this.updateTotalAmount();
        }
    }
    
    // Update Total Amount
    updateTotalAmount() {
        const amount = parseFloat(this.paymentAmountInput.value) || 0;
        this.totalAmountSpan.textContent = `₹${this.formatNumber(amount)}`;
    }
    
    // Show Payment Options
    showPaymentOptions() {
        const amount = parseFloat(this.paymentAmountInput.value) || 0;
        
        if (amount <= 0) {
            this.showError('Please enter a valid payment amount');
            return;
        }
        
        this.showStep(4);
    }
    
    // Select Payment Method
    selectPaymentMethod(option) {
        // Remove previous selection
        this.paymentOptions.forEach(opt => {
            opt.style.borderColor = 'rgba(99, 102, 241, 0.15)';
            opt.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)';
        });
        
        // Highlight selected option
        option.style.borderColor = '#6366f1';
        option.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)';
        
        this.selectedPaymentMethod = option.dataset.method;
        
        // Show payment form
        this.showPaymentForm(this.selectedPaymentMethod);
        this.showStep(5);
    }
    
    // Show Payment Form Based on Method
    showPaymentForm(method) {
        const container = this.paymentFormContainer;
        const amount = parseFloat(this.paymentAmountInput.value) || 0;
        
        switch (method) {
            case 'upi':
                container.innerHTML = `
                    <div class="payment-form">
                        <h3>UPI Payment</h3>
                        <div class="upi-qr">
                            <div class="qr-code">
                                <!-- QR Code would be generated here -->
                                <div class="qr-placeholder">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <path d="M3 9h18M9 3v18M15 3v18M3 15h18"/>
                                    </svg>
                                </div>
                            </div>
                            <p>Scan QR code with any UPI app</p>
                        </div>
                        <div class="upi-id">
                            <label>Or pay using UPI ID:</label>
                            <input type="text" value="cfmarc@paytm" readonly>
                            <button class="btn-copy">Copy UPI ID</button>
                        </div>
                        <div class="payment-amount">
                            <h4>Amount: ₹${this.formatNumber(amount)}</h4>
                        </div>
                    </div>
                `;
                break;
                
            case 'netbanking':
                container.innerHTML = `
                    <div class="payment-form">
                        <h3>Net Banking</h3>
                        <div class="bank-selection">
                            <label>Select your bank:</label>
                            <select class="bank-dropdown">
                                <option value="">Choose your bank</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="hdfc">HDFC Bank</option>
                                <option value="icici">ICICI Bank</option>
                                <option value="axis">Axis Bank</option>
                                <option value="pnb">Punjab National Bank</option>
                                <option value="bob">Bank of Baroda</option>
                            </select>
                        </div>
                        <button class="btn-primary" onclick="proceedToBank()">Proceed to Bank</button>
                        <div class="payment-amount">
                            <h4>Amount: ₹${this.formatNumber(amount)}</h4>
                        </div>
                    </div>
                `;
                break;
                
            case 'card':
                container.innerHTML = `
                    <div class="payment-form">
                        <h3>Card Payment</h3>
                        <form class="card-form">
                            <div class="form-group">
                                <label>Card Number</label>
                                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="form-group">
                                    <label>CVV</label>
                                    <input type="text" placeholder="123" maxlength="3">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Cardholder Name</label>
                                <input type="text" placeholder="John Doe">
                            </div>
                            <button type="submit" class="btn-primary">Pay ₹${this.formatNumber(amount)}</button>
                        </form>
                    </div>
                `;
                break;
                
            case 'wallet':
                container.innerHTML = `
                    <div class="payment-form">
                        <h3>Mobile Wallet</h3>
                        <div class="wallet-options">
                            <button class="wallet-btn" data-wallet="paytm">
                                <img src="https://via.placeholder.com/40x40/004B8D/FFFFFF?text=PM" alt="Paytm">
                                <span>Paytm</span>
                            </button>
                            <button class="wallet-btn" data-wallet="phonepe">
                                <img src="https://via.placeholder.com/40x40/7C3AED/FFFFFF?text=PP" alt="PhonePe">
                                <span>PhonePe</span>
                            </button>
                            <button class="wallet-btn" data-wallet="amazon">
                                <img src="https://via.placeholder.com/40x40/FF9900/FFFFFF?text=AP" alt="Amazon Pay">
                                <span>Amazon Pay</span>
                            </button>
                        </div>
                        <div class="payment-amount">
                            <h4>Amount: ₹${this.formatNumber(amount)}</h4>
                        </div>
                    </div>
                `;
                break;
        }
        
        // Add event listeners for the new form elements
        this.addPaymentFormListeners(method);
    }
    
    // Add Payment Form Listeners
    addPaymentFormListeners(method) {
        if (method === 'card') {
            const cardForm = this.paymentFormContainer.querySelector('.card-form');
            if (cardForm) {
                cardForm.addEventListener('submit', (e) => this.handleCardPayment(e));
            }
        }
        
        // Copy UPI ID functionality
        const copyBtn = this.paymentFormContainer.querySelector('.btn-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard('cfmarc@paytm'));
        }
        
        // Wallet selection
        const walletBtns = this.paymentFormContainer.querySelectorAll('.wallet-btn');
        walletBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectWallet(btn.dataset.wallet));
        });
    }
    
    // Handle Card Payment
    async handleCardPayment(e) {
        e.preventDefault();
        
        this.showProcessing();
        
        // Simulate payment processing
        setTimeout(() => {
            this.showPaymentSuccess();
        }, 3000);
    }
    
    // Copy to Clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('UPI ID copied to clipboard');
        }).catch(() => {
            this.showError('Unable to copy UPI ID');
        });
    }
    
    // Show Payment Success
    showPaymentSuccess() {
        const container = this.paymentFormContainer;
        container.innerHTML = `
            <div class="payment-success">
                <div class="success-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <h3>Payment Successful!</h3>
                <p>Your payment of ₹${this.formatNumber(parseFloat(this.paymentAmountInput.value) || 0)} has been processed successfully.</p>
                <div class="transaction-details">
                    <p><strong>Transaction ID:</strong> TXN${Date.now()}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
                <button class="btn-primary" onclick="window.location.href='index.html'">Back to Home</button>
            </div>
        `;
    }
    
    // Utility Functions
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    showError(message) {
        this.removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const currentStep = document.querySelector('.payment-step.active');
        currentStep.insertBefore(errorDiv, currentStep.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    showSuccess(message) {
        this.removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const currentStep = document.querySelector('.payment-step.active');
        currentStep.insertBefore(successDiv, currentStep.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
    
    removeMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }
    
    showLoading(button) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-block';
        
        button.disabled = true;
    }
    
    hideLoading(button) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        
        button.disabled = false;
    }
    
    showProcessing() {
        const container = this.paymentFormContainer;
        container.innerHTML = `
            <div class="payment-processing">
                <div class="processing-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                </div>
                <h3>Processing Payment...</h3>
                <p>Please wait while we process your payment securely.</p>
                <div class="processing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    }
}

// Initialize Payment Gateway when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.paymentGateway) {
        window.paymentGateway = new PaymentGateway();
        console.log('Payment Gateway initialized');
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    if (!window.paymentGateway) {
        window.paymentGateway = new PaymentGateway();
        console.log('Payment Gateway initialized (immediate)');
    }
}
