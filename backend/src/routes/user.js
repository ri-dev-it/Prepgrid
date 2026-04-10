const express = require('express');
const r = express.Router();
const c = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

r.use(protect);
r.get('/dashboard', c.getDashboard);
r.put('/profile', c.updateProfile);
r.post('/payment/order', c.createOrder);
r.post('/payment/confirm', c.confirmPayment);
r.get('/payment/history', c.getBillingHistory);
module.exports = r;
