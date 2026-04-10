const axios = require('axios');

const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
};

exports.executeCode = async (code, language, stdin = '') => {
  const lang = LANGUAGE_MAP[language];
  if (!lang) return { success: false, output: 'Language not supported', stderr: '' };

  try {
    const res = await axios.post(
      `${PISTON_URL}/execute`,
      {
        language: lang.language,
        version: lang.version,
        files: [{ content: code }],
        stdin,
        run_timeout: 5000,
        compile_timeout: 10000,
      },
      { timeout: 20000 }
    );

    const { run, compile } = res.data;
    if (compile && compile.stderr) {
      return { success: false, output: '', stderr: compile.stderr };
    }
    return {
      success: run.code === 0,
      output: run.stdout || '',
      stderr: run.stderr || '',
      exitCode: run.code,
    };
  } catch (err) {
    return { success: false, output: '', stderr: err.message };
  }
};

exports.runTestCases = async (code, language, testCases) => {
  const results = [];
  let passed = 0;

  for (const tc of testCases) {
    const result = await exports.executeCode(code, language, tc.input);
    const actualOutput = (result.output || '').trim();
    const expectedOutput = (tc.output || '').trim();
    const isCorrect = actualOutput === expectedOutput;
    if (isCorrect) passed++;
    results.push({
      input: tc.input,
      expected: expectedOutput,
      actual: actualOutput,
      status: isCorrect ? 'Passed' : result.stderr ? 'Runtime Error' : 'Wrong Answer',
      stderr: result.stderr,
    });
  }

  return { passed, total: testCases.length, results };
};

exports.getSupportedLanguages = async () => {
  try {
    const res = await axios.get(`${PISTON_URL}/runtimes`);
    return res.data;
  } catch {
    return Object.values(LANGUAGE_MAP);
  }
};
