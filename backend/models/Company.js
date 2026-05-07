const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  address:   { type: String, default: '' },
  location:  { type: String, required: true },
  city:      { type: String, required: true },
  foundedOn: { type: Date, required: true },
  logoUrl:   { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
