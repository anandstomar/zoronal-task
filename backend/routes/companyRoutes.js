const express = require('express');
const router  = express.Router();
const Company = require('../models/Company');
const Review  = require('../models/Review');

/* ── Helper: compute avgRating + reviewCount for a company ── */
async function withStats(company) {
  const reviews   = await Review.find({ companyId: company._id });
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;
  return { ...company.toObject(), avgRating, reviewCount: reviews.length };
}

/* ── GET /api/companies  (search + filter) ── */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;          // single search term from frontend

    let query = {};
    if (search && search.trim()) {
      const re = { $regex: search.trim(), $options: 'i' };
      // location = display address (not searchable); city = search field
      query = { $or: [{ name: re }, { city: re }] };
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    const result    = await Promise.all(companies.map(withStats));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── GET /api/companies/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(await withStats(company));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── POST /api/companies ── */
router.post('/', async (req, res) => {
  try {
    const { name, address, location, city, foundedOn, logoUrl, description } = req.body;
    const company = new Company({
      name,
      address:   address   || '',
      location:  location  || '',
      city:      city      || '',
      foundedOn,
      logoUrl:   logoUrl   || '',
      description: description || ''
    });
    const saved = await company.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
