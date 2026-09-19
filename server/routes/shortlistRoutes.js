const express = require('express');
const router = express.Router();
const {
  getShortlists,
  addShortlist,
  removeShortlist,
} = require('../controllers/shortlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All shortlist operations require login

router.get('/', getShortlists);
router.post('/', addShortlist);
router.delete('/:propertyId', removeShortlist);

module.exports = router;
