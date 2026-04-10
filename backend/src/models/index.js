const mongoose = require('mongoose');

// ── Interview Session ──────────────────────────────────────────────────────
const msgSchema = new mongoose.Schema({
  role: { type: String, enum: ['ai', 'user'] },
  content: String,
  score: Number,
  feedback: String,
  improvement: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Frontend', 'Backend', 'Full Stack', 'DSA'], required: true },
  messages: [msgSchema],
  questionsAsked: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  summary: String,
  strengths: [String],
  improvements: [String],
  completedAt: Date,
}, { timestamps: true });

// ── Quiz Attempt ───────────────────────────────────────────────────────────
const quizOptionSchema = new mongoose.Schema({ text: String, isCorrect: Boolean }, { _id: false });
const quizQuestionSchema = new mongoose.Schema({
  question: String,
  options: [quizOptionSchema],
  explanation: String,
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedOption: Number,
  isCorrect: Boolean,
  score: Number,
  feedback: String,
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  questions: [quizQuestionSchema],
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalQuestions: Number,
  timeTaken: Number,
}, { timestamps: true });

// ── Submission ─────────────────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  code: { type: String, required: true },
  language: String,
  status: { type: String, enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compile Error', 'TLE', 'Pending'], default: 'Pending' },
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  results: [mongoose.Schema.Types.Mixed],
  runtime: Number,
}, { timestamps: true });

submissionSchema.index({ user: 1, question: 1 });

// ── Payment ────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  plan: { type: String, enum: ['pro_monthly', 'pro_yearly'] },
  transactionId: String,
  method: { type: String, default: 'sandbox' },
}, { timestamps: true });

module.exports = {
  InterviewSession: mongoose.model('InterviewSession', interviewSessionSchema),
  QuizAttempt: mongoose.model('QuizAttempt', quizAttemptSchema),
  Submission: mongoose.model('Submission', submissionSchema),
  Payment: mongoose.model('Payment', paymentSchema),
};
