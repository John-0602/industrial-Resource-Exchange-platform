const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('memory')) {
      console.log(`[Resource Service] Attempting MongoDB connection to configured URI...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Resource Service] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    }
  } catch (err) {
    console.warn(`[Resource Service] Primary MongoDB connection failed (${err.message}).`);
    console.warn(`[Resource Service] Falling back to automated in-memory MongoDB instance for local demonstration.`);
  }

  // Fallback to in-memory MongoDB server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Resource Service] Connected to In-Memory MongoDB at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Resource Service] In-Memory MongoDB failed:`, memErr);
    throw memErr;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('[Resource Service] Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
