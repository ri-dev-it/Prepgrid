const Question = require('../models/Question');
const { Submission } = require('../models/index');
const User = require('../models/User');
const piston = require('../services/piston');
const groq = require('../services/groq');

exports.getQuestions = async (req, res) => {
  try {
    const { difficulty, topic, page = 1, limit = 20, search } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (search) filter.$text = { $search: search };

    const [total, questions] = await Promise.all([
      Question.countDocuments(filter),
      Question.find(filter)
        .select('-testCases -hints')
        .skip((page - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
    ]);

    const solvedSet = new Set(
      (await Submission.find({ user: req.user._id, status: 'Accepted' }).distinct('question')).map(String)
    );
    const bookmarkSet = new Set(req.user.bookmarkedQuestions.map(String));

    const enriched = questions.map((q) => ({
      ...q.toObject(),
      solved: solvedSet.has(q._id.toString()),
      bookmarked: bookmarkSet.has(q._id.toString()),
    }));

    res.json({ questions: enriched, total, page: +page, pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id).select('+testCases');
    if (!q || !q.isActive) return res.status(404).json({ message: 'Not found' });
    const solved = await Submission.exists({ user: req.user._id, question: q._id, status: 'Accepted' });
    const bookmarked = req.user.bookmarkedQuestions.map(String).includes(q._id.toString());
    // Only send first 2 test cases visible to user (rest hidden)
    const visible = q.toObject();
    visible.examples = visible.examples || [];
    delete visible.testCases;
    res.json({ question: { ...visible, solved: !!solved, bookmarked } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.runCode = async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;
    const result = await piston.executeCode(code, language, input);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.submitCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const question = await Question.findById(questionId).select('+testCases');
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const result = await piston.runTestCases(code, language, question.testCases);
    const status =
      result.passed === result.total ? 'Accepted' :
      result.results.some(r => r.status === 'Runtime Error') ? 'Runtime Error' : 'Wrong Answer';

    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code,
      language,
      status,
      testCasesPassed: result.passed,
      totalTestCases: result.total,
      results: result.results,
    });

    // Update stats
    if (status === 'Accepted') {
      const prevAccepted = await Submission.countDocuments({ user: req.user._id, question: questionId, status: 'Accepted', _id: { $ne: submission._id } });
      if (!prevAccepted) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { questionsSolved: 1 } });
        await Question.findByIdAndUpdate(questionId, { $inc: { solvedCount: 1 } });
      }
    }
    await Question.findByIdAndUpdate(questionId, { $inc: { attemptCount: 1 } });

    const user = req.user;
    user.checkAndResetUsage();
    user.monthlyPractice += 1;
    user.totalSubmissions = (user.totalSubmissions || 0) + 1;
    await user.save();

    res.json({ submission: { ...submission.toObject(), results: result.results }, result });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getHint = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const q = await Question.findById(questionId);
    if (!q) return res.status(404).json({ message: 'Not found' });
    const hint = await groq.getCodeHint(code, language, q.title);
    res.json({ hint });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const qid = req.params.questionId;
    const idx = user.bookmarkedQuestions.map(String).indexOf(qid);
    if (idx === -1) user.bookmarkedQuestions.push(qid);
    else user.bookmarkedQuestions.splice(idx, 1);
    await user.save();
    res.json({ bookmarked: idx === -1 });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getSubmissions = async (req, res) => {
  try {
    const subs = await Submission.find({ user: req.user._id })
      .populate('question', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ submissions: subs });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
