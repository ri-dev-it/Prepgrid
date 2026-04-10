require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Question = require('../models/Question');

const questions = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy', topic: 'Arrays',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }],
    testCases: [{ input: '2 7 11 15\n9', output: '0 1' }, { input: '3 2 4\n6', output: '1 2' }],
    starterCode: { javascript: 'function twoSum(nums, target) {\n  // your code here\n}', python: 'def two_sum(nums, target):\n    # your code here\n    pass', cpp: '#include<bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // your code here\n}', java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // your code here\n    }\n}', c: '#include<stdio.h>\nvoid twoSum(int* nums, int numsSize, int target) {\n    // your code here\n}' },
    hints: ['Try using a hash map', 'For each element, check if target - element exists in map'],
    tags: ['hash-map', 'array'],
  },
  {
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    difficulty: 'Easy', topic: 'Strings',
    examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
    testCases: [{ input: 'hello', output: 'olleh' }, { input: 'Hannah', output: 'hannaH' }],
    starterCode: { javascript: 'function reverseString(s) {\n  // modify s in-place\n}', python: 'def reverse_string(s):\n    # modify s in-place\n    pass', cpp: 'void reverseString(vector<char>& s) {\n    // your code\n}', java: 'class Solution {\n    public void reverseString(char[] s) {\n        // your code\n    }\n}', c: 'void reverseString(char* s, int sSize) {\n    // your code\n}' },
    hints: ['Use two pointers', 'Swap characters from both ends moving inward'],
    tags: ['two-pointers', 'string'],
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.',
    difficulty: 'Easy', topic: 'Stack',
    examples: [{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }],
    testCases: [{ input: '()', output: 'true' }, { input: '()[{}]', output: 'true' }, { input: '(]', output: 'false' }],
    starterCode: { javascript: 'function isValid(s) {\n  // your code\n}', python: 'def is_valid(s):\n    # your code\n    pass', cpp: 'bool isValid(string s) {\n    // your code\n}', java: 'class Solution {\n    public boolean isValid(String s) {\n        // your code\n    }\n}', c: 'bool isValid(char* s) {\n    // your code\n}' },
    hints: ['Use a stack', 'Push open brackets, pop and check on close brackets'],
    tags: ['stack'],
  },
  {
    title: 'Maximum Subarray',
    description: "Given an integer array `nums`, find the subarray which has the largest sum and return its sum.\n\nThis is the famous Kadane's algorithm problem.",
    difficulty: 'Medium', topic: 'DP',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' }],
    testCases: [{ input: '-2 1 -3 4 -1 2 1 -5 4', output: '6' }, { input: '1', output: '1' }, { input: '5 4 -1 7 8', output: '23' }],
    starterCode: { javascript: 'function maxSubArray(nums) {\n  // your code\n}', python: 'def max_sub_array(nums):\n    # your code\n    pass', cpp: 'int maxSubArray(vector<int>& nums) {\n    // your code\n}', java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // your code\n    }\n}', c: 'int maxSubArray(int* nums, int numsSize) {\n    // your code\n}' },
    hints: ["Kadane's algorithm: track current sum and max sum", 'Reset current sum to 0 when it becomes negative'],
    tags: ['dynamic-programming', 'kadane'],
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Easy', topic: 'DP',
    examples: [{ input: 'n = 2', output: '2', explanation: '1+1 or 2' }, { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
    testCases: [{ input: '2', output: '2' }, { input: '3', output: '3' }, { input: '10', output: '89' }],
    starterCode: { javascript: 'function climbStairs(n) {\n  // your code\n}', python: 'def climb_stairs(n):\n    # your code\n    pass', cpp: 'int climbStairs(int n) {\n    // your code\n}', java: 'class Solution {\n    public int climbStairs(int n) {\n        // your code\n    }\n}', c: 'int climbStairs(int n) {\n    // your code\n}' },
    hints: ['Notice this is Fibonacci sequence', 'dp[i] = dp[i-1] + dp[i-2]'],
    tags: ['fibonacci', 'dynamic-programming'],
  },
  {
    title: 'Binary Search',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
    difficulty: 'Easy', topic: 'Binary Search',
    examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }],
    testCases: [{ input: '-1 0 3 5 9 12\n9', output: '4' }, { input: '-1 0 3 5 9 12\n2', output: '-1' }],
    starterCode: { javascript: 'function search(nums, target) {\n  // your code\n}', python: 'def search(nums, target):\n    # your code\n    pass', cpp: 'int search(vector<int>& nums, int target) {\n    // your code\n}', java: 'class Solution {\n    public int search(int[] nums, int target) {\n        // your code\n    }\n}', c: 'int search(int* nums, int numsSize, int target) {\n    // your code\n}' },
    hints: ['Use left and right pointers', 'Calculate mid = left + (right - left) / 2'],
    tags: ['binary-search'],
  },
  {
    title: 'Merge Two Sorted Lists',
    description: 'You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.',
    difficulty: 'Easy', topic: 'LinkedList',
    examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }],
    testCases: [{ input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4' }, { input: '\n', output: '' }],
    starterCode: { javascript: 'function mergeTwoLists(list1, list2) {\n  // your code\n}', python: 'def merge_two_lists(list1, list2):\n    # your code\n    pass', cpp: 'ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // your code\n}', java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // your code\n    }\n}', c: 'struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {\n    // your code\n}' },
    hints: ['Use a dummy head node', 'Compare nodes one by one and attach smaller'],
    tags: ['linked-list', 'recursion'],
  },
  {
    title: 'Invert Binary Tree',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    difficulty: 'Easy', topic: 'Trees',
    examples: [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }],
    testCases: [{ input: '4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1' }],
    starterCode: { javascript: 'function invertTree(root) {\n  // your code\n}', python: 'def invert_tree(root):\n    # your code\n    pass', cpp: 'TreeNode* invertTree(TreeNode* root) {\n    // your code\n}', java: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // your code\n    }\n}', c: 'struct TreeNode* invertTree(struct TreeNode* root) {\n    // your code\n}' },
    hints: ['Use recursion or BFS', 'Swap left and right children at each node'],
    tags: ['tree', 'recursion', 'dfs'],
  },
  {
    title: 'Number of Islands',
    description: 'Given an m x n 2D binary grid `grid` which represents a map of `"1"` (land) and `"0"` (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    difficulty: 'Medium', topic: 'Graphs',
    examples: [{ input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: '2' }],
    testCases: [{ input: '1 1 0\n0 1 0\n0 0 1', output: '2' }, { input: '1 1 1\n1 1 1\n1 1 1', output: '1' }],
    starterCode: { javascript: 'function numIslands(grid) {\n  // your code\n}', python: 'def num_islands(grid):\n    # your code\n    pass', cpp: 'int numIslands(vector<vector<char>>& grid) {\n    // your code\n}', java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // your code\n    }\n}', c: 'int numIslands(char** grid, int gridSize, int* gridColSize) {\n    // your code\n}' },
    hints: ['Use DFS or BFS from each unvisited land cell', 'Mark visited cells as "0" to avoid revisiting'],
    tags: ['graph', 'dfs', 'bfs', 'matrix'],
  },
  {
    title: 'Longest Common Subsequence',
    description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.',
    difficulty: 'Medium', topic: 'DP',
    examples: [{ input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'LCS is "ace"' }],
    testCases: [{ input: 'abcde\nace', output: '3' }, { input: 'abc\nabc', output: '3' }, { input: 'abc\ndef', output: '0' }],
    starterCode: { javascript: 'function longestCommonSubsequence(text1, text2) {\n  // your code\n}', python: 'def longest_common_subsequence(text1, text2):\n    # your code\n    pass', cpp: 'int longestCommonSubsequence(string text1, string text2) {\n    // your code\n}', java: 'class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // your code\n    }\n}', c: 'int longestCommonSubsequence(char* text1, char* text2) {\n    // your code\n}' },
    hints: ['Use 2D DP table', 'dp[i][j] = LCS length of text1[0..i] and text2[0..j]'],
    tags: ['dynamic-programming', 'string'],
  },
  {
    title: 'Course Schedule',
    description: 'There are a total of `numCourses` courses you have to take, labeled from 0 to numCourses-1.\n\nYou are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn true if you can finish all courses. Otherwise, return false.',
    difficulty: 'Medium', topic: 'Graphs',
    examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }, { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }],
    testCases: [{ input: '2\n1 0', output: 'true' }, { input: '2\n1 0\n0 1', output: 'false' }],
    starterCode: { javascript: 'function canFinish(numCourses, prerequisites) {\n  // your code\n}', python: 'def can_finish(num_courses, prerequisites):\n    # your code\n    pass', cpp: 'bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    // your code\n}', java: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // your code\n    }\n}', c: 'bool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {\n    // your code\n}' },
    hints: ['Build adjacency list', 'Detect cycle using DFS with 3 states: unvisited, visiting, visited'],
    tags: ['graph', 'topological-sort', 'cycle-detection'],
  },
  {
    title: 'Find Median from Data Stream',
    description: 'The MedianFinder class:\n- `MedianFinder()` initializes the MedianFinder object.\n- `void addNum(int num)` adds the integer num from the data stream to the data structure.\n- `double findMedian()` returns the median of all elements so far.',
    difficulty: 'Hard', topic: 'Sorting',
    examples: [{ input: 'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()', output: '1.5, 2.0' }],
    testCases: [{ input: '1 2\n3', output: '1.5\n2.0' }],
    starterCode: { javascript: 'class MedianFinder {\n  constructor() { /* init */ }\n  addNum(num) { /* add */ }\n  findMedian() { /* return median */ }\n}', python: 'class MedianFinder:\n    def __init__(self):\n        pass\n    def add_num(self, num):\n        pass\n    def find_median(self):\n        pass', cpp: 'class MedianFinder {\npublic:\n    MedianFinder() {}\n    void addNum(int num) {}\n    double findMedian() { return 0.0; }\n};', java: 'class MedianFinder {\n    public MedianFinder() {}\n    public void addNum(int num) {}\n    public double findMedian() { return 0.0; }\n}', c: '// Implement using arrays or custom heap in C' },
    hints: ['Use two heaps: max-heap for lower half, min-heap for upper half', 'Balance heaps to differ by at most 1 element'],
    tags: ['heap', 'design', 'hard'],
  },
  {
    title: 'Trapping Rain Water',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'Hard', topic: 'Arrays',
    examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
    testCases: [{ input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6' }, { input: '4 2 0 3 2 5', output: '9' }],
    starterCode: { javascript: 'function trap(height) {\n  // your code\n}', python: 'def trap(height):\n    # your code\n    pass', cpp: 'int trap(vector<int>& height) {\n    // your code\n}', java: 'class Solution {\n    public int trap(int[] height) {\n        // your code\n    }\n}', c: 'int trap(int* height, int heightSize) {\n    // your code\n}' },
    hints: ['Two-pointer approach: left and right pointers', 'Track max height from left and right'],
    tags: ['two-pointers', 'dynamic-programming', 'stack'],
  },
  {
    title: 'Word Search',
    description: 'Given an m x n grid of characters `board` and a string `word`, return true if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells (horizontally or vertically adjacent). The same letter cell may not be used more than once.',
    difficulty: 'Medium', topic: 'Graphs',
    examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' }],
    testCases: [{ input: 'ABC\nSFD\nADE\nABCCED', output: 'true' }, { input: 'ABC\nSFD\nADE\nSEE', output: 'true' }],
    starterCode: { javascript: 'function exist(board, word) {\n  // your code\n}', python: 'def exist(board, word):\n    # your code\n    pass', cpp: 'bool exist(vector<vector<char>>& board, string word) {\n    // your code\n}', java: 'class Solution {\n    public boolean exist(char[][] board, String word) {\n        // your code\n    }\n}', c: 'bool exist(char** board, int boardSize, int* boardColSize, char* word) {\n    // your code\n}' },
    hints: ['Use DFS with backtracking', 'Mark cell as visited during DFS, unmark on backtrack'],
    tags: ['backtracking', 'dfs', 'matrix'],
  },
  {
    title: 'Rotate Array',
    description: 'Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.',
    difficulty: 'Medium', topic: 'Arrays',
    examples: [{ input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' }],
    testCases: [{ input: '1 2 3 4 5 6 7\n3', output: '5 6 7 1 2 3 4' }, { input: '-1 -100 3 99\n2', output: '3 99 -1 -100' }],
    starterCode: { javascript: 'function rotate(nums, k) {\n  // modify in-place\n}', python: 'def rotate(nums, k):\n    # modify in-place\n    pass', cpp: 'void rotate(vector<int>& nums, int k) {\n    // your code\n}', java: 'class Solution {\n    public void rotate(int[] nums, int k) {\n        // your code\n    }\n}', c: 'void rotate(int* nums, int numsSize, int k) {\n    // your code\n}' },
    hints: ['Reverse the entire array, then reverse first k and remaining', 'Handle k > nums.length with k = k % nums.length'],
    tags: ['array', 'two-pointers'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@prepgrid.dev',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      tier: 'pro',
    });
    console.log('✅ Admin user created');
  }

  // Seed questions
  await Question.deleteMany({});
  await Question.insertMany(questions.map(q => ({ ...q, isActive: true })));
  console.log(`✅ ${questions.length} questions seeded`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(e => { console.error(e); process.exit(1); });
