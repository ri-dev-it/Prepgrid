const User = require('../models/User');
const Question = require('../models/Question');
const { Submission, InterviewSession, QuizAttempt } = require('../models/index');

exports.getStats = async (req, res) => {
  try {
    const [users, questions, submissions, sessions, quizzes] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Question.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      InterviewSession.countDocuments({ status: 'completed' }),
      QuizAttempt.countDocuments(),
    ]);

    const topQuestions = await Submission.aggregate([
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
      { $lookup: { from: 'questions', localField: '_id', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $project: { title: '$q.title', topic: '$q.topic', count: 1 } },
    ]);

    const topicsAvg = await Submission.aggregate([
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $group: { _id: '$q.topic', accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } }, total: { $sum: 1 } } },
      { $project: { topic: '$_id', rate: { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] } } },
      { $sort: { rate: 1 } },
    ]);

    res.json({ stats: { users, questions, submissions, sessions, quizzes }, topQuestions, topicsAvg });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -otp -otpExpiry').skip((page - 1) * limit).limit(+limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ users, total });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Questions CRUD ─────────────────────────────────────────────────────────
exports.createQuestion = async (req, res) => {
  try {
    const q = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ question: q });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.updateQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Not found' });
    res.json({ question: q });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Question removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().select('+testCases').sort({ createdAt: -1 });
    res.json({ questions });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
