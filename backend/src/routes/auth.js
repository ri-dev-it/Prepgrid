// routes/auth.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const passport = require('passport');

r.post('/register', c.register);
r.post('/login', c.login);
r.post('/refresh', c.refreshToken);
r.post('/forgot-password', c.forgotPassword);
r.post('/reset-password', c.resetPassword);
r.get('/me', protect, c.getMe);

r.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
r.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), c.googleCallback);

module.exports = r;
