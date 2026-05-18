const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studymind');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In serverless runtimes (Vercel), process.exit(1) crashes the entire execution function container.
    // We log the warning and let the function process queries so the developer gets descriptive API errors.
  }
};

module.exports = connectDB;
