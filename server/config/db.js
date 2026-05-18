const mongoose = require('mongoose');

const connectDB = async () => {
  // If running on Vercel and the cloud connection URI is missing, fail-fast and log immediately
  if (process.env.VERCEL && !process.env.MONGO_URI) {
    console.error("💥 CRITICAL ERROR: MONGO_URI environment variable is missing on your Vercel dashboard settings!");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studymind', {
      serverSelectionTimeoutMS: 3000 // Timeout and fail-fast after 3 seconds instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
