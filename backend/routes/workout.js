const express = require('express');
const { getRoutines, saveWorkoutLog, getProgress, getExercises, deleteWorkoutLog } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/routines', protect, getRoutines);
router.get('/exercises', protect, getExercises);
router.post('/logs', protect, saveWorkoutLog);
router.delete('/logs/:id', protect, deleteWorkoutLog);
router.get('/progress', protect, getProgress);

module.exports = router;
