const express = require('express');
const r = express.Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

r.use(protect, adminOnly);
r.get('/stats', c.getStats);
r.get('/users', c.getUsers);
r.get('/questions', c.getAllQuestions);
r.post('/questions', c.createQuestion);
r.put('/questions/:id', c.updateQuestion);
r.delete('/questions/:id', c.deleteQuestion);
module.exports = r;
