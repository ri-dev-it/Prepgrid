const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { getClientUrl } = require('../config/urls');
const { sendOTP, sendWelcome } = require('../services/mailer');

const signAccess = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

const sendTokens = (res, user, status = 200) => {
  const token = signAccess(user._id);
  const refresh = signRefresh(user._id);
  res.status(status).json({
    token,
    refresh,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier,
      streak: user.streak,
      avatar: user.avatar,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 chars' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    sendWelcome(email, name).catch(() => {});
    sendTokens(res, user, 201);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    user.updateStreak();
    await user.save();
    sendTokens(res, user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ message: 'Refresh token required' });
    const { id } = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    res.json({ token: signAccess(id) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ message: 'No account with that email' });
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMe = (req, res) => res.json({ user: req.user });

exports.googleCallback = async (req, res) => {
  const clientUrl = getClientUrl();

  try {
    const user = req.user;
    user.updateStreak();
    await user.save();
    const token = signAccess(user._id);
    const refresh = signRefresh(user._id);
    res.redirect(`${clientUrl}/login?token=${token}&refresh=${refresh}`);
  } catch (e) {
    res.redirect(`${clientUrl}/login?error=Google+auth+failed`);
  }
};
