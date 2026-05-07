const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  fullName:  { type: String, required: true },
  reviewText:{ type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  likes:     { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
