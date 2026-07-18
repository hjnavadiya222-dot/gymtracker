const express = require('express');
const { 
  getRoutines, 
  saveWorkoutLog, 
  getProgress, 
  getExercises, 
  deleteWorkoutLog, 
  updateWorkoutLog, 
  saveCardioLog, 
  getCardioLogs,
  deleteCardioLog,
  updateCardioLog
} = require('../controllers/workoutController');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/routines', protect, getRoutines);
router.get('/exercises', protect, getExercises);
router.post('/logs', protect, saveWorkoutLog);
router.delete('/logs/:id', protect, deleteWorkoutLog);
router.put('/logs/:id', protect, updateWorkoutLog);
router.get('/progress', protect, getProgress);
router.get('/analytics', protect, getAnalytics);
router.post('/cardio', protect, saveCardioLog);
router.get('/cardio', protect, getCardioLogs);
router.delete('/cardio/:id', protect, deleteCardioLog);
router.put('/cardio/:id', protect, updateCardioLog);

module.exports = router;
