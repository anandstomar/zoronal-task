const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Company = require('../models/Company');

// Get reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { sort } = req.query; // 'date', 'rating', 'relevance'
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'rating') {
      sortQuery = { rating: -1, createdAt: -1 };
    } else if (sort === 'relevance') {
      sortQuery = { likes: -1, createdAt: -1 };
    }

    const reviews = await Review.find({ companyId: req.params.companyId }).sort(sortQuery);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a review
router.post('/', async (req, res) => {
  try {
    // verify company exists
    const company = await Company.findById(req.body.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const review = new Review({
      companyId: req.body.companyId,
      fullName:  req.body.fullName,
      reviewText:req.body.reviewText,
      rating:    req.body.rating
    });

    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a review
router.post('/:id/like', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.likes += 1;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
