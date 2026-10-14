const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resource_exchange_exchanges';

  try {
    if (uri && !uri.includes('memory')) {
      console.log(`[Exchange Service] Connecting to MongoDB...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Exchange Service] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    }
  } catch (err) {
    console.warn(`[Exchange Service] Primary MongoDB connection failed (${err.message}).`);
    console.warn(`[Exchange Service] Falling back to in-memory MongoDB instance.`);
  }

  // Fallback to in-memory MongoDB server
  try {
    if (!mongodInstance) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
    }
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Exchange Service] Connected to In-Memory MongoDB at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Exchange Service] In-Memory MongoDB failed:`, memErr);
    throw memErr;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error('[Exchange Service] Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
