require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const companyRoutes = require('./routes/companyRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reviewrate';

app.use(cors());
app.use(express.json());

// ── MongoDB Atlas connection ──
mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected → ${MONGO_URI.replace(/:([^@]+)@/, ':****@')}`))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Routes ──
app.use('/api/companies', companyRoutes);
app.use('/api/reviews',   reviewRoutes);

// ── Health check ──
app.get('/', (req, res) => res.json({ status: 'ok', message: 'ReviewRate API running' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
