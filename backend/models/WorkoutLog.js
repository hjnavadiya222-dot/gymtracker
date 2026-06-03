const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sets: [{
    reps: {
      type: String, // String because of '60s' etc.
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      default: 0,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
