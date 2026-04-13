const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tier: { type: String, enum: ['free', 'pro'], default: 'free' },

  // Stats
  questionsSolved: { type: Number, default: 0 },
  interviewsAttempted: { type: Number, default: 0 },
  averageInterviewScore: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },

  // Monthly limits (free tier)
  monthlyInterviews: { type: Number, default: 0 },
  monthlyPractice: { type: Number, default: 0 },
  usageMonth: { type: String, default: () => new Date().toISOString().slice(0, 7) },

  // Streak
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActive: { type: Date },

  // Password reset
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },

  // Bookmarks
  bookmarkedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.checkAndResetUsage = function () {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (this.usageMonth !== currentMonth) {
    this.monthlyInterviews = 0;
    this.monthlyPractice = 0;
    this.usageMonth = currentMonth;
  }
};

userSchema.methods.updateStreak = function () {
  const now = new Date();
  if (!this.lastActive) {
    this.streak = 1;
  } else {
    const diffMs = now - new Date(this.lastActive);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) { /* same day */ }
    else if (diffDays === 1) { this.streak = (this.streak || 0) + 1; }
    else { this.streak = 1; }
  }
  this.longestStreak = Math.max(this.streak, this.longestStreak || 0);
  this.lastActive = now;
};

module.exports = mongoose.model('User', userSchema);
