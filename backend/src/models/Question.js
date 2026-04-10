const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  explanation: String,
}, { _id: false });

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: {
    type: String,
    enum: ['Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'LinkedList', 'Stack', 'Queue', 'Sorting', 'Binary Search', 'Math', 'Other'],
    required: true,
  },
  tags: [String],
  constraints: String,
  examples: [testCaseSchema],
  testCases: { type: [testCaseSchema], select: false },
  starterCode: {
    javascript: { type: String, default: '/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n  // your code here\n}\n' },
    python: { type: String, default: 'def solution(input):\n    # your code here\n    pass\n' },
    java: { type: String, default: 'class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n' },
    cpp: { type: String, default: '#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n' },
    c: { type: String, default: '#include<stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}\n' },
  },
  hints: [String],
  attemptCount: { type: Number, default: 0 },
  solvedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

questionSchema.index({ difficulty: 1, topic: 1 });
questionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Question', questionSchema);
