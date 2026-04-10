const { QuizAttempt } = require('../models/index');
const groq = require('../services/groq');

exports.generate = async (req, res) => {
  try {
    const { topic, count = 10 } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic required' });
    const questions = await groq.generateQuiz(topic, Math.min(+count, 20));
    if (!questions.length) return res.status(500).json({ message: 'Failed to generate quiz. Try again.' });

    // Sanitize for client (hide isCorrect)
    const sanitized = questions.map((q) => ({
      question: q.question,
      options: q.options.map((o) => ({ text: o.text })),
      explanation: q.explanation,
    }));

    const token = Buffer.from(JSON.stringify(questions)).toString('base64');
    res.json({ questions: sanitized, token, topic, count: questions.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.submit = async (req, res) => {
  try {
    const { topic, token, answers, timeTaken } = req.body;
    const questions = JSON.parse(Buffer.from(token, 'base64').toString());
    let score = 0;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers?.[i] ?? {};
      const correctIdx = q.options.findIndex((o) => o.isCorrect);
      const isCorrect = ans.selectedOption === correctIdx;
      if (isCorrect) score++;
      results.push({ questionIndex: i, selectedOption: ans.selectedOption, isCorrect, correctIndex: correctIdx, explanation: q.explanation });
    }

    const attempt = await QuizAttempt.create({
      user: req.user._id, topic,
      questions: questions.map((q) => ({ question: q.question, options: q.options, explanation: q.explanation })),
      answers: results.map((r) => ({ questionIndex: r.questionIndex, selectedOption: r.selectedOption, isCorrect: r.isCorrect, score: r.isCorrect ? 1 : 0 })),
      score, totalQuestions: questions.length, timeTaken,
    });

    res.json({ score, total: questions.length, results, attemptId: attempt._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.leaderboard = async (req, res) => {
  try {
    const { topic } = req.params;
    const board = await QuizAttempt.aggregate([
      { $match: { topic } },
      { $group: { _id: '$user', best: { $max: '$score' }, total: { $sum: '$totalQuestions' }, attempts: { $sum: 1 } } },
      { $sort: { best: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $project: { name: '$u.name', best: 1, total: 1, attempts: 1 } },
    ]);
    res.json({ leaderboard: board });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.myAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .select('-questions -answers')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ attempts });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
