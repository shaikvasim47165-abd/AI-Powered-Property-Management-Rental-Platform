const express = require('express');
const router = express.Router();
const {
  searchPropertiesAI,
  askPropertyQuestion,
} = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// Rate limiting & optional user tracking applied to AI endpoints
router.use(optionalAuth);
router.use(aiLimiter);

router.post('/search', searchPropertiesAI);
router.post('/property-question', askPropertyQuestion);

module.exports = router;
