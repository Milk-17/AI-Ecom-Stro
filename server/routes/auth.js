// import 
const express = require ('express');
const router = express.Router ();

// Import controllers
const { register,login,currentUser,forgotPassword, resetPassword  } = require('../controllers/auth');
// import middleware
const { authCheck,adminCheck } = require('../middlewares/authCheck');

// Enpoint http://localhost:5001/api/register
router.post('/register',register);
router.post('/login',login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post('/current-user',authCheck,currentUser);
router.post('/current-admin',authCheck,adminCheck,currentUser);

module.exports = router 