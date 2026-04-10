const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authenticated' });
    const token = h.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

exports.tierCheck = (feature) => (req, res, next) => {
  const user = req.user;
  user.checkAndResetUsage();
  if (user.tier === 'pro') return next();
  const FREE_LIMITS = { interview: 5, practice: 10 };
  if (feature === 'interview' && user.monthlyInterviews >= FREE_LIMITS.interview) {
    return res.status(403).json({ message: `Free tier: ${FREE_LIMITS.interview} AI interviews/month. Upgrade to Pro.`, upgradeRequired: true });
  }
  if (feature === 'practice' && user.monthlyPractice >= FREE_LIMITS.practice) {
    return res.status(403).json({ message: `Free tier: ${FREE_LIMITS.practice} practice submissions/month. Upgrade to Pro.`, upgradeRequired: true });
  }
  next();
};
