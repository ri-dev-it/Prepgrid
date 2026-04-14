const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

const signAccess = (id) => require('jsonwebtoken').sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
const signRefresh = (id) => require('jsonwebtoken').sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

const getApiUrl = () => {
  if (process.env.API_URL) return process.env.API_URL;
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${getApiUrl()}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = profile.id;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          password: require('crypto').randomBytes(32).toString('hex'),
          avatar: profile.photos[0]?.value,
        });
      }
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
} else {
  console.warn('Google OAuth credentials not configured - Google login disabled');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;