const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
  },
  bodyParts: [{
    type: String,
  }],
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
