const express = require('express');
const r = express.Router();
const c = require('../controllers/interviewController');
const { protect, tierCheck } = require('../middlewares/auth');

r.use(protect);
r.post('/start', tierCheck('interview'), c.startSession);
r.post('/answer', c.answer);
r.get('/sessions', c.getSessions);
r.get('/sessions/:id', c.getSession);
module.exports = r;
