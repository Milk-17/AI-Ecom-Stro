// import 
const express = require ('express');
const { authCheck} = require('../middlewares/authCheck')
const router = express.Router ();

// Import controllers
const { changeOrderStatus,getOrderAdmin , getOrderStats } = require('../controllers/admin')

// Enpoint http://localhost:5001/api/admin
router.put('/admin/order-status',authCheck,changeOrderStatus);
router.get('/admin/orders',authCheck,getOrderAdmin);
router.get('/admin/order-stats',authCheck,getOrderStats);


module.exports = router 