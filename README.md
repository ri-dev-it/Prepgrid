# ⚡ PrepGrid — AI Interview & Practice Platform

> **DevFusion Hackathon · Problem Statement 1 (#26ENPRE1)**  
> A complete placement preparation platform with AI-powered mock interviews, real code execution, timed quizzes, and leaderboards — **100% free, zero cost, no credit card required.**

---

## 📋 Table of Contents

1. [Tech Stack (All Free)](#-tech-stack-all-free)
2. [Features](#-features)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Local Development Setup](#-local-development-setup)
6. [Environment Variables](#-environment-variables)
7. [Database Seeding](#-database-seeding)
8. [Free Service Setup Guides](#-free-service-setup-guides)
   - [MongoDB Atlas](#1-mongodb-atlas-free-512mb)
   - [Groq API Key](#2-groq-api-key-free-no-credit-card)
   - [Mailtrap Email](#3-mailtrap-email-free-1000-emailsmonth)
   - [Google OAuth](#4-google-oauth-optional-free)
9. [Deployment — Completely Free](#-deployment--completely-free)
   - [Deploy Backend to Render](#step-2-deploy-backend-to-render-free)
   - [Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel-free)
10. [Docker Setup (Optional)](#-docker-setup-optional)
11. [API Reference](#-api-reference)
12. [Free Tier Limits](#-free-tier-limits)
13. [Troubleshooting](#-troubleshooting)

---

---

## 🆓 Tech Stack (All Free)

| Layer | Technology | Cost |
|-------|-----------|------|
| **Frontend** | React 18 + Vite + TailwindCSS | Free |
| **Backend** | Node.js + Express | Free |
| **Database** | MongoDB Atlas (512MB free cluster) | Free forever |
| **AI (Interviews & Quizzes)** | Groq API — LLaMA 3 8B | Free, no credit card |
| **Code Execution** | Piston API (emkc.org) | Free, no key needed |
| **Email (OTP)** | Mailtrap free tier | Free, 1000 emails/month |
| **Backend Hosting** | Render.com free web service | Free (spins down when idle) |
| **Frontend Hosting** | Vercel free tier | Free forever |
| **Auth** | JWT (self-hosted) | Free |
| **Payment** | Sandbox simulation (no gateway) | Free |

---

## ✨ Features

### Practice Module
- ✅ 15 pre-seeded DSA problems (Easy / Medium / Hard)
- ✅ Monaco code editor with syntax highlighting (same as VS Code)
- ✅ Real code execution via **Piston API** — JavaScript, Python, C++, Java, C
- ✅ Topic-wise filtering: Arrays, Strings, Trees, DP, Graphs, SQL, etc.
- ✅ Bookmark questions, track solved/unsolved per user
- ✅ AI hints via Groq (without giving away the solution)
- ✅ Custom stdin input for testing

### AI Interview Module
- ✅ Role-based mock interviews: Frontend, Backend, Full Stack, DSA
- ✅ 10 adaptive questions — difficulty adjusts based on your score
- ✅ Each answer scored 0–10 with detailed feedback + improvement tip
- ✅ Full session transcript stored and reviewable
- ✅ Session summary with strengths and improvement areas
- ✅ Free tier: 5 interviews/month | Pro: unlimited

### AI Quiz Module
- ✅ Generate timed MCQ tests on **any** topic (Groq generates them instantly)
- ✅ 5–20 questions, 1 minute per question timer
- ✅ Instant results with correct answers and explanations
- ✅ Per-topic leaderboard showing top scorers

### User System
- ✅ Register / Login / Forgot Password with OTP via email
- ✅ **Google OAuth login** (optional, can be enabled with GOOGLE_CLIENT_ID/SECRET)
- ✅ JWT access token + refresh token (auto-refresh)
- ✅ Dashboard: questions solved, interviews, avg score, weak areas
- ✅ Daily streak tracker with longest streak record
- ✅ Bookmark management

### Payments (Sandbox)
- ✅ Free tier: 5 AI interviews + 10 submissions/month
- ✅ Pro tier upgrade via sandbox (no real payment gateway needed)
- ✅ Billing history page

### Admin Panel
- ✅ Add / Edit / Delete questions from the bank
- ✅ View all registered users and their activity
- ✅ Platform analytics: top attempted questions, acceptance rates by topic
- ✅ Health check endpoint at `/api/health`

---

## 📁 Project Structure

```
prepgrid/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Business logic
│   │   │   ├── authController.js
│   │   │   ├── practiceController.js
│   │   │   ├── interviewController.js
│   │   │   ├── quizController.js
│   │   │   ├── userController.js
│   │   │   └── adminController.js
│   │   ├── middlewares/    # Auth, tier check
│   │   ├── models/         # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   └── index.js    # Session, Quiz, Submission, Payment
│   │   ├── routes/         # Express routers
│   │   ├── services/
│   │   │   ├── groq.js     # Groq AI (free LLaMA 3)
│   │   │   ├── piston.js   # Code execution (free, no key)
│   │   │   └── mailer.js   # Nodemailer
│   │   ├── utils/
│   │   │   └── seed.js     # DB seeder (15 questions + admin)
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx        # Auth pages
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Practice.jsx     # Problem list
│   │   │   ├── ProblemDetail.jsx # Monaco editor + Piston
│   │   │   ├── Interview.jsx    # Lobby + session + history
│   │   │   ├── Quiz.jsx         # Lobby + session
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Billing.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/
│   │   │   └── Layout/Layout.jsx  # Sidebar + routing shell
│   │   ├── services/api.js        # Axios + auto token refresh
│   │   ├── store/authStore.js     # Zustand auth state
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── render.yaml
├── package.json          # Root: concurrently scripts
└── README.md
```

---

## 📦 Prerequisites

Make sure these are installed on your machine:

```bash
node --version    # v18 or higher required
npm --version     # v9 or higher
git --version     # any recent version
```

To install Node.js: https://nodejs.org (choose LTS)

---

## 🚀 Local Development Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/Akarshak51/Prepgrid.git
cd prepgrid
```

### Step 2 — Install all dependencies

```bash
# Install root, frontend, and backend dependencies in one command
npm run install:all
```

Or manually:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Step 3 — Set up environment variables

```bash
# Copy the example env file for backend
cp backend/.env.example backend/.env

# Copy for frontend
cp frontend/.env.example frontend/.env
```

Now edit `backend/.env` with your values (see [Environment Variables](#-environment-variables) section).

### Step 4 — Start development servers

```bash
# Start both frontend and backend simultaneously
npm run dev
```

This runs:
- **Backend** on http://localhost:5000  /  https://prepgrid-1-9bl2.onrender.com
- **Frontend** on http://localhost:5173 /  https://prepgrid-pold.vercel.app


Or start them separately:

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

### Step 5 — Seed the database

```bash
cd backend
npm run seed
```

This creates:
- **Admin account**: `admin@prepgrid.dev` / `Admin@123456`
- **15 DSA problems** across Easy, Medium, and Hard difficulties

---

## 🔧 Environment Variables

Create `backend/.env` with these values:

```env
# ── Server ────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database (MongoDB Atlas — see setup guide below) ──────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/prepgrid?retryWrites=true&w=majority

# ── JWT (generate secure random strings) ─────────────────────────
# Run this to generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_string_here
JWT_REFRESH_SECRET=another_64_char_random_string
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ── Session Secret (for OAuth, optional) ────────────────────────
# If not provided, JWT_SECRET will be used
SESSION_SECRET=your_session_secret_here

# ── Google OAuth (Optional — for Google login) ──────────────────
# Leave empty to disable Google login
# Get keys from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# ── Groq AI (free — see setup guide below) ────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama3-8b-8192

# ── Email — Mailtrap (free dev) ───────────────────────────────────
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username
MAIL_PASS=your_mailtrap_password
MAIL_FROM=noreply@prepgrid.dev

# ── Frontend URL (for CORS) ───────────────────────────────────────
CLIENT_URL=https://prepgrid-pold.vercel.app


# ── Admin seed credentials ────────────────────────────────────────
ADMIN_EMAIL=admin@prepgrid.dev
ADMIN_PASSWORD=Admin@123456

# ── Piston API (no key needed!) ───────────────────────────────────
PISTON_URL=https://emkc.org/api/v2/piston
```

Create `frontend/.env`:

```env
VITE_API_URL=https://prepgrid-1-9bl2.onrender.com
```

---

## 🌱 Database Seeding

The seed script creates the admin user and 15 sample questions:

```bash
cd backend
npm run seed
```

**Admin credentials after seeding:**
- Email: `admin@prepgrid.dev`
- Password: `Admin@123456`

**To re-seed (clears existing questions):**

```bash
cd backend
npm run seed
```

> ⚠️ The seed script deletes all questions before re-inserting. User data is preserved.

---

## 🔑 Free Service Setup Guides

### 1. MongoDB Atlas (Free, 512MB)

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a Database"** → choose **M0 Free** tier
3. Select a region (Singapore or Mumbai for India)
4. Create a database user:
   - Username: `prepgriduser`
   - Password: generate a secure password
5. Add IP Access: click **"Add My Current IP"**, also add `0.0.0.0/0` for deployment
6. Click **"Connect"** → **"Connect your application"**
7. Copy the connection string:
   ```
   mongodb+srv://prepgriduser:<password>@cluster0.xxxxx.mongodb.net/prepgrid?retryWrites=true&w=majority
   ```
8. Paste it as `MONGO_URI` in your `.env`

---

### 2. Groq API Key (Free, No Credit Card)

Groq gives you **free access** to LLaMA 3, Mixtral, and other models with generous rate limits.

1. Go to https://console.groq.com
2. Sign up with Google or email (no credit card needed)
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)
5. Paste as `GROQ_API_KEY=gsk_xxxxx` in `.env`

**Free tier limits:** ~14,400 requests/day on `llama3-8b-8192`  
That's ~200 interview sessions or ~1000 quiz generations per day.

**Available free models:**
- `llama3-8b-8192` — fast, great for interviews (recommended)
- `llama3-70b-8192` — more powerful, slower
- `mixtral-8x7b-32768` — large context window

---

### 3. Mailtrap Email (Free, 1000 Emails/Month)

For OTP and welcome emails during development:

1. Go to https://mailtrap.io and create a free account
2. Go to **Email Testing** → **Inboxes** → click your inbox
3. Select **SMTP Settings** → choose **Nodemailer**
4. Copy the credentials:
   ```
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=abc123def456
   MAIL_PASS=xyz789uvw012
   ```
5. Paste into your `.env`

> **For production**, switch to Gmail App Password (free):
> 1. Enable 2FA on your Google account
> 2. Go to Google Account → Security → App Passwords
> 3. Generate a password for "Mail"
> 4. Use:
>    ```env
>    MAIL_HOST=smtp.gmail.com
>    MAIL_PORT=587
>    MAIL_USER=youremail@gmail.com
>    MAIL_PASS=your_16_char_app_password
>    MAIL_FROM=youremail@gmail.com
>    ```

---

### 4. Google OAuth (Optional, Free)

Enable social login via Google. This is **optional** — users can always use email/password.

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://prepgrid-1-9bl2.onrender.com/api/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**
8. Paste into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   SESSION_SECRET=your_session_secret_or_jwt_secret
   ```

If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not set, Google login will be disabled (but the app will still work fine).

---

## 🌐 Deployment — Completely Free

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — PrepGrid"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prepgrid.git
git push -u origin main
```

---

### Step 2: Deploy Backend to Render (Free)

1. Go to https://render.com and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name:** `prepgrid-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Add Environment Variables (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
   | `JWT_REFRESH_SECRET` | another random 64-char string |
   | `JWT_EXPIRES_IN` | `1h` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `SESSION_SECRET` | optional, defaults to JWT_SECRET |
   | `GROQ_API_KEY` | your Groq API key |
   | `GROQ_MODEL` | `llama3-8b-8192` |
   | `MAIL_HOST` | your Mailtrap/Gmail host |
   | `MAIL_PORT` | `2525` or `587` |
   | `MAIL_USER` | your mail user |
   | `MAIL_PASS` | your mail password |
   | `MAIL_FROM` | `noreply@prepgrid.dev` |
   | `CLIENT_URL` | `https://prepgrid-pold.vercel.app` (fill after Vercel deploy) |
   | `ADMIN_EMAIL` | `admin@prepgrid.dev` |
   | `ADMIN_PASSWORD` | `Admin@123456` |
   | `PISTON_URL` | `https://emkc.org/api/v2/piston` |
   | `GOOGLE_CLIENT_ID` | **(Optional)** your Google OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET` | **(Optional)** your Google OAuth Client Secret |
   | `GOOGLE_REDIRECT_URI` | `https://prepgrid-backend.onrender.com/api/auth/google/callback` |

6. Click **"Create Web Service"**
7. Wait for deploy (2–3 minutes)
8. Your backend URL will be: `https://prepgrid-1-9bl2.onrender.com`

> ⚠️ **Render free tier** spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds to wake up. This is normal for free tier.

**Seed the production database:**

```bash
# Set your prod MONGO_URI temporarily and run seed
MONGO_URI="your_atlas_uri" node backend/src/utils/seed.js
```

---

### Step 3: Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com and sign up with GitHub (free)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://prepgrid-1-9bl2.onrender.com/api` |

6. Click **"Deploy"**
7. Your frontend URL will be: `https://prepgrid-pold.vercel.app`

8. **Update CORS on Render:** Go back to Render → your backend service → Environment → update `CLIENT_URL` to `https://prepgrid-pold.vercel.app`

---

### ✅ Deployment Checklist

```
□ MongoDB Atlas cluster created and connection string copied
□ Groq API key obtained (console.groq.com)
□ Mailtrap/Gmail credentials set
□ Google OAuth credentials obtained (optional - https://console.cloud.google.com)
□ Backend deployed to Render with all env vars
□ Backend URL noted (e.g. https://prepgrid-backend.onrender.com)
□ Health check endpoint verified at: https://prepgrid-backend.onrender.com/api/health
□ Frontend deployed to Vercel with VITE_API_URL set
□ Render CLIENT_URL updated to Vercel URL
□ If using Google OAuth, update GOOGLE_REDIRECT_URI on Render
□ Database seeded (admin + 15 questions)
□ Test register/login on live URL
□ Test Google OAuth login (if enabled)
□ Test code execution on live URL
□ Test AI interview on live URL
```

---

## 🐳 Docker Setup (Optional)

Run everything locally with Docker:

```bash
# Copy env file
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Build and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:5173 (or http://localhost:80 in prod mode)
# Backend:  http://localhost:5000
# MongoDB:  localhost:27017

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 📡 API Reference

### Auth Routes
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
POST   /api/auth/refresh           Refresh access token
POST   /api/auth/forgot-password   Send OTP to email
POST   /api/auth/reset-password    Reset with OTP
GET    /api/auth/me                Get current user (requires auth)
GET    /api/auth/google            Start Google OAuth flow (only if enabled)
GET    /api/auth/google/callback   Google OAuth callback (only if enabled)
```

### Practice Routes (all require auth)
```
GET    /api/practice/questions             List questions (filter: difficulty, topic, search)
GET    /api/practice/questions/:id         Get single question
POST   /api/practice/run                   Run code (Piston API)
POST   /api/practice/submit               Submit code (run all test cases)
POST   /api/practice/hint                  Get AI hint for current code
POST   /api/practice/bookmark/:questionId  Toggle bookmark
GET    /api/practice/submissions           My submission history
```

### Interview Routes (all require auth)
```
POST   /api/interview/start          Start new session (requires interview tier)
POST   /api/interview/answer         Submit answer, get next question
GET    /api/interview/sessions       List my sessions
GET    /api/interview/sessions/:id   Get session with transcript
```

### Quiz Routes (all require auth)
```
POST   /api/quiz/generate            Generate MCQ quiz (Groq AI)
POST   /api/quiz/submit              Submit answers, get results
GET    /api/quiz/leaderboard/:topic  Top scores for topic
GET    /api/quiz/my-attempts         My quiz history
```

### User Routes (all require auth)
```
GET    /api/user/dashboard           Dashboard data
PUT    /api/user/profile             Update name/bio
POST   /api/user/payment/order       Create sandbox order
POST   /api/user/payment/confirm     Confirm sandbox payment (upgrades to Pro)
GET    /api/user/payment/history     Billing history
```

### Admin Routes (require auth + admin role)
```
GET    /api/admin/stats              Platform analytics
GET    /api/admin/users              All users
GET    /api/admin/questions          All questions (including test cases)
POST   /api/admin/questions          Create question
PUT    /api/admin/questions/:id      Update question
DELETE /api/admin/questions/:id      Soft delete question
```

---

## 📊 Free Tier Limits

| Feature | Free | Pro (₹199/mo sandbox) |
|---------|------|----------------------|
| AI Interviews | 5/month | Unlimited |
| Code Submissions | 10/month | Unlimited |
| AI Quizzes | Unlimited | Unlimited |
| Practice Problems | Unlimited | Unlimited |
| Leaderboards | ✓ | ✓ |
| Bookmarks | ✓ | ✓ |
| Session History | ✓ | ✓ |

---

## 🔧 Troubleshooting

### "Groq API error" / AI not responding
- Check your `GROQ_API_KEY` is set correctly in `.env`
- Verify at https://console.groq.com your key is active
- Check rate limits (free: ~30 req/min)
- Try switching model: `GROQ_MODEL=llama3-70b-8192`

### "Piston API" / Code not running
- Piston is a public free API — occasionally slow or down
- Check status: https://emkc.org/api/v2/piston/runtimes
- No key needed — if it fails, it's a temporary outage

### MongoDB connection error
- Check your Atlas connection string format
- Ensure your IP is whitelisted in Atlas (add `0.0.0.0/0` for all IPs)
- Check username/password in the connection string are URL-encoded if they contain special chars

### Render backend waking up slowly
- Render free tier spins down after 15 min idle
- First request takes 30–60 seconds to wake up
- This is expected — upgrade to paid ($7/mo) to avoid this

### OTP email not received
- Check Mailtrap inbox at https://mailtrap.io/inboxes
- OTP is valid for 10 minutes
- If using Gmail, ensure App Password (not account password) is used

### CORS errors in browser
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL exactly (no trailing slash)
- For local dev: `CLIENT_URL=http://localhost:5173`
- For production: `CLIENT_URL=https://prepgrid-pold.vercel.app`

### Google OAuth not working / "Google login is not configured"
- Ensure both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Check the redirect URI matches exactly in Google Console settings
- For local dev: `http://localhost:5000/api/auth/google/callback`
- For production: `https://prepgrid-1-9bl2.onrender.com/api/auth/google/callback`
- If not using Google OAuth, simply leave these variables empty — email/password auth will still work

### "Free tier limit reached"
- Monthly limits reset on the 1st of each month
- Upgrade via the Billing page (sandbox, no real payment)

---

## 🛠 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both servers (dev mode with hot reload)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Seed database
cd backend && npm run seed

# Build frontend for production
npm run build

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📝 Adding More Questions

Log in as admin → go to `/admin` → click "Add Question" tab.

Or add them directly in the seed file at `backend/src/utils/seed.js` and re-run `npm run seed`.

Each question supports:
- Title, description, difficulty, topic
- Examples (shown to user)
- Test cases (hidden, used for judge)
- Starter code in 5 languages
- Hints (revealed on demand)

---

## 🏗 Architecture Notes

- **No Judge0** — code execution uses the free **Piston API** (emkc.org) which supports 75+ languages with no key required
- **No OpenAI** — AI powered by **Groq** (free LLaMA 3) via standard OpenAI-compatible REST API
- **No Razorpay/Stripe** — payments are fully sandboxed with no external gateway
- **JWT stored in localStorage** with automatic refresh token rotation
- **Soft deletes** on questions — `isActive: false` instead of actual deletion
- Monthly usage counters reset automatically when a new month starts

---

## 📄 License

MIT License — free to use, modify, and deploy.

---

**Built for DevFusion Hackathon 2026 · ⚡ PrepGrid**
