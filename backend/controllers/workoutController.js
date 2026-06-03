const Routine = require('../models/Routine');
const WorkoutLog = require('../models/WorkoutLog');

// Get all routines
const getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({}).populate('exercises');
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log a workout
const saveWorkoutLog = async (req, res) => {
  const { logs } = req.body; // Array of logs
  try {
    const createdLogs = [];
    for (const log of logs) {
      const newLog = await WorkoutLog.create({
        userId: req.user._id,
        exerciseId: log.exerciseId,
        sets: log.sets,
      });
      createdLogs.push(newLog);
    }
    res.status(201).json(createdLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress
const getProgress = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user._id }).populate('exerciseId').sort({ date: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all exercises
const getExercises = async (req, res) => {
  try {
    const exercises = await require('../models/Exercise').find({});
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a workout log
const deleteWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    // Check if the user owns this log
    if (log.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await log.deleteOne();
    res.json({ message: 'Log removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoutines, saveWorkoutLog, getProgress, getExercises, deleteWorkoutLog };
