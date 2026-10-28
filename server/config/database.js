const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const connUri = process.env.MONGODB_URI;

  try {
    if (connUri) {
      await mongoose.connect(connUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected to ${connUri}`);
    } else {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected at ${uri}`);
    }
  } catch (error) {
    console.warn(`MongoDB primary connection failed (${error.message}). Starting in-memory database...`);
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected at ${uri}`);
  }
};

module.exports = connectDB;
