const Property = require('../models/Property');
const geminiService = require('../services/geminiService');

// @desc    Natural language AI property search
// @route   POST /api/ai/search
// @access  Public
const searchPropertiesAI = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search prompt or query',
      });
    }

    // Step 1: Use Gemini or heuristic parser to extract structured filters
    const { structuredFilters, aiExplanation, isAiGenerated } =
      await geminiService.parseNaturalLanguageSearch(query.trim());

    // Step 2: Build MongoDB query using extracted parameters (MongoDB is the source of truth)
    const mongoQuery = { status: 'available' };

    if (structuredFilters.city) {
      mongoQuery['location.city'] = new RegExp(structuredFilters.city, 'i');
    }

    if (structuredFilters.bedrooms !== null && structuredFilters.bedrooms !== undefined) {
      if (structuredFilters.bedrooms >= 4) {
        mongoQuery.bedrooms = { $gte: 4 };
      } else {
        mongoQuery.bedrooms = structuredFilters.bedrooms;
      }
    }

    if (structuredFilters.minRent || structuredFilters.maxRent) {
      mongoQuery.rent = {};
      if (structuredFilters.minRent) mongoQuery.rent.$gte = structuredFilters.minRent;
      if (structuredFilters.maxRent) mongoQuery.rent.$lte = structuredFilters.maxRent;
    }

    if (structuredFilters.propertyType) {
      mongoQuery.propertyType = new RegExp(structuredFilters.propertyType, 'i');
    }

    if (structuredFilters.furnished !== null && structuredFilters.furnished !== undefined) {
      mongoQuery.furnished = structuredFilters.furnished;
    }

    if (Array.isArray(structuredFilters.amenities) && structuredFilters.amenities.length > 0) {
      mongoQuery.amenities = { $in: structuredFilters.amenities };
    }

    // Step 3: Query MongoDB
    let properties = await Property.find(mongoQuery)
      .populate('ownerId', 'name email phone')
      .sort({ rent: 1, createdAt: -1 })
      .limit(20);

    // If strictly filtered query yielded 0 results, relax criteria slightly to offer close alternatives
    let relaxed = false;
    if (properties.length === 0 && (structuredFilters.amenities.length > 0 || structuredFilters.maxRent)) {
      const relaxedQuery = { status: 'available' };
      if (structuredFilters.city) {
        relaxedQuery['location.city'] = new RegExp(structuredFilters.city, 'i');
      }
      if (structuredFilters.bedrooms !== null && structuredFilters.bedrooms !== undefined) {
        relaxedQuery.bedrooms = structuredFilters.bedrooms;
      }

      properties = await Property.find(relaxedQuery)
        .populate('ownerId', 'name email phone')
        .sort({ rent: 1 })
        .limit(10);

      if (properties.length > 0) {
        relaxed = true;
      }
    }

    res.json({
      success: true,
      count: properties.length,
      originalQuery: query,
      extractedFilters: structuredFilters,
      aiExplanation: relaxed
        ? `${aiExplanation} (No exact matches found for all conditions, showing closest available matches).`
        : aiExplanation,
      isAiGenerated,
      relaxed,
      properties,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Ask AI a question grounded strictly in a specific property listing
// @route   POST /api/ai/property-question
// @access  Public
const askPropertyQuestion = async (req, res, next) => {
  try {
    const { propertyId, question } = req.body;

    if (!propertyId || !question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both propertyId and your question',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property listing not found',
      });
    }

    const response = await geminiService.answerPropertyQuestion(
      property,
      question.trim()
    );

    res.json({
      success: true,
      propertyId,
      question: question.trim(),
      answer: response.answer,
      grounded: response.grounded,
      isAiGenerated: response.isAiGenerated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchPropertiesAI,
  askPropertyQuestion,
};
