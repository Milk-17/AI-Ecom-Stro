const express = require('express');
const router = express.Router();
const { createOrder, getOrders , getRecentOrders, getPendingOrders, getOrderStats } = require('../controllers/order'); //  ต้องเป็น function จริงๆ

router.post("/order", createOrder);  // post ต้องรับ function เท่านั้น
router.get("/order", getOrders);


router.get("/order/recent", getRecentOrders);      // ออเดอร์ล่าสุด
router.get("/order/pending", getPendingOrders);    // ออเดอร์ที่ยังไม่จัดส่ง
router.get("/order/stats", getOrderStats);         // สถิติรวม
module.exports = router;