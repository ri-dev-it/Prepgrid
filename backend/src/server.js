require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const { getMissingRequiredEnv, getSessionSecret, isGoogleAuthEnabled, isProduction } = require('./config/env');
const { getApiUrl, getClientUrl } = require('./config/urls');

require('./config/passport');

const app = express();
const missingRequiredEnv = getMissingRequiredEnv();
const googleAuthEnabled = isGoogleAuthEnabled();

if (missingRequiredEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingRequiredEnv.join(', ')}`);
  process.exit(1);
}

app.use(helmet());
app.use(cors({
  origin: getClientUrl(),
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (googleAuthEnabled) {
  const sessionSecret = getSessionSecret();
  if (!sessionSecret) {
    console.error('Google OAuth requires SESSION_SECRET or JWT_SECRET.');
    process.exit(1);
  }

  if (isProduction()) {
    app.set('trust proxy', 1);
  }

  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction(),
    cookie: {
      httpOnly: true,
      sameSite: isProduction() ? 'none' : 'lax',
      secure: isProduction(),
    },
  }));
}

app.use(passport.initialize());
if (googleAuthEnabled) {
  app.use(passport.session());
}

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', limiter);

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'AI rate limit: 10 req/min' });
app.use('/api/interview', aiLimiter);
app.use('/api/quiz/generate', aiLimiter);

app.get('/', (_, res) => res.json({
  name: 'PrepGrid API',
  status: 'ok',
  frontend: getClientUrl(),
  health: `${getApiUrl()}/api/health`,
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.use((_, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
