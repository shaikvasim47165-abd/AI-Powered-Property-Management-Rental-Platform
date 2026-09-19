const mongoose = require('mongoose');

const ShortlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate shortlists by the same user
ShortlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', ShortlistSchema);
