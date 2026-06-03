const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutLog = require('../models/WorkoutLog');
const Routine = require('../models/Routine');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all logs
const getAllLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({}).populate('userId', 'email').populate('exerciseId', 'name');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exercise
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, deleteUser, getAllLogs, createExercise };
