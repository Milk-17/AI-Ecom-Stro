// import 
const express = require ('express');
const { authCheck} = require('../middlewares/authCheck')
const router = express.Router ();

// Import controllers
const { changeOrderStatus,getOrderAdmin } = require('../controllers/admin')

// Enpoint http://localhost:5001/api/admin
router.put('/admin/order-status',authCheck,changeOrderStatus);
router.get('/admin/orders',authCheck,getOrderAdmin);


module.exports = router 