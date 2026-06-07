const mongoose = require('mongoose');

const cardioLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  distance: {
    type: Number, // distance in km or miles
    required: true,
  },
  calories: {
    type: Number, // kcal
    required: true,
  },
  duration: {
    type: Number, // time in minutes
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('CardioLog', cardioLogSchema);
