const mongoose = require('mongoose');

const buildMongoUri = () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI.trim();
  }

  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST;
  const dbName = process.env.MONGO_DB_NAME || 'prepgrid';

  if (user && pass && host) {
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${dbName}?retryWrites=true&w=majority`;
  }

  return null;
};

const connectDB = async () => {
  const mongoUri = buildMongoUri();
  if (!mongoUri) {
    console.error('❌ MongoDB error: MONGO_URI is not defined. Create backend/.env from backend/.env.example and set your MongoDB connection string or split values.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
