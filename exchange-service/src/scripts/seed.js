require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Exchange = require('../models/Exchange');

const seedExchanges = async () => {
  try {
    console.log('[Seed] Connecting to Exchange Service database...');
    await connectDB();

    console.log('[Seed] Clearing existing Exchange requests...');
    await Exchange.deleteMany({});

    console.log('[Seed] Note: Exchange requests are created in real-time by students requesting listed resources.');
    console.log('✅ Exchange Service database initialized and ready for live requests.');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Exchange seeding error:', error);
    process.exit(1);
  }
};

seedExchanges();
