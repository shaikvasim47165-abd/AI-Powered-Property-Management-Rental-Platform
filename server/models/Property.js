const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      required: [true, 'Please provide a property description'],
      trim: true,
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Villa', 'Independent House', 'Studio', 'Penthouse', 'Gated Community'],
      default: 'Apartment',
      required: true,
    },
    listingType: {
      type: String,
      enum: ['Rent', 'Lease'],
      default: 'Rent',
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please specify the number of bedrooms'],
      min: 0,
      max: 10,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please specify the number of bathrooms'],
      min: 1,
      max: 10,
      default: 1,
    },
    areaSqFt: {
      type: Number,
      default: 800,
    },
    rent: {
      type: Number,
      required: [true, 'Please specify monthly rent in INR'],
      min: 1000,
    },
    deposit: {
      type: Number,
      required: [true, 'Please specify security deposit in INR'],
      min: 0,
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please specify the city'],
        trim: true,
      },
      area: {
        type: String,
        required: [true, 'Please specify the locality/area'],
        trim: true,
      },
      address: {
        type: String,
        default: '',
        trim: true,
      },
      pincode: {
        type: String,
        default: '',
        trim: true,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    furnishingStatus: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Unfurnished',
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'rented'],
      default: 'available',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast multi-filter property searching
PropertySchema.index({ 'location.city': 1, rent: 1, bedrooms: 1, status: 1 });
PropertySchema.index({ title: 'text', description: 'text', 'location.area': 'text' });

module.exports = mongoose.model('Property', PropertySchema);
