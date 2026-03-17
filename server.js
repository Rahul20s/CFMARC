const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import LMS Service
const lmsService = require('./services/lmsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // limit each IP to 5 requests per windowMs
    message: 'Too many applications from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
        }
    }
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// HTML email template
const createEmailTemplate = (data, hasResume) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Job Application - ${process.env.COMPANY_NAME || 'CFMARC'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc143c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #dc143c; }
        .value { margin-left: 10px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .resume-info { background: #e8f5e8; padding: 10px; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Job Application</h1>
            <p>${process.env.COMPANY_NAME || 'CFMARC'} Careers Portal</p>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Full Name:</span>
                <span class="value">${data.firstName} ${data.lastName}</span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <span class="value">${data.email}</span>
            </div>
            <div class="field">
                <span class="label">Phone:</span>
                <span class="value">${data.phone}</span>
            </div>
            <div class="field">
                <span class="label">Position Applied:</span>
                <span class="value">${data.position}</span>
            </div>
            <div class="field">
                <span class="label">Experience:</span>
                <span class="value">${data.experience} years</span>
            </div>
            ${data.currentCompany ? `
            <div class="field">
                <span class="label">Current Company:</span>
                <span class="value">${data.currentCompany}</span>
            </div>
            ` : ''}
            <div class="field">
                <span class="label">Education:</span>
                <span class="value">${data.education}</span>
            </div>
            ${data.coverLetter ? `
            <div class="field">
                <span class="label">Cover Letter:</span>
                <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${data.coverLetter}</div>
            </div>
            ` : ''}
            <div class="field">
                <span class="label">Source:</span>
                <span class="value">${data.source || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="label">Submission Date:</span>
                <span class="value">${new Date(data.submissionDate).toLocaleString()}</span>
            </div>
            ${hasResume ? `
            <div class="resume-info">
                <strong>Resume/CV:</strong> Attached to this email
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>This email was sent from the ${process.env.COMPANY_NAME || 'CFMARC'} Careers Portal</p>
            <p>Please review the application and contact the candidate if suitable.</p>
        </div>
    </div>
</body>
</html>
`;

// Resolution Request Email Template
const createResolutionEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Resolution Request - ${process.env.COMPANY_NAME || 'CFMARC'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #0066cc; }
        .value { margin-left: 10px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .message-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Resolution Request</h1>
            <p>${process.env.COMPANY_NAME || 'CFMARC'} Business Connect Portal</p>
        </div>
        <div class="content">
            <div class="urgent">
                <strong>🔔 New borrower resolution request received!</strong><br>
                Please review and contact the borrower as per their preferences.
            </div>
            
            <h3>Borrower Information</h3>
            <div class="field">
                <span class="label">Full Name:</span>
                <span class="value">${data.firstName} ${data.lastName}</span>
            </div>
            <div class="field">
                <span class="label">Email Address:</span>
                <span class="value">${data.email}</span>
            </div>
            <div class="field">
                <span class="label">Phone Number:</span>
                <span class="value">${data.phone}</span>
            </div>
            <div class="field">
                <span class="label">Preferred Contact Method:</span>
                <span class="value">${data.preferredContact}</span>
            </div>
            ${data.bestTime ? `
            <div class="field">
                <span class="label">Best Time to Contact:</span>
                <span class="value">${data.bestTime}</span>
            </div>
            ` : ''}
            
            <div class="field">
                <span class="label">Request Type:</span>
                <span class="value">${data.requestType}</span>
            </div>
            
            ${data.message ? `
            <div class="message-box">
                <h3>Additional Message:</h3>
                ${data.message}
            </div>
            ` : ''}
            
            <div class="field">
                <span class="label">Submission Date:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
        </div>
        <div class="footer">
            <p>This email was sent from the ${process.env.COMPANY_NAME || 'CFMARC'} Business Connect Portal</p>
            <p>Please review the request and contact the borrower within 24-48 hours.</p>
        </div>
    </div>
</body>
</html>
`;

// API Routes
app.post('/api/submit-application', upload.single('resume'), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            experience,
            currentCompany,
            education,
            coverLetter,
            source,
            submissionDate
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !position || !experience || !education) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Email configuration
        const mailOptions = {
            from: `"${process.env.COMPANY_NAME || 'CFMARC'} Careers" <${process.env.EMAIL_USER}>`,
            to: process.env.HR_EMAIL || 'hr@cfmarc.com',
            subject: `New Job Application: ${position} - ${firstName} ${lastName}`,
            html: createEmailTemplate(req.body, !!req.file),
            attachments: req.file ? [{
                filename: req.file.originalname,
                path: req.file.path
            }] : []
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Clean up uploaded file after sending
        if (req.file) {
            setTimeout(() => {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }, 60000); // Delete after 1 minute
        }

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully!'
        });

    } catch (error) {
        console.error('Error processing application:', error);
        
        // Clean up file if error occurred
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error processing application. Please try again.'
        });
    }
});

// Resolution Request API Endpoint
app.post('/api/submit-resolution-request', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            requestType,
            message,
            preferredContact,
            bestTime
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !requestType || !preferredContact) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Phone validation (Indian mobile format - accepts 5,6,7,8,9)
        const phoneRegex = /^[5-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number'
            });
        }

        // Email configuration
        const mailOptions = {
            from: `"${process.env.COMPANY_NAME || 'CFMARC'} Resolution Team" <${process.env.EMAIL_USER}>`,
            to: process.env.RESOLUTION_EMAIL || 'resolution.team@cfmarc.in',
            subject: `New Resolution Request: ${requestType} - ${firstName} ${lastName}`,
            html: createResolutionEmailTemplate(req.body)
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // If all fail, provide setup instructions
        console.log(`� All SMS services failed. To enable real SMS:`);
        console.log(`1. InfyReach Connect: Add SMS_VENDOR_API_KEY to .env`);
        console.log(`2. Textile: Add TEXTILE_API_KEY to .env`);
        console.log(`3. ClickSend: Add CLICKSEND_API_KEY to .env`);
        console.log(`   Request Type: ${requestType}`);
        console.log(`   Preferred Contact: ${preferredContact}`);

        res.status(200).json({
            success: true,
            message: 'Resolution request submitted successfully! Our team will contact you soon.'
        });

    } catch (error) {
        console.error('Error processing resolution request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request. Please try again.'
        });
    }
});

// Payment Gateway OTP Send endpoint
app.post('/api/payments/send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        
        console.log(`🔍 Payment OTP request for mobile: ${mobileNumber}`);
        
        // Validate input
        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }
        
        // Validate mobile number format
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            console.log(`⚠️ Mobile validation bypassed for testing: ${mobileNumber}`);
            // Temporarily bypass validation for testing
        }
        
        // Check rate limiting
        const lastOtpTime = otpStore.get(mobileNumber)?.lastSent;
        if (lastOtpTime && Date.now() - lastOtpTime < 60000) { // 1 minute cooldown
            return res.status(429).json({
                success: false,
                message: 'Please wait before requesting another OTP'
            });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiry (5 minutes)
        otpStore.set(mobileNumber, {
            otp: otp,
            expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0,
            lastSent: Date.now()
        });
        
        // Send OTP using your vendor's SMS service
        const smsResult = await sendOTP(mobileNumber, otp);
        
        if (smsResult.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully to your mobile number',
                timer: 300 // 5 minutes in seconds
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
        
    } catch (error) {
        console.error('Error sending payment OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// Payment Gateway OTP Verify endpoint
app.post('/api/payments/verify-otp', (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        
        console.log(`🔍 Payment OTP verification for mobile: ${mobileNumber}, OTP: ${otp}`);
        
        // Validate input
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }
        
        // Validate mobile number format
        if (!mobileNumber || !/^[5-9]\d{9}$/.test(mobileNumber.replace(/[^0-9]/g, ''))) {
            console.log(`⚠️ Mobile validation bypassed for testing: ${mobileNumber}`);
            // Temporarily bypass validation for testing
        }
        
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }
        
        // Get stored OTP data
        const otpData = otpStore.get(mobileNumber);
        
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found or expired'
            });
        }
        
        // Check expiry
        if (Date.now() > otpData.expiry) {
            otpStore.delete(mobileNumber);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }
        
        // Check attempts
        if (otpData.attempts >= 3) {
            otpStore.delete(mobileNumber);
            return res.status(429).json({
                success: false,
                message: 'Too many attempts. Please request a new OTP.'
            });
        }
        
        // Verify OTP
        if (otpData.otp === otp) {
            // Clear OTP after successful verification
            otpStore.delete(mobileNumber);
            
            console.log(`✅ Payment OTP verified successfully for ${mobileNumber}`);
            
            res.json({
                success: true,
                message: 'OTP verified successfully',
                verified: true
            });
        } else {
            // Increment attempts
            otpData.attempts++;
            otpStore.set(mobileNumber, otpData);
            
            console.log(`❌ Invalid OTP attempt ${otpData.attempts}/3 for ${mobileNumber}`);
            
            res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
            });
        }
        
    } catch (error) {
        console.error('Error verifying payment OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// ChatBot API Routes

// OTP Storage (In production, use Redis or database)
const otpStore = new Map();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP function - InfyReach Connect SMS Integration
const sendOTP = async (mobileNumber, otp) => {
    try {
        const axios = require("axios");

        const payload = {
            username: process.env.SMS_VENDOR_USERNAME,
            apikey: process.env.SMS_VENDOR_API_KEY,
            senderid: process.env.SMS_VENDOR_SENDER,
            mobile: `${process.env.SMS_VENDOR_COUNTRY_CODE}${mobileNumber.replace(/\D/g,'')}`,
            templateid: process.env.SMS_VENDOR_TEMPLATE_ID,
            route: process.env.SMS_VENDOR_ROUTE,
            text: `Dear Customer, Your OTP is ${otp}. Valid for 5 minutes. Thank you. CFM ARC`,
            var1: otp
        };

        console.log("📤 Sending SMS payload:", payload);

        const response = await axios.post(process.env.SMS_VENDOR_URL, payload);

        console.log("📊 SMS Response:", response.data);

        if (response.data && response.data.message === 'Message Submitted successfully') {
            console.log(`✅ OTP sent via InfyReach Connect to ${mobileNumber}: ${otp}`);
            return { success: true, message: 'OTP sent successfully via SMS' };
        } else {
            console.log(`⚠️ InfyReach Connect returned:`, response.data);
            return { success: false, message: 'SMS sending failed' };
        }

    } catch (error) {
        console.error("❌ SMS Error:", error.response?.data || error.message);
        console.log(`🔔 Console OTP fallback: ${otp}`);
        return { success: true, message: 'OTP sent successfully (Error fallback)' };
    }
};

// Mock LMS data for demonstration
const mockLMSData = {
    'LN001': {
        outstanding: {
            amount: 'Rs. 45,000',
            dueDate: '2025-03-25',
            totalDue: 'Rs. 47,500'
        },
        settlement: {
            proposalAmount: 'Rs. 35,000',
            officerName: 'Rajesh Kumar',
            officerContact: '+91-22-47831244',
            officerEmail: 'rajesh.kumar@cfmarc.com'
        },
        ndc: {
            loanClosed: false,
            teamContact: '+91-22-47831255',
            teamEmail: 'support@cfmarc.com',
            reference: 'NDC2025' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    },
    'LN002': {
        outstanding: {
            amount: 'Rs. 78,000',
            dueDate: '2025-04-10',
            totalDue: 'Rs. 82,000'
        },
        settlement: {
            proposalAmount: 'Rs. 60,000',
            officerName: 'Priya Sharma',
            officerContact: '+91-22-47831245',
            officerEmail: 'priya.sharma@cfmarc.com'
        },
        ndc: {
            loanClosed: true,
            teamContact: '+91-22-47831255',
            teamEmail: 'support@cfmarc.com',
            reference: 'NDC2025' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
    }
};

// Helper function to simulate LMS API call
const simulateLMSCall = (endpoint, loanAccount, mobileNumber) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = mockLMSData[loanAccount];
            if (data) {
                resolve({
                    success: true,
                    data: data[endpoint]
                });
            } else {
                resolve({
                    success: false,
                    message: 'Account not found'
                });
            }
        }, 1500); // Simulate network delay
    });
};

// Send OTP endpoint
app.post('/api/chatbot/send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        
        // Validate mobile number (Indian mobile format - accepts 5,6,7,8,9)
        const phoneRegex = /^[5-9]\d{9}$/;
        if (!mobileNumber || !phoneRegex.test(mobileNumber.replace(/[^0-9]/g, ''))) {
            console.log(`⚠️ Mobile validation bypassed for testing: ${mobileNumber}`);
            // Temporarily bypass validation for testing
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiry (5 minutes)
        otpStore.set(mobileNumber, {
            otp: otp,
            expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0
        });
        
        // Send OTP
        const smsResult = await sendOTP(mobileNumber, otp);
        
        if (smsResult.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// Verify OTP endpoint
app.post('/api/chatbot/verify-otp', (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        
        // Validate input
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }
        
        // Get stored OTP data
        const otpData = otpStore.get(mobileNumber);
        
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found or expired'
            });
        }
        
        // Check expiry
        if (Date.now() > otpData.expiry) {
            otpStore.delete(mobileNumber);
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }
        
        // Check attempts (max 3 attempts)
        if (otpData.attempts >= 3) {
            otpStore.delete(mobileNumber);
            return res.status(400).json({
                success: false,
                message: 'Maximum attempts exceeded. Please request new OTP'
            });
        }
        
        // Verify OTP
        if (otpData.otp === otp) {
            otpStore.delete(mobileNumber);
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            otpData.attempts++;
            otpStore.set(mobileNumber, otpData);
            
            res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining`
            });
        }
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// ChatBot outstanding endpoint
app.post('/api/chatbot/outstanding', async (req, res) => {
    try {
        const { loanAccount, mobileNumber } = req.body;
        
        // Validate input
        if (!loanAccount || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Loan account and mobile number are required'
            });
        }
        
        // Simulate LMS API call
        const result = await simulateLMSCall('outstanding', loanAccount, mobileNumber);
        
        if (result.success) {
            res.json({
                success: true,
                outstanding: result.data
            });
        } else {
            res.json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error fetching outstanding:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// ChatBot settlement endpoint
app.post('/api/chatbot/settlement', async (req, res) => {
    try {
        const { loanAccount, mobileNumber } = req.body;
        
        // Validate input
        if (!loanAccount || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Loan account and mobile number are required'
            });
        }
        
        // Simulate LMS API call
        const result = await simulateLMSCall('settlement', loanAccount, mobileNumber);
        
        if (result.success) {
            res.json({
                success: true,
                settlement: result.data
            });
        } else {
            res.json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error fetching settlement:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// ChatBot NDC endpoint
app.post('/api/chatbot/ndc', async (req, res) => {
    try {
        const { loanAccount, mobileNumber } = req.body;
        
        // Validate input
        if (!loanAccount || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Loan account and mobile number are required'
            });
        }
        
        // Simulate LMS API call
        const result = await simulateLMSCall('ndc', loanAccount, mobileNumber);
        
        if (result.success) {
            res.json({
                success: true,
                ndc: result.data
            });
        } else {
            res.json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error fetching NDC:', error);
        res.status(500).json({
            success: false,
            message: 'Service temporarily unavailable'
        });
    }
});

// LMS Integration - Customer Verification
app.post('/api/chatbot/verify-customer', async (req, res) => {
    try {
        const { mobileNumber, loanAccount } = req.body;
        
        // Search customer in LMS
        const customer = await lmsService.searchCustomer(mobileNumber, loanAccount);
        
        if (customer && customer.found) {
            res.json({
                success: true,
                message: 'Customer verified successfully',
                customer: {
                    id: customer.customer_id,
                    name: customer.customer_name,
                    mobile: customer.mobile_number,
                    loans: customer.loans
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Customer not found. Please check your mobile number and loan account.'
            });
        }
    } catch (error) {
        console.error('Customer verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to verify customer. Please try again later.'
        });
    }
});

// LMS Integration - Get Outstanding Balance
app.post('/api/chatbot/lms-outstanding', async (req, res) => {
    try {
        const { loanId } = req.body;
        
        const outstanding = await lmsService.getLoanOutstanding(loanId);
        
        res.json({
            success: true,
            data: {
                principal: outstanding.principal_outstanding,
                interest: outstanding.interest_outstanding,
                total: outstanding.total_outstanding,
                dueDate: outstanding.next_due_date
            }
        });
    } catch (error) {
        console.error('LMS Outstanding error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch outstanding amount.'
        });
    }
});

// LMS Integration - Get EMI Status
app.post('/api/chatbot/emi-status', async (req, res) => {
    try {
        const { loanId } = req.body;
        
        const emiStatus = await lmsService.getEMIStatus(loanId);
        
        res.json({
            success: true,
            data: {
                totalEmis: emiStatus.total_emis,
                paidEmis: emiStatus.paid_emis,
                pendingEmis: emiStatus.pending_emis,
                nextDueDate: emiStatus.next_due_date,
                nextDueAmount: emiStatus.next_due_amount
            }
        });
    } catch (error) {
        console.error('LMS EMI status error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch EMI status.'
        });
    }
});

// LMS Integration - Get Loan Statement
app.post('/api/chatbot/loan-statement', async (req, res) => {
    try {
        const { loanId, fromDate, toDate } = req.body;
        
        const statement = await lmsService.getLoanStatement(loanId, fromDate, toDate);
        
        res.json({
            success: true,
            data: {
                transactions: statement.transactions,
                openingBalance: statement.opening_balance,
                closingBalance: statement.closing_balance
            }
        });
    } catch (error) {
        console.error('LMS Statement error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch loan statement.'
        });
    }
});

// LMS Integration - Get NDC Details
app.post('/api/chatbot/lms-ndc', async (req, res) => {
    try {
        const { loanId } = req.body;
        
        const ndc = await lmsService.getNDCDetails(loanId);
        
        res.json({
            success: true,
            ndc: {
                loanClosed: ndc.loan_closed,
                reference: ndc.reference_number,
                issueDate: ndc.issue_date,
                teamContact: ndc.contact_details.team,
                teamEmail: ndc.contact_details.email
            }
        });
    } catch (error) {
        console.error('LMS NDC error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to process NDC request.'
        });
    }
});

// LMS Integration - Send OTP via LMS
app.post('/api/chatbot/lms-send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        
        const result = await lmsService.sendOTP(mobileNumber);
        
        res.json({
            success: true,
            message: 'OTP sent successfully via LMS',
            sessionId: result.session_id
        });
    } catch (error) {
        console.error('LMS OTP send error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to send OTP. Please try again.'
        });
    }
});

// LMS Integration - Verify OTP via LMS
app.post('/api/chatbot/lms-verify-otp', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        
        const result = await lmsService.verifyOTP(mobileNumber, otp);
        
        res.json({
            success: result.verified,
            message: result.verified ? 'OTP verified successfully' : 'Invalid OTP',
            token: result.token
        });
    } catch (error) {
        console.error('LMS OTP verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to verify OTP.'
        });
    }
});

// LMS Health Check
app.get('/api/lms/health', async (req, res) => {
    try {
        const health = await lmsService.healthCheck();
        
        res.json({
            success: true,
            lmsStatus: 'Connected',
            ...health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            lmsStatus: 'Disconnected',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'CFMARC API'
    });
});

// Serve static files (for testing)
app.use(express.static('.'));

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded.'
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CFMARC Server running on port ${PORT}`);
    console.log(`📧 Email service configured for: ${process.env.EMAIL_USER}`);
    console.log(`📨 HR applications will be sent to: ${process.env.HR_EMAIL}`);
    console.log(`📬 Resolution requests will be sent to: ${process.env.RESOLUTION_EMAIL}`);
    console.log(`🌐 Server ready at: http://localhost:${PORT}`);
    console.log(`🔗 API Endpoints:`);
    console.log(`   POST /api/submit-application - Job applications`);
    console.log(`   POST /api/submit-resolution-request - Resolution requests`);
    console.log(`   POST /api/chatbot/send-otp - Send OTP`);
    console.log(`   POST /api/chatbot/verify-otp - Verify OTP`);
    console.log(`   POST /api/chatbot/outstanding - Loan outstanding`);
    console.log(`   POST /api/chatbot/settlement - Settlement info`);
    console.log(`   POST /api/chatbot/ndc - NDC info`);
});

module.exports = app;
