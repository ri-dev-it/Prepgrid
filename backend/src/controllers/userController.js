const User = require('../models/User');
const { Submission, InterviewSession, QuizAttempt, Payment } = require('../models/index');

exports.getDashboard = async (req, res) => {
  try {
    const uid = req.user._id;
    const [user, recentSubs, recentSessions, recentQuizzes, weakAreas] = await Promise.all([
      User.findById(uid).populate('bookmarkedQuestions', 'title difficulty topic'),
      Submission.find({ user: uid }).populate('question', 'title difficulty topic').sort({ createdAt: -1 }).limit(8),
      InterviewSession.find({ user: uid }).select('-messages').sort({ createdAt: -1 }).limit(5),
      QuizAttempt.find({ user: uid }).select('-questions -answers').sort({ createdAt: -1 }).limit(5),
      Submission.aggregate([
        { $match: { user: uid, status: { $ne: 'Accepted' } } },
        { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $group: { _id: '$q.topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]),
    ]);
    res.json({
      user,
      recentSubmissions: recentSubs,
      recentSessions,
      recentQuizzes,
      weakAreas: weakAreas.map((w) => w._id),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, bio }, { new: true });
    res.json({ user });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Sandbox payment (free simulation) ──────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const prices = { pro_monthly: 199, pro_yearly: 999 };
    if (!prices[plan]) return res.status(400).json({ message: 'Invalid plan' });
    // Simulate order creation (no real payment gateway)
    const payment = await Payment.create({
      user: req.user._id,
      amount: prices[plan],
      plan,
      status: 'pending',
      transactionId: `SANDBOX_${Date.now()}`,
    });
    res.json({ orderId: payment._id, amount: prices[plan], currency: 'INR', sandbox: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const payment = await Payment.findById(orderId);
    if (!payment || payment.user.toString() !== req.user._id.toString())
      return res.status(404).json({ message: 'Order not found' });

    payment.status = 'success';
    await payment.save();

    // Upgrade user to pro
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (payment.plan === 'pro_yearly' ? 12 : 1));
    await User.findByIdAndUpdate(req.user._id, { tier: 'pro' });

    res.json({ message: 'Payment successful! You are now a Pro member.', payment });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getBillingHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
