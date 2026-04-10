const express = require('express');
const r = express.Router();
const c = require('../controllers/practiceController');
const { protect, tierCheck } = require('../middlewares/auth');

r.use(protect);
r.get('/questions', c.getQuestions);
r.get('/questions/:id', c.getQuestion);
r.post('/run', c.runCode);
r.post('/submit', tierCheck('practice'), c.submitCode);
r.post('/hint', c.getHint);
r.post('/bookmark/:questionId', c.toggleBookmark);
r.get('/submissions', c.getSubmissions);
module.exports = r;
