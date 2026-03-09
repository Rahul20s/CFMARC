# CFMARC Careers Server - Setup Guide

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gmail account with App Password
- Code editor (VS Code recommended)

### 2. Installation

```bash
# Navigate to your project directory
cd "c:\Users\rahul.sharma\OneDrive - CFM Asset Reconstruction Private Limited\Desktop\WS Web"

# Install dependencies
npm install

# Install development dependencies (optional)
npm install --save-dev nodemon
```

### 3. Gmail Configuration

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" for the app
3. Select "Other (Custom name)" and enter "CFMARC Careers"
4. Click "Generate"
5. Copy the 16-character password (save it securely)

#### Step 3: Configure Environment
1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` file with your credentials:
```env
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# HR Email Configuration
HR_EMAIL=hr@cfmarc.com
COMPANY_NAME=CFMARC

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start at: `http://localhost:3000`

## 📧 Email Features

### What gets sent to HR:
- Professional HTML email template
- All form fields (name, email, phone, position, etc.)
- Resume/CV as attachment
- Submission timestamp
- Professional formatting with company branding

### Email Template Features:
- Responsive design
- Company colors (CFMARC red theme)
- Clear field organization
- Professional header and footer

## 🔒 Security Features

### Built-in Protections:
- **Rate Limiting**: 5 applications per 15 minutes per IP
- **File Validation**: Only PDF, DOC, DOCX files
- **File Size Limit**: Maximum 5MB
- **Input Validation**: Required field checking
- **CORS Enabled**: Secure cross-origin requests

### Additional Security Options:
```javascript
// In server.js, you can add:
app.use(helmet()); // Add security headers
app.use(express.json({ limit: '10mb' })); // Body size limit
```

## 🌐 Deployment Options

### Option 1: Local Development
```bash
# Terminal 1: Start your static server
python -m http.server 8000

# Terminal 2: Start your Node.js server
npm run dev
```

### Option 2: Cloud Deployment (Recommended)

#### Vercel (Free & Easy)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

#### Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

#### DigitalOcean/Vultr/AWS
1. Rent a VPS (minimum 1GB RAM)
2. Install Node.js and PM2
3. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "cfmarc-careers"
pm2 startup
pm2 save
```

## 🔧 Configuration Options

### Custom Email Providers
Replace Gmail settings in `.env`:

```env
# Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587

# Yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587

# SendGrid (Recommended for production)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Custom Email Template
Edit the `createEmailTemplate` function in `server.js` to match your brand.

## 📱 Testing

### Test the API:
```bash
# Health check
curl http://localhost:3000/api/health

# Test file upload (using curl)
curl -X POST \
  http://localhost:3000/api/submit-application \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "phone=1234567890" \
  -F "position=Senior Manager" \
  -F "experience=5" \
  -F "education=Bachelors" \
  -F "resume=@/path/to/resume.pdf"
```

### Test the Frontend:
1. Open your website: `http://localhost:8000/careers-at-cfmarc.html`
2. Click "Apply Now"
3. Fill out the form
4. Submit and check your HR email

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Email configuration error"
- Check your Gmail App Password
- Verify EMAIL_USER and EMAIL_PASS in `.env`
- Ensure 2FA is enabled on your Google account

#### 2. "CORS error"
- Make sure both servers are running
- Check that port 3000 is accessible

#### 3. "File upload error"
- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX only)
- Ensure uploads directory exists

#### 4. "Rate limit exceeded"
- Wait 15 minutes and try again
- Adjust RATE_LIMIT_MAX_REQUESTS in `.env`

### Debug Mode:
Add to `.env`:
```env
NODE_ENV=development
DEBUG=nodemailer
```

## 📊 Monitoring

### Add Logging:
```javascript
// In server.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Health Monitoring:
```bash
# Check server status
curl http://localhost:3000/api/health

# Monitor logs
pm2 logs cfmarc-careers
```

## 🔄 Updates & Maintenance

### Updating Dependencies:
```bash
npm update
npm audit fix
```

### Backup Configuration:
```bash
# Backup your .env file
cp .env .env.backup

# Backup uploaded resumes
tar -czf uploads-backup.tar.gz uploads/
```

## 📞 Support

If you encounter issues:
1. Check the console logs in your terminal
2. Verify all environment variables are set
3. Test with different email providers
4. Check file permissions on uploads directory

## 🎯 Next Steps

Once your server is running:
1. Test the complete application flow
2. Set up production deployment
3. Configure monitoring and alerts
4. Set up email forwarding rules
5. Test with different file types and sizes

Your CFMARC careers application is now ready to receive job applications! 🎉
