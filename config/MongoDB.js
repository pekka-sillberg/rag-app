const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();


const MONGO_URI = process.env.MONGO_URI;


async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToMongoDB, mongoose };
