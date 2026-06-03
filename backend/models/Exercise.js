const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bodyPart: {
    type: String,
    required: true,
  },
  defaultSets: {
    type: Number,
  },
  defaultReps: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
