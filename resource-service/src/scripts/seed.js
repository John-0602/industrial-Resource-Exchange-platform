require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Resource = require('../models/Resource');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to Resource Service database...');
    await connectDB();

    console.log('[Seed] Clearing existing Users and Resources...');
    await User.deleteMany({});
    await Resource.deleteMany({});

    console.log('[Seed] Creating demo student accounts...');
    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@apex.edu',
      password: 'Password@123',
      collegeName: 'Apex Engineering Institute',
      department: 'Computer Science and Engineering',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    const rahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@apex.edu',
      password: 'Password@123',
      collegeName: 'Apex Engineering Institute',
      department: 'Electronics and Communication',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const ananya = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya.iyer@apex.edu',
      password: 'Password@123',
      collegeName: 'Apex Engineering Institute',
      department: 'Mechanical Engineering',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Seeding sample college resources across categories & listing types...');
    const resources = [
      {
        title: 'Introduction to Algorithms (CLRS 3rd Edition)',
        description: 'Standard CLRS textbook in pristine condition. Covers sorting, dynamic programming, graph algorithms, and advanced data structures. Essential for CS semester 4 and GATE preparation.',
        category: 'Textbooks',
        listingType: 'Lend',
        condition: 'Like New',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        lendingDuration: '21 days',
        location: 'Central Library, 2nd Floor Study Area',
        owner: {
          id: priya._id,
          name: priya.name,
          email: priya.email,
          collegeName: priya.collegeName,
          department: priya.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Arduino Uno Rev3 Starter Kit with Sensor Modules',
        description: 'Complete development kit including Arduino Uno board, breadboard, ultrasonic sensor, IR sensor, 16x2 LCD display, servo motor, and assorted jumper wires. Perfect for IoT mini-project.',
        category: 'Lab Equipment',
        listingType: 'Lend',
        condition: 'Like New',
        imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
        lendingDuration: '14 days',
        location: 'ECE Department Hardware Lab, Room 304',
        owner: {
          id: rahul._id,
          name: rahul.name,
          email: rahul.email,
          collegeName: rahul.collegeName,
          department: rahul.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Casio FX-991EX ClassWiz Scientific Calculator',
        description: 'High-resolution scientific calculator featuring 552 functions, spreadsheet calculation, matrix and vector modes. Allowed in university semester exams.',
        category: 'Calculators & Tools',
        listingType: 'Lend',
        condition: 'Good',
        imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
        lendingDuration: '7 days',
        location: 'Mechanical Block Cafeteria',
        owner: {
          id: ananya._id,
          name: ananya.name,
          email: ananya.email,
          collegeName: ananya.collegeName,
          department: ananya.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Digital Signal Processing (Proakis & Manolakis 4th Ed)',
        description: 'Comprehensive DSP textbook covering DFT, FFT algorithms, digital filter design, and multirate processing. Clean pages with highlighted summary formulas.',
        category: 'Textbooks',
        listingType: 'Exchange',
        condition: 'Good',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
        exchangePreference: 'Looking to exchange for Microprocessor 8086 or VLSI Design textbook',
        location: 'Student Activity Center (SAC) Courtyard',
        owner: {
          id: rahul._id,
          name: rahul.name,
          email: rahul.email,
          collegeName: rahul.collegeName,
          department: rahul.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Data Structures & Algorithms Handwritten Semester Notes',
        description: 'Complete color-coded handwritten lecture notes for 3rd semester Data Structures. Includes diagrammatic proofs, recursion tree analysis, and past university exam solutions.',
        category: 'Notes & Study Materials',
        listingType: 'Donate',
        condition: 'New',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
        location: 'Computer Science Department, Block B, Floor 1',
        owner: {
          id: priya._id,
          name: priya.name,
          email: priya.email,
          collegeName: priya.collegeName,
          department: priya.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Mini Drafter & Engineering Drawing Board Kit',
        description: 'Standard ISI-marked mini-drafter with steel clamp and adjustable arms, along with a waterproof drawing sheet holder tube. Free to anyone taking Engineering Drawing this semester.',
        category: 'Stationery',
        listingType: 'Give Away',
        condition: 'Good',
        imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
        location: 'Workshop Building, Ground Floor Entrance',
        owner: {
          id: ananya._id,
          name: ananya.name,
          email: ananya.email,
          collegeName: ananya.collegeName,
          department: ananya.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Raspberry Pi 4 Model B (4GB) with Aluminium Heatsink Case',
        description: 'Tested and fully operational Raspberry Pi 4 with 32GB SanDisk MicroSD card preloaded with Raspberry Pi OS. Includes 5V 3A USB-C power supply.',
        category: 'Electronics & Hardware',
        listingType: 'Exchange',
        condition: 'Like New',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        exchangePreference: 'Will exchange for STM32 development board or FPGA Spartan kit',
        location: 'Robotics Club Lab, Innovation Center',
        owner: {
          id: rahul._id,
          name: rahul.name,
          email: rahul.email,
          collegeName: rahul.collegeName,
          department: rahul.department
        },
        availabilityStatus: 'available'
      },
      {
        title: 'Database System Concepts (Silberschatz & Korth 7th Ed)',
        description: 'Authoritative database engineering textbook covering SQL, relational algebra, normal forms, transaction management, and indexing methods.',
        category: 'Textbooks',
        listingType: 'Lend',
        condition: 'Good',
        imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
        lendingDuration: '14 days',
        location: 'Main Campus Library Lawn',
        owner: {
          id: priya._id,
          name: priya.name,
          email: priya.email,
          collegeName: priya.collegeName,
          department: priya.department
        },
        availabilityStatus: 'available'
      }
    ];

    await Resource.insertMany(resources);

    console.log('====================================================');
    console.log('✅ Resource Service database successfully seeded!');
    console.log(`👤 Seeded 3 student accounts:`);
    console.log(`   - priya.sharma@apex.edu  (Password: Password@123)`);
    console.log(`   - rahul.verma@apex.edu   (Password: Password@123)`);
    console.log(`   - ananya.iyer@apex.edu   (Password: Password@123)`);
    console.log(`📦 Seeded ${resources.length} active college resources.`);
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
