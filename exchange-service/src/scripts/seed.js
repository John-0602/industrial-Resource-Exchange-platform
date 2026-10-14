require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Requirement = require('../models/Requirement');
const Exchange = require('../models/Exchange');

const seedIndustrialExchanges = async () => {
  try {
    console.log('[Seed] Connecting to Exchange Service database...');
    await connectDB();

    console.log('[Seed] Clearing existing Requirements and Exchanges...');
    await Requirement.deleteMany({});
    await Exchange.deleteMany({});

    console.log('[Seed] Seeding sample industrial material procurement requirements...');
    const req1 = await Requirement.create({
      companyId: 'company_sahyadri_wood_44',
      companyName: 'Sahyadri Eco-Board & Furniture Solutions',
      contactEmail: 'mahesh@sahyadriboards.com',
      title: 'Procurement of High-Cellulose Cotton Trimmings / Noil for Acoustic Panels',
      materialCategory: 'Textile and fabric waste',
      specifications: 'Unbleached or white cotton cuttings and comber noil. Must be free of metal wires and synthetic polyester blends.',
      requiredQuantity: 2000,
      unit: 'kg',
      acceptableCondition: 'Clean, Baled, Dry (<10% moisture)',
      deliveryLocation: {
        city: 'Hubballi',
        state: 'Karnataka',
        address: 'Industrial Estate, Tarihal'
      },
      maxBudget: 70,
      currency: 'INR',
      requiredByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      additionalHandling: 'Direct forklift unloading available. Moisture inspection on arrival.',
      status: 'Active'
    });

    const req2 = await Requirement.create({
      companyId: 'company_kalyani_forge_22',
      companyName: 'Kalyani Foundry & Forging Works',
      contactEmail: 'rajesh@kalyaniforge.com',
      title: 'Bulk Secondary Aluminium Scrap / Swarf for Ingot Remelt',
      materialCategory: 'Metal scraps',
      specifications: 'Clean aluminium machining turnings, alloy series 6000 or 5000 preferred. Low zinc and iron content.',
      requiredQuantity: 5,
      unit: 'tonnes',
      acceptableCondition: 'Degreased or centrifuged chips in jumbo bags',
      deliveryLocation: {
        city: 'Pune',
        state: 'Maharashtra',
        address: 'Sector 7, MIDC Bhosari'
      },
      maxBudget: 180000,
      currency: 'INR',
      requiredByDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      additionalHandling: 'Spectrometer sample verification prior to weighbridge release.',
      status: 'Active'
    });

    console.log('====================================================');
    console.log('✅ Industrial Exchange & Matching Service seeded!');
    console.log(`📋 Seeded 2 active industrial procurement requirements ready for matching:`);
    console.log(`   - "${req1.title}" (2000 kg Textile Waste)`);
    console.log(`   - "${req2.title}" (5 tonnes Metal Scrap)`);
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Exchange seeding error:', error);
    process.exit(1);
  }
};

seedIndustrialExchanges();
