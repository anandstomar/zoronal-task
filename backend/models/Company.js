const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  address:   { type: String, default: '' },       // full street address e.g. "816, Shekhar Central..."
  location:  { type: String, required: true },    // state/country e.g. "Indore (M.P.)"
  city:      { type: String, required: true },    // city name e.g. "Indore"
  foundedOn: { type: Date, required: true },
  logoUrl:   { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
