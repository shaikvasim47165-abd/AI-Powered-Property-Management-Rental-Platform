const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');

// @desc    Submit a new tenant enquiry for a property
// @route   POST /api/enquiries
// @access  Private
const createEnquiry = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required enquiry fields',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'The requested property could not be found',
      });
    }

    // Prevent owner from enquiring on their own listing
    if (property.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an enquiry on your own property listing',
      });
    }

    const enquiry = await Enquiry.create({
      tenantId: req.user._id,
      ownerId: property.ownerId,
      propertyId,
      name,
      email,
      phone,
      message,
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been successfully forwarded to the property owner!',
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all enquiries submitted by the current tenant
// @route   GET /api/enquiries/tenant
// @access  Private
const getTenantEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ tenantId: req.user._id })
      .populate('propertyId', 'title rent location images bedrooms propertyType status')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all enquiries received by the owner for their properties
// @route   GET /api/enquiries/owner
// @access  Private (Owner only)
const getOwnerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ ownerId: req.user._id })
      .populate('propertyId', 'title rent location images bedrooms propertyType status')
      .populate('tenantId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update enquiry status and notes
// @route   PUT /api/enquiries/:id
// @access  Private (Owner only)
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, ownerNotes } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    // Verify ownership
    if (enquiry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this enquiry',
      });
    }

    if (status) enquiry.status = status;
    if (ownerNotes !== undefined) enquiry.ownerNotes = ownerNotes;

    await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry status updated successfully',
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEnquiry,
  getTenantEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
};
