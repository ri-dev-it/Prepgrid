const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
  return transporter;
}

const base = (content) => `
<div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
    <h1 style="margin:0;font-size:22px;color:#fff;letter-spacing:-0.5px;">⚡ PrepGrid</h1>
    <p style="margin:4px 0 0;color:#c4b5fd;font-size:13px;">AI Interview & Practice Platform</p>
  </div>
  <div style="padding:32px;">${content}</div>
  <div style="padding:16px 32px;border-top:1px solid #1e293b;font-size:12px;color:#475569;">PrepGrid · Built for developers, by developers</div>
</div>`;

exports.sendOTP = async (to, otp) => {
  try {
    await getTransporter().sendMail({
      from: `"PrepGrid" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject: 'PrepGrid — Your OTP Code',
      html: base(`
        <h2 style="margin:0 0 8px;color:#a5b4fc;">Password Reset</h2>
        <p style="color:#94a3b8;">Use this OTP to reset your password:</p>
        <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#818cf8;padding:20px 0;text-align:center;">${otp}</div>
        <p style="color:#64748b;font-size:13px;">⏱ Expires in 10 minutes. Never share this code.</p>
      `),
    });
  } catch (e) {
    console.error('Mail error:', e.message);
  }
};

exports.sendWelcome = async (to, name) => {
  try {
    await getTransporter().sendMail({
      from: `"PrepGrid" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject: `Welcome to PrepGrid, ${name}!`,
      html: base(`
        <h2 style="margin:0 0 12px;color:#a5b4fc;">Welcome, ${name}! 🎉</h2>
        <p style="color:#94a3b8;">Your PrepGrid account is ready. Start your interview prep journey today.</p>
        <ul style="color:#94a3b8;padding-left:20px;line-height:2;">
          <li>Practice 100+ DSA questions</li>
          <li>AI-powered mock interviews</li>
          <li>Timed quizzes with leaderboards</li>
        </ul>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard →</a>
      `),
    });
  } catch (e) {
    console.error('Mail error:', e.message);
  }
};
