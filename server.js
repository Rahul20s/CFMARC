const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'CFMARC Careers API'
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
    console.log(`🚀 CFMARC Careers Server running on port ${PORT}`);
    console.log(`📧 Email service configured for: ${process.env.EMAIL_USER}`);
    console.log(`📨 HR applications will be sent to: ${process.env.HR_EMAIL}`);
    console.log(`🌐 Server ready at: http://localhost:${PORT}`);
});

module.exports = app;
