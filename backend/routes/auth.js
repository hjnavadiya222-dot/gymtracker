const express = require('express');
const { registerUser, authUser, updateProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
