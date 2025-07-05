# ClipGenius - AI-Powered Video Editor

ClipGenius is a modern web application that transforms videos into engaging short-form content optimized for social media platforms like TikTok, Instagram Reels, and WhatsApp Status.

## 🎯 Features

- **Video Upload**: Drag-and-drop interface for video file uploads
- **Format Conversion**: Convert videos to 9:16 (vertical), 1:1 (square), or 16:9 (landscape)
- **AI Transcription**: Automatic subtitle generation using OpenAI Whisper
- **Scene Detection**: AI-powered content analysis for engagement optimization
- **Quality Options**: High (1080p), Medium (720p), Low (480p) output quality
- **YouTube Support**: Process videos directly from YouTube URLs (requires configuration)
- **Real-time Processing**: Live progress tracking and status updates
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components
- **TanStack React Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ESM modules
- **FFmpeg** for video processing
- **OpenAI API** for transcription and scene detection
- **Multer** for file uploads
- **In-memory storage** (easily replaceable with PostgreSQL)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- FFmpeg installed on system
- OpenAI API key (for transcription features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clipgenius.git
cd clipgenius
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
clipgenius/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── services/           # Business logic
│   │   ├── videoProcessor.ts
│   │   └── openai.ts
│   ├── routes.ts           # API routes
│   └── storage.ts          # Data storage layer
├── shared/                 # Shared TypeScript types
├── uploads/                # Uploaded video files
└── output/                 # Processed video files
```

## 🔧 Configuration

### Environment Variables

```env
# OpenAI API configuration
OPENAI_API_KEY=your_openai_api_key

# Database (optional - uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@localhost:5432/clipgenius

# Server configuration
NODE_ENV=development
PORT=5000
```

### Video Processing Settings

The application supports three output formats:
- **9:16 (Vertical)**: Perfect for TikTok, Instagram Reels, YouTube Shorts
- **1:1 (Square)**: Ideal for Instagram posts, Facebook posts
- **16:9 (Landscape)**: Standard for YouTube, desktop viewing

Quality settings:
- **High**: 1080p resolution
- **Medium**: 720p resolution  
- **Low**: 480p resolution

## 🎬 Usage

### Video Upload
1. Visit the application homepage
2. Drag and drop a video file or click to browse
3. Select processing options:
   - Output format (9:16, 1:1, 16:9)
   - Quality (High, Medium, Low)
   - Enable/disable transcription
   - Enable/disable scene detection
4. Click "Process Video"
5. Monitor progress in real-time
6. Download the processed video when complete

### API Endpoints

- `POST /api/videos/upload` - Upload video file
- `POST /api/videos/youtube` - Process YouTube URL
- `GET /api/videos/jobs` - List all processing jobs
- `GET /api/videos/job/:id` - Get specific job status
- `GET /api/videos/download/:id` - Download processed video

## 🔒 Security Features

- Input validation and sanitization
- File type restrictions
- Rate limiting for API endpoints
- Secure file handling
- Error handling and logging

## 📱 Mobile Support

ClipGenius is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Optimized for small screens
- Progressive web app capabilities
- Offline processing status

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Environment Setup

For production deployment:
1. Set `NODE_ENV=production`
2. Configure proper database connection
3. Set up file storage (AWS S3, Google Cloud Storage)
4. Configure domain and SSL certificates
5. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@clipgenius.com or join our Discord community.

## 🎉 Acknowledgments

- [OpenAI](https://openai.com) for Whisper transcription API
- [FFmpeg](https://ffmpeg.org) for video processing
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Replit](https://replit.com) for development environment