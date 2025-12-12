// import 
const express = require ('express');
const router = express.Router ();

// Import controllers
const { register,login,currentUser,forgotPassword, resetPassword , currentAdmin , changePassword } = require('../controllers/auth');
// import middleware
const { authCheck,adminCheck } = require('../middlewares/authCheck');

// Enpoint http://localhost:5001/api/register
router.post('/register',register);
router.post('/login',login);
// 1. Register / Login
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// 2. Check User / Admin
router.post('/current-user',authCheck,currentUser);
router.post('/current-admin',authCheck,adminCheck,currentAdmin);
// 3. Forgot / Reset Password
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
// 4. Change Password
router.put('/user/change-password', authCheck, changePassword)

module.exports = router 