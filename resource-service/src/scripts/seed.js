require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Company = require('../models/Company');
const Resource = require('../models/Resource');

const seedIndustrialData = async () => {
  try {
    console.log('[Seed] Connecting to Industrial Resource Service database...');
    await connectDB();

    console.log('[Seed] Clearing existing companies and industrial resources...');
    await Company.deleteMany({});
    await Resource.deleteMany({});

    console.log('[Seed] Creating industrial company accounts...');
    // Company 1: Textile Supplier & Receiver
    const apexTextiles = await Company.create({
      name: 'Apex Textiles & Garments Ltd.',
      registrationRef: 'GSTIN: 33AAACA1111A1Z1',
      industrySector: 'Textiles & Apparel',
      contactPerson: 'Karthik Sundaram (VP Operations)',
      email: 'karthik@apextextiles.com',
      password: 'Password@123',
      phone: '+91 98450 11223',
      address: 'Plot 45-B, SIPCOT Industrial Park, Tirupur Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      country: 'India',
      description: 'Integrated spinning and textile manufacturing facility generating clean combed cotton noil, lint, and fabric cuttings.',
      companyRole: 'both',
      verificationStatus: 'Verified',
      role: 'company'
    });

    // Company 2: Metal Fabrication & Foundry
    const kalyaniForge = await Company.create({
      name: 'Kalyani Foundry & Forging Works',
      registrationRef: 'GSTIN: 27AABCK2222B1Z2',
      industrySector: 'Metal Fabrication & Foundry',
      contactPerson: 'Rajesh Kalyani (Plant Manager)',
      email: 'rajesh@kalyaniforge.com',
      password: 'Password@123',
      phone: '+91 97230 44556',
      address: 'Sector 7, MIDC Industrial Area, Bhosari',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      description: 'Automotive and machinery forging plant producing high-grade structural steel and aluminium turnings and offcuts.',
      companyRole: 'both',
      verificationStatus: 'Verified',
      role: 'company'
    });

    // Company 3: Bio-Polymers & Industrial Packaging
    const greenLeafPolymers = await Company.create({
      name: 'GreenLeaf Bio-Chemicals & Polymers',
      registrationRef: 'GSTIN: 24AACCG3333C1Z3',
      industrySector: 'Chemicals & Polymers',
      contactPerson: 'Dr. Sneha Patel (Chief Sustainability Officer)',
      email: 'sneha@greenleafpolymers.com',
      password: 'Password@123',
      phone: '+91 99040 77889',
      address: 'GIDC Petrochemical Complex, Phase 3, Nandesari',
      city: 'Vadodara',
      state: 'Gujarat',
      country: 'India',
      description: 'Polymer compounding and circular materials enterprise reprocessing post-industrial HDPE, PP, and packaging containers.',
      companyRole: 'both',
      verificationStatus: 'Verified',
      role: 'company'
    });

    // Company 4: Wood & Particle Board Manufacturer
    const sahyadriEco = await Company.create({
      name: 'Sahyadri Eco-Board & Furniture Solutions',
      registrationRef: 'GSTIN: 29AADCS4444D1Z4',
      industrySector: 'Woodwork & Furniture',
      contactPerson: 'Mahesh Hegde (Procurement Head)',
      email: 'mahesh@sahyadriboards.com',
      password: 'Password@123',
      phone: '+91 94480 33441',
      address: 'Industrial Estate, Tarihal',
      city: 'Hubballi',
      state: 'Karnataka',
      country: 'India',
      description: 'Manufacturer of particle boards and acoustic insulation panels utilizing wood scraps, saw dust, and agricultural biomass.',
      companyRole: 'receiver',
      verificationStatus: 'Verified',
      role: 'company'
    });

    // Platform Administrator Account
    const adminAccount = await Company.create({
      name: 'IREP Platform Regulatory Authority',
      registrationRef: 'CENTRAL-REGULATORY-PORTAL-01',
      industrySector: 'Recycling & Waste Management',
      contactPerson: 'Platform Administrator',
      email: 'admin@irep.gov.in',
      password: 'AdminPassword@123',
      phone: '+91 11 2338 0000',
      address: 'Circular Economy Regulatory Complex, CGO Complex',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      description: 'National and institutional administrator supervising circular economy audits, company verification, and compliance.',
      companyRole: 'both',
      verificationStatus: 'Verified',
      role: 'admin'
    });

    console.log('[Seed] Seeding industrial by-products and surplus material listings...');
    const resources = [
      {
        title: 'Comber Noil & 100% Cotton Fabric Trimmings (White)',
        description: 'Clean post-industrial comber noil and 100% knitted cotton cutting scraps from garment sewing lines. Bleached white, zero synthetic blend, compressed into standard 150 kg bales. Ideal for yarn spinning, surgical cotton, high-grade paper, or acoustic felts.',
        materialCategory: 'Textile and fabric waste',
        resourceType: 'By-product',
        condition: 'Grade A - Clean, Baled, Dry (<8% moisture)',
        chemicalComposition: '100% Cellulose Cotton, Ash <0.5%, Oil/Wax <0.3%',
        totalQuantity: 8500,
        availableQuantity: 8500,
        reservedQuantity: 0,
        unit: 'kg',
        minOrderQuantity: 500,
        indicativePrice: 65,
        currency: 'INR',
        intendedUse: 'Open-end yarn spinning, non-woven insulation pads, automotive sound deadening, paper pulp',
        handlingStorageInfo: 'Store in dry covered facility away from spark sources. Non-hazardous industrial commodity.',
        complianceInfo: 'Complies with Central Pollution Control Board (CPCB) Non-Hazardous By-Product Regulations. Form 10 transfer manifest provided.',
        pickupLocation: {
          facilityName: 'Apex Spinning Unit 2 Logistics Gate',
          address: 'Plot 45-B, SIPCOT Industrial Park',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '641018'
        },
        supplier: {
          id: apexTextiles._id,
          name: apexTextiles.name,
          registrationRef: apexTextiles.registrationRef,
          email: apexTextiles.email,
          city: apexTextiles.city,
          state: apexTextiles.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      },
      {
        title: 'Aluminium 6061 Machining Chips & Swarf (Dry Centrifuged)',
        description: 'Centrifuged and de-oiled CNC machining turnings and swarf of Aircraft-grade Aluminium 6061 alloy. Free from iron contamination and cutting fluids (residual moisture/oil <1.2%). Packed in 1-tonne heavy duty PP jumbo bags with lifting loops.',
        materialCategory: 'Metal scraps',
        resourceType: 'Scrap',
        condition: 'Clean, Degreased, Segregated Single Alloy (6061)',
        chemicalComposition: 'Al balance, Mg 0.8-1.2%, Si 0.4-0.8%, Cu 0.15-0.4%, Fe <0.7%',
        totalQuantity: 12,
        availableQuantity: 12,
        reservedQuantity: 0,
        unit: 'tonnes',
        minOrderQuantity: 1,
        indicativePrice: 175000,
        currency: 'INR',
        intendedUse: 'Secondary aluminium smelting, ingot production, casting, alloy additives',
        handlingStorageInfo: 'Store under roof to prevent oxidation. Forklift ramp loading available on site.',
        complianceInfo: 'MSDS available. Pre-tested spectrometer metal analysis certificate included with each dispatch.',
        pickupLocation: {
          facilityName: 'Kalyani Heavy Machining Yard 3',
          address: 'Sector 7, MIDC Industrial Area, Bhosari',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          pincode: '411026'
        },
        supplier: {
          id: kalyaniForge._id,
          name: kalyaniForge.name,
          registrationRef: kalyaniForge.registrationRef,
          email: kalyaniForge.email,
          city: kalyaniForge.city,
          state: kalyaniForge.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      },
      {
        title: 'Post-Industrial HDPE Re-granulate & Flakes (Blow Moulding Grade)',
        description: 'Shredded and washed High-Density Polyethylene regrind derived strictly from defective packaging bottle blow-molding runs. Uniform natural/blue color blend, MFI 0.35 g/10min (190°C/2.16kg). Free from PVC, foil, or paper label residue.',
        materialCategory: 'Plastic waste and reusable polymers',
        resourceType: 'Recyclable Material',
        condition: 'Washed, Flaked (6-8mm mesh), Dry (<0.2% moisture)',
        chemicalComposition: '100% High Density Polyethylene (HDPE), Density: 0.952 g/cm³',
        totalQuantity: 18500,
        availableQuantity: 18500,
        reservedQuantity: 0,
        unit: 'kg',
        minOrderQuantity: 1000,
        indicativePrice: 72,
        currency: 'INR',
        intendedUse: 'Agricultural drainage pipes, conduit tubing, pallets, crates, heavy-duty industrial drums',
        handlingStorageInfo: 'Store protected from direct sunlight in sealed 25kg PP valve sacks.',
        complianceInfo: 'RoHS compliant. Free of heavy metals and halogenated additives.',
        pickupLocation: {
          facilityName: 'GreenLeaf Compounding Bay C',
          address: 'GIDC Petrochemical Complex, Phase 3',
          city: 'Vadodara',
          state: 'Gujarat',
          country: 'India',
          pincode: '391340'
        },
        supplier: {
          id: greenLeafPolymers._id,
          name: greenLeafPolymers.name,
          registrationRef: greenLeafPolymers.registrationRef,
          email: greenLeafPolymers.email,
          city: greenLeafPolymers.city,
          state: greenLeafPolymers.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      },
      {
        title: 'Untreated Pine & Teak Hardwood Sawdust & Planer Shavings',
        description: 'High-volume dry wood planer shavings and fine sawdust generated from kiln-dried seasoning and furniture milling operations. Virgin timber origin without chemical wood preservatives, varnish, or urea-formaldehyde resins.',
        materialCategory: 'Wood scraps and sawdust',
        resourceType: 'By-product',
        condition: 'Kiln-Dried (<12% moisture), Unadulterated Virgin Wood',
        chemicalComposition: 'Natural Ligno-cellulosic timber fiber (50% Carbon, 6% Hydrogen, 44% Oxygen)',
        totalQuantity: 25,
        availableQuantity: 25,
        reservedQuantity: 0,
        unit: 'tonnes',
        minOrderQuantity: 3,
        indicativePrice: 4200,
        currency: 'INR',
        intendedUse: 'Biomass briquettes, pellet fuels, particleboard core layer, boiler co-firing, compost substrate',
        handlingStorageInfo: 'Stored in covered silo with automated cyclone extraction. Pneumatic tanker or tipper truck loading.',
        complianceInfo: '100% organic by-product. Exempt from hazardous waste categorization.',
        pickupLocation: {
          facilityName: 'Sahyadri Timber Milling Division',
          address: 'Industrial Estate, Tarihal',
          city: 'Hubballi',
          state: 'Karnataka',
          country: 'India',
          pincode: '580026'
        },
        supplier: {
          id: sahyadriEco._id,
          name: sahyadriEco.name,
          registrationRef: sahyadriEco.registrationRef,
          email: sahyadriEco.email,
          city: sahyadriEco.city,
          state: sahyadriEco.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      },
      {
        title: 'Heavy-Duty 210-Litre UN-Rated Tight-Head Steel Drums',
        description: 'Once-used tight-head mild steel drums (1.0mm thickness) previously containing food-grade glycol. Mechanically triple-rinsed, dried, internally inspected, and pressure tested. Standard 2-inch and 3/4-inch Tri-Sure bungs included.',
        materialCategory: 'Reusable industrial packaging',
        resourceType: 'Reusable Material',
        condition: 'Cleaned, Leak-Tested, Grade 1 Reusable',
        chemicalComposition: 'Carbon Steel (CR4 grade) with internal epoxy-phenolic anti-corrosive coating',
        totalQuantity: 420,
        availableQuantity: 420,
        reservedQuantity: 0,
        unit: 'units',
        minOrderQuantity: 20,
        indicativePrice: 850,
        currency: 'INR',
        intendedUse: 'Chemical storage, lubricant packaging, non-flammable solvent containment, liquid storage',
        handlingStorageInfo: 'Stored vertically in sheltered container yard. Palletized 4 drums per wooden pallet.',
        complianceInfo: 'UN Certified for Packing Group II liquids. Cleaning certificate supplied.',
        pickupLocation: {
          facilityName: 'GreenLeaf Packaging Storage Yard',
          address: 'GIDC Petrochemical Complex, Phase 3',
          city: 'Vadodara',
          state: 'Gujarat',
          country: 'India',
          pincode: '391340'
        },
        supplier: {
          id: greenLeafPolymers._id,
          name: greenLeafPolymers.name,
          registrationRef: greenLeafPolymers.registrationRef,
          email: greenLeafPolymers.email,
          city: greenLeafPolymers.city,
          state: greenLeafPolymers.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      },
      {
        title: 'Corrugated Kraft Board Offcuts & Paperboard Skeleton Scraps',
        description: 'Clean pre-consumer corrugated cardboard offcuts and die-cut sheet trim from carton box manufacturing. Baled into high-density wire-tied rectangular bales (approx 450 kg each). Moisture controlled below 9%.',
        materialCategory: 'Paper and cardboard',
        resourceType: 'Scrap',
        condition: 'Baled, Virgin Kraft Pulp origin, Unprinted and Clean',
        chemicalComposition: 'Cellulose pulp fibers (>92%), Starch binder (<3%), Moisture (<8%)',
        totalQuantity: 30,
        availableQuantity: 30,
        reservedQuantity: 0,
        unit: 'tonnes',
        minOrderQuantity: 2,
        indicativePrice: 18500,
        currency: 'INR',
        intendedUse: 'Recycled kraft paper mills, molded pulp packaging trays, edge protectors',
        handlingStorageInfo: 'Keep protected from rain and humidity. Direct container truck docking available.',
        complianceInfo: 'FSC-controlled scrap declaration available upon request.',
        pickupLocation: {
          facilityName: 'Apex Packaging Division Terminal',
          address: 'Plot 45-B, SIPCOT Industrial Park',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          country: 'India',
          pincode: '641018'
        },
        supplier: {
          id: apexTextiles._id,
          name: apexTextiles.name,
          registrationRef: apexTextiles.registrationRef,
          email: apexTextiles.email,
          city: apexTextiles.city,
          state: apexTextiles.state,
          verificationStatus: 'Verified'
        },
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        availabilityStatus: 'available',
        moderationStatus: 'Approved'
      }
    ];

    await Resource.insertMany(resources);

    console.log('====================================================');
    console.log('✅ Industrial Resource Service database seeded successfully!');
    console.log('🏭 Seeded 5 Industrial Companies:');
    console.log('   1. karthik@apextextiles.com      (Password: Password@123) [Textiles, Coimbatore]');
    console.log('   2. rajesh@kalyaniforge.com       (Password: Password@123) [Metals, Pune]');
    console.log('   3. sneha@greenleafpolymers.com   (Password: Password@123) [Polymers, Vadodara]');
    console.log('   4. mahesh@sahyadriboards.com     (Password: Password@123) [Woodwork, Hubballi]');
    console.log('   5. admin@irep.gov.in             (Password: AdminPassword@123) [Platform Admin]');
    console.log(`📦 Seeded ${resources.length} verified industrial material listings with quantity tracking.`);
    console.log('====================================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedIndustrialData();
}

module.exports = { seedIndustrialData };
