const express = require('express');
const r = express.Router();
const c = require('../controllers/quizController');
const { protect } = require('../middlewares/auth');

r.use(protect);
r.post('/generate', c.generate);
r.post('/submit', c.submit);
r.get('/leaderboard/:topic', c.leaderboard);
r.get('/my-attempts', c.myAttempts);
module.exports = r;
