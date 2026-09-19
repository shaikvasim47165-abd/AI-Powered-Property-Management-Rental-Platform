const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getTenantEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All enquiry routes require login

// Tenant actions
router.post('/', createEnquiry);
router.get('/tenant', getTenantEnquiries);

// Owner actions
router.get('/owner', authorize('owner'), getOwnerEnquiries);
router.put('/:id', authorize('owner'), updateEnquiryStatus);

module.exports = router;
