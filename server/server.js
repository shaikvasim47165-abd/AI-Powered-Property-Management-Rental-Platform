require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');
const Property = require('./models/Property');
const { seedData } = require('./scripts/seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const shortlistRoutes = require('./routes/shortlistRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration (supports local dev and Vercel domains)
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure database connection for every request (essential for serverless lambdas)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured.',
    });
  }
});

// General rate limiter
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PropAI API Server',
    environment: process.env.NODE_ENV || 'development',
    serverless: !!process.env.VERCEL,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/shortlists', shortlistRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/ai', aiRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('[Server] Database is empty. Automatically initializing demo data & listings...');
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`[PropAI Server] Running on http://localhost:${PORT}`);
      console.log(`[PropAI Server] Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
};

// If not running inside Vercel serverless environment, start standalone server
if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
