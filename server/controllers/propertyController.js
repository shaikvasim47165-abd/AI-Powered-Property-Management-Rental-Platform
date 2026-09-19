const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Shortlist = require('../models/Shortlist');

// @desc    Get all properties with filtering, searching, sorting, and pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      area,
      minRent,
      maxRent,
      bedrooms,
      propertyType,
      furnished,
      amenities,
      status = 'available',
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Availability status
    if (status && status !== 'all') {
      query.status = status;
    }

    // City filter (case-insensitive)
    if (city && city !== 'All') {
      query['location.city'] = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Area filter
    if (area) {
      query['location.area'] = new RegExp(area.trim(), 'i');
    }

    // Rent range filter
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // Bedrooms filter
    if (bedrooms !== undefined && bedrooms !== '' && bedrooms !== 'all') {
      const bedCount = Number(bedrooms);
      if (bedCount >= 4) {
        query.bedrooms = { $gte: 4 };
      } else {
        query.bedrooms = bedCount;
      }
    }

    // Property Type filter
    if (propertyType && propertyType !== 'All') {
      query.propertyType = propertyType;
    }

    // Furnishing status
    if (furnished !== undefined && furnished !== '') {
      query.furnished = furnished === 'true' || furnished === true;
    }

    // Amenities filter (comma-separated or array)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // General text search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: new RegExp(term, 'i') },
        { description: new RegExp(term, 'i') },
        { 'location.area': new RegExp(term, 'i') },
        { 'location.city': new RegExp(term, 'i') },
      ];
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { rent: 1 };
    else if (sort === 'price_desc') sortOptions = { rent: -1 };
    else if (sort === 'popular') sortOptions = { viewCount: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    // Pagination
    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('ownerId', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: properties.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize) || 1,
      properties,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured properties for landing page
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res, next) => {
  try {
    const featured = await Property.find({ status: 'available' })
      .populate('ownerId', 'name email phone')
      .sort({ featured: -1, viewCount: -1, createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      properties: featured,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'ownerId',
      'name email phone'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found',
      });
    }

    // Increment view count asynchronously
    await Property.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Owner only)
const createProperty = async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      ownerId: req.user._id,
    };

    // Auto-calculate furnished boolean if furnishingStatus is provided
    if (propertyData.furnishingStatus) {
      propertyData.furnished = propertyData.furnishingStatus === 'Furnished';
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully',
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found',
      });
    }

    // Verify ownership
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    // Update furnished status if furnishingStatus is passed
    if (req.body.furnishingStatus) {
      req.body.furnished = req.body.furnishingStatus === 'Furnished';
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ownerId', 'name email phone');

    res.json({
      success: true,
      message: 'Property updated successfully',
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found',
      });
    }

    // Verify ownership
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    // Delete property and clean up shortlists & enquiries
    await Promise.all([
      Property.findByIdAndDelete(req.params.id),
      Shortlist.deleteMany({ propertyId: req.params.id }),
      Enquiry.deleteMany({ propertyId: req.params.id }),
    ]);

    res.json({
      success: true,
      message: 'Property listing deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all properties owned by the current logged-in owner
// @route   GET /api/properties/owner/my-listings
// @access  Private (Owner only)
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    // Fetch enquiry counts for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (prop) => {
        const enquiryCount = await Enquiry.countDocuments({ propertyId: prop._id });
        const newEnquiryCount = await Enquiry.countDocuments({
          propertyId: prop._id,
          status: 'new',
        });
        return {
          ...prop.toObject(),
          totalEnquiries: enquiryCount,
          newEnquiries: newEnquiryCount,
        };
      })
    );

    res.json({
      success: true,
      properties: propertiesWithStats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
};
