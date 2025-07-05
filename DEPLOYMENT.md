# ClipGenius Deployment Guide

This guide covers different deployment options for ClipGenius.

## 🚀 Quick Deploy Options

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/clipgenius.git
cd clipgenius

# Copy environment file
cp .env.example .env

# Edit .env with your OpenAI API key
nano .env

# Build and run with Docker Compose
docker-compose up -d
```

### Option 2: Railway.app

1. Fork this repository
2. Connect your GitHub to Railway.app
3. Create new project from GitHub repository
4. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production
5. Deploy automatically

### Option 3: Render.com

1. Fork this repository
2. Create new web service on Render
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: production

### Option 4: Vercel + Heroku

**Frontend (Vercel):**
1. Fork repository
2. Deploy frontend to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`

**Backend (Heroku):**
1. Create new Heroku app
2. Connect GitHub repository
3. Set buildpacks: `heroku/nodejs`
4. Add environment variables
5. Deploy

## 🔧 Environment Variables

Required environment variables for production:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Optional)
DATABASE_URL=postgresql://username:password@localhost:5432/clipgenius

# Security
SESSION_SECRET=your_random_session_secret_here
```

## 📦 Build Process

The application uses a multi-stage build process:

1. **Frontend Build**: `npm run build` creates optimized React build
2. **Backend Build**: ESBuild bundles the Node.js server
3. **Static Serving**: Express serves the built frontend

## 🐳 Docker Configuration

### Single Container (Development)
```bash
docker build -t clipgenius .
docker run -p 5000:5000 --env-file .env clipgenius
```

### Multi-Container (Production)
```bash
docker-compose up -d
```

This includes:
- Main application container
- PostgreSQL database
- Persistent volumes for uploads/output

## 🔒 Security Considerations

### Production Security Checklist:
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure file upload limits
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy

### File Security:
- [ ] Implement file type validation
- [ ] Set up virus scanning
- [ ] Configure file size limits
- [ ] Set up automatic cleanup

## 🗄️ Database Setup

### PostgreSQL (Recommended for Production)

```sql
-- Create database
CREATE DATABASE clipgenius;

-- Create user
CREATE USER clipgenius_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE clipgenius TO clipgenius_user;
```

### Connection String:
```env
DATABASE_URL=postgresql://clipgenius_user:your_password@localhost:5432/clipgenius
```

## 📊 Monitoring and Logging

### Recommended Monitoring Tools:
- **Application**: PM2 for process management
- **Logs**: Winston for structured logging
- **Metrics**: Prometheus + Grafana
- **Uptime**: Uptime Robot or similar

### Log Configuration:
```javascript
// Add to server configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to production
      # Add your deployment commands here
```

## 📱 Mobile App (Future Enhancement)

For mobile app deployment:

1. **React Native**: Use Expo for cross-platform mobile app
2. **Capacitor**: Convert web app to mobile app
3. **PWA**: Progressive Web App for mobile-first experience

## 🧪 Testing

### Test Commands:
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage:
- API endpoints
- Video processing pipeline
- File upload/download
- Error handling
- User authentication

## 📈 Scaling Considerations

### Horizontal Scaling:
- Use load balancer (Nginx, AWS ALB)
- Implement Redis for session storage
- Use CDN for static assets
- Implement queue system for video processing

### Vertical Scaling:
- Increase CPU/RAM for video processing
- Use GPU acceleration for AI processing
- Implement caching layer
- Optimize database queries

## 🔧 Troubleshooting

### Common Issues:

1. **FFmpeg not found**:
   ```bash
   # Install FFmpeg
   sudo apt-get install ffmpeg
   ```

2. **OpenAI API quota exceeded**:
   - Check billing dashboard
   - Implement rate limiting
   - Add error handling

3. **File upload failures**:
   - Check file size limits
   - Verify disk space
   - Check file permissions

4. **Database connection issues**:
   - Verify DATABASE_URL
   - Check network connectivity
   - Ensure database is running

## 📞 Support

For deployment support:
- Check [Issues](https://github.com/yourusername/clipgenius/issues)
- Join our [Discord](https://discord.gg/clipgenius)
- Email: support@clipgenius.com