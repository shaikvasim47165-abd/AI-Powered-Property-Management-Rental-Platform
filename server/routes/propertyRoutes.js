const express = require('express');
const router = express.Router();
const {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../services/storageService');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);

// Owner specific route (must come before /:id)
router.get('/owner/my-listings', protect, authorize('owner'), getMyProperties);

// Single property
router.get('/:id', getPropertyById);

// Owner CRUD actions
router.post('/', protect, authorize('owner'), createProperty);
router.put('/:id', protect, authorize('owner'), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);

// Image upload route
router.post(
  '/upload-image',
  protect,
  authorize('owner'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }
    // Return relative URL that will be served by Express static
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl,
    });
  }
);

module.exports = router;
