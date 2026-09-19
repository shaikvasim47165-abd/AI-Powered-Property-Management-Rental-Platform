const rateLimit = require('express-rate-limit');

// General API rate limiter: 300 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Search & Questions rate limiter
// For unauthenticated users: 10 requests / 15 mins (equivalent to spec limit)
// For authenticated users: 30 requests / 15 mins
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: (req) => {
    // If authenticated, allow 25 requests per hour, else 10 per hour
    return req.user ? 25 : 10;
  },
  keyGenerator: (req) => {
    return req.user ? `user_${req.user._id}` : req.ip;
  },
  message: {
    success: false,
    message: 'AI request limit reached for this hour. You can continue using standard filters and property browsing.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  aiLimiter,
};
