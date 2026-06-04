const express = require('express');
const { getUsers, deleteUser, getAllLogs, createExercise, seedDatabase } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.route('/logs').get(protect, admin, getAllLogs);
router.route('/exercises').post(protect, admin, createExercise);
router.route('/seed').post(protect, admin, seedDatabase);

module.exports = router;
