const Shortlist = require('../models/Shortlist');
const Property = require('../models/Property');

// @desc    Get all shortlisted properties for logged-in user
// @route   GET /api/shortlists
// @access  Private
const getShortlists = async (req, res, next) => {
  try {
    const shortlists = await Shortlist.find({ userId: req.user._id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    // Filter out any properties that might have been deleted
    const validShortlists = shortlists
      .filter((s) => s.propertyId !== null)
      .map((s) => s.propertyId);

    res.json({
      success: true,
      count: validShortlists.length,
      properties: validShortlists,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add property to shortlist
// @route   POST /api/shortlists
// @access  Private
const addShortlist = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide propertyId',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Upsert or check existing
    const existing = await Shortlist.findOne({
      userId: req.user._id,
      propertyId,
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Property is already in your shortlist',
        shortlist: existing,
      });
    }

    const shortlist = await Shortlist.create({
      userId: req.user._id,
      propertyId,
    });

    res.status(201).json({
      success: true,
      message: 'Property added to your shortlist',
      shortlist,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove property from shortlist
// @route   DELETE /api/shortlists/:propertyId
// @access  Private
const removeShortlist = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await Shortlist.findOneAndDelete({
      userId: req.user._id,
      propertyId,
    });

    res.json({
      success: true,
      message: 'Property removed from your shortlist',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShortlists,
  addShortlist,
  removeShortlist,
};
