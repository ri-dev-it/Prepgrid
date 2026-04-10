const { InterviewSession } = require('../models/index');
const User = require('../models/User');
const groq = require('../services/groq');

const MAX_QUESTIONS = 10;

exports.startSession = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Frontend', 'Backend', 'Full Stack', 'DSA'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const user = req.user;
    user.checkAndResetUsage();
    user.monthlyInterviews += 1;
    user.interviewsAttempted += 1;
    await user.save();

    const session = await InterviewSession.create({ user: user._id, role });
    const question = await groq.generateInterviewQuestion(role, 'Easy', []);
    session.messages.push({ role: 'ai', content: question });
    session.questionsAsked = 1;
    await session.save();

    res.json({ sessionId: session._id, question, questionsAsked: 1, maxQuestions: MAX_QUESTIONS });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.answer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'completed') return res.status(400).json({ message: 'Session already completed' });

    const lastQ = [...session.messages].reverse().find((m) => m.role === 'ai');
    const evaluation = await groq.evaluateAnswer(lastQ.content, answer, session.role);

    session.messages.push({
      role: 'user',
      content: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvement: evaluation.improvement,
    });
    session.totalScore += evaluation.score || 0;

    const userMsgs = session.messages.filter((m) => m.role === 'user');
    session.averageScore = session.totalScore / userMsgs.length;

    const isLast = session.questionsAsked >= MAX_QUESTIONS;

    if (isLast) {
      const qaHistory = session.messages.map((m) => ({ role: m.role, content: m.content, score: m.score }));
      const summary = await groq.generateInterviewSummary(qaHistory, session.role);
      session.status = 'completed';
      session.summary = summary.summary;
      session.strengths = summary.strengths || [];
      session.improvements = summary.improvements || [];
      session.completedAt = new Date();

      // Update user average score
      const allSessions = await InterviewSession.find({ user: req.user._id, status: 'completed' });
      const avg = allSessions.reduce((a, s) => a + (s.averageScore || 0), 0) / allSessions.length;
      await User.findByIdAndUpdate(req.user._id, { averageInterviewScore: avg });
      await session.save();

      return res.json({ evaluation, completed: true, summary, session });
    }

    // Adaptive difficulty
    const difficulty = evaluation.score >= 8 ? 'Hard' : evaluation.score >= 5 ? 'Medium' : 'Easy';
    const prevQs = session.messages.filter((m) => m.role === 'ai').map((m) => m.content);
    const nextQuestion = await groq.generateInterviewQuestion(session.role, difficulty, prevQs);

    session.messages.push({ role: 'ai', content: nextQuestion });
    session.questionsAsked += 1;
    await session.save();

    res.json({ evaluation, nextQuestion, questionsAsked: session.questionsAsked, maxQuestions: MAX_QUESTIONS, completed: false });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .select('-messages')
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Not found' });
    res.json({ session });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
