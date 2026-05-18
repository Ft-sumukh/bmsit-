// Polyfill browser objects for compatibility inside Node/Vercel serverless environments
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable dynamic CORS to support Vercel preview/production links and local setups smoothly
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server requests)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') || 
                        origin.includes('localhost') || 
                        origin.includes('127.0.0.1');
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging middleware in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}

// Serve uploaded study PDF documents statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the StudyMind API! Backend is fully operational.',
    documentation: 'https://github.com/Ft-sumukh/bmsit-',
    timestamp: new Date()
  });
});

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'StudyMind API Gateway',
    timestamp: new Date()
  });
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/studyplan', studyPlanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Central error catching middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only execute persistent port listening when running locally, not in Vercel Serverless mode
let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`🚀 StudyMind server running in local mode on port ${PORT}`);
  });

  // Graceful shutdown handling (only relevant for standalone local servers)
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server...');
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
      });
    }
  });
}

module.exports = app;
