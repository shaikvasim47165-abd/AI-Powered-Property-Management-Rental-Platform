require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Shortlist = require('../models/Shortlist');
const { connectDB, disconnectDB } = require('../config/database');

const sampleProperties = [
  {
    title: 'Modern 2BHK Apartment with Balcony & Garden View',
    description: 'Spacious 2BHK apartment located in a prime gated community. Features ample natural lighting, modular kitchen, wooden flooring in master bedroom, and 24/7 security. Just 5 minutes from the metro station.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1180,
    rent: 24000,
    deposit: 60000,
    location: {
      city: 'Chennai',
      area: 'Tambaram',
      address: '7th Avenue, East Tambaram, Near Railway Hub',
      pincode: '600059',
      latitude: 12.9249,
      longitude: 80.1000,
    },
    amenities: ['Parking', 'Power Backup', 'Security', 'Lift', 'Balcony', 'CCTV'],
    furnished: true,
    furnishingStatus: 'Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Luxury 3BHK Penthouse in Whitefield Tech Corridor',
    description: 'High-end 3BHK penthouse with private terrace deck, Italian marble flooring, VRV central air-conditioning, and panoramic skyline views. Walking distance from major IT parks and top international schools.',
    propertyType: 'Penthouse',
    listingType: 'Rent',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2150,
    rent: 55000,
    deposit: 150000,
    location: {
      city: 'Bangalore',
      area: 'Whitefield',
      address: 'Prestige Boulevard, ITPL Main Road',
      pincode: '560066',
      latitude: 12.9698,
      longitude: 77.7499,
    },
    amenities: ['Parking', 'Power Backup', 'Lift', 'Gym', 'Swimming Pool', 'Security', 'WiFi', 'Balcony'],
    furnished: true,
    furnishingStatus: 'Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Cozy 1BHK Studio Apartment for Professionals',
    description: 'Minimalist designer studio apartment perfect for working professionals or young couples. Includes smart TV, high-speed fiber internet, fully fitted kitchenette, and covered two-wheeler & car parking.',
    propertyType: 'Studio',
    listingType: 'Rent',
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 620,
    rent: 18000,
    deposit: 40000,
    location: {
      city: 'Bangalore',
      area: 'Koramangala',
      address: '4th Block, 80 Feet Road, Near Sony World Signal',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    amenities: ['Parking', 'Power Backup', 'WiFi', 'Security', 'CCTV'],
    furnished: true,
    furnishingStatus: 'Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Sea-Facing 2BHK Apartment with Sunset Views',
    description: 'Charming sea-facing apartment located on Carter Road. Features tall glass French windows, breezy ocean air, wooden floor finish, and private gated entry with 24-hour round-the-clock guards.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1100,
    rent: 68000,
    deposit: 200000,
    location: {
      city: 'Mumbai',
      area: 'Bandra West',
      address: 'Sea View Heights, Carter Road',
      pincode: '400050',
      latitude: 19.0600,
      longitude: 72.8258,
    },
    amenities: ['Parking', 'Security', 'Lift', 'Balcony', 'Power Backup', 'Pet Friendly'],
    furnished: false,
    furnishingStatus: 'Semi-Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Spacious 3BHK Gated Community Villa in OMR',
    description: 'Independent duplex villa within a peaceful 20-acre gated enclave. Features a landscaped private lawn, modular kitchen with chimneys, solar hot water system, and clubhouse access.',
    propertyType: 'Villa',
    listingType: 'Rent',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2400,
    rent: 38000,
    deposit: 100000,
    location: {
      city: 'Chennai',
      area: 'OMR - Sholinganallur',
      address: 'Green Meadows Enclave, Near ELCOT SEZ',
      pincode: '600119',
      latitude: 12.9010,
      longitude: 80.2279,
    },
    amenities: ['Parking', 'Power Backup', 'Gym', 'Swimming Pool', 'Security', 'Pet Friendly', 'Balcony', 'CCTV'],
    furnished: false,
    furnishingStatus: 'Semi-Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Contemporary 2BHK Near Hitec City Cyber Towers',
    description: 'Ideal home for software professionals in Hyderabad. Beautiful granite countertops, AC installed in both bedrooms, covered parking bay, and high-speed elevator with power backup.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1250,
    rent: 28000,
    deposit: 60000,
    location: {
      city: 'Hyderabad',
      area: 'Hitec City',
      address: 'Madhapur Main Road, Near Mindspace IT Park',
      pincode: '500081',
      latitude: 17.4435,
      longitude: 78.3772,
    },
    amenities: ['Parking', 'Power Backup', 'Lift', 'Security', 'WiFi', 'CCTV'],
    furnished: true,
    furnishingStatus: 'Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Elegant 4BHK Independent House with Private Garden',
    description: 'Generously proportioned 4-bedroom bungalow with servant quarters, private garden, dual terrace, and parking for up to 3 cars. Situated in a quiet, tree-lined residential neighborhood.',
    propertyType: 'Independent House',
    listingType: 'Rent',
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3200,
    rent: 75000,
    deposit: 250000,
    location: {
      city: 'Chennai',
      area: 'Anna Nagar',
      address: '2nd Main Road, Anna Nagar West Extension',
      pincode: '600101',
      latitude: 13.0850,
      longitude: 80.2101,
    },
    amenities: ['Parking', 'Power Backup', 'Security', 'Pet Friendly', 'Balcony', 'CCTV'],
    furnished: false,
    furnishingStatus: 'Unfurnished',
    availableFrom: new Date(),
    status: 'available',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Premium 2BHK in Indiranagar Near 100ft Road',
    description: 'Step right into the vibrant dining and shopping hub of Indiranagar. This north-facing flat features aesthetic exposed brick accents, open-concept kitchen, and dedicated basement parking.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1300,
    rent: 36000,
    deposit: 100000,
    location: {
      city: 'Bangalore',
      area: 'Indiranagar',
      address: '12th Main, Near Metro Station, Indiranagar',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
    },
    amenities: ['Parking', 'Power Backup', 'Lift', 'Security', 'Balcony'],
    furnished: true,
    furnishingStatus: 'Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    title: 'Budget-Friendly 1BHK Apartment in Powai Lake Area',
    description: 'Compact and well-maintained 1BHK with piped gas connection, 24-hour water supply, and easy connectivity to Powai Lake and Hiranandani gardens.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 550,
    rent: 28000,
    deposit: 70000,
    location: {
      city: 'Mumbai',
      area: 'Powai',
      address: 'Lake Homes Complex, Near IIT Bombay',
      pincode: '400076',
      latitude: 19.1176,
      longitude: 72.9060,
    },
    amenities: ['Lift', 'Security', 'Power Backup', 'CCTV'],
    furnished: false,
    furnishingStatus: 'Semi-Furnished',
    availableFrom: new Date(),
    status: 'available',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80',
    ],
  },
];

const seedData = async () => {
  try {
    console.log('[Seed] Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Enquiry.deleteMany({}),
      Shortlist.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo accounts...');
    // Create Owner user
    const owner = await User.create({
      name: 'Rajesh Sharma (Property Owner)',
      email: 'owner@example.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 43210',
    });

    // Create Tenant user
    const tenant = await User.create({
      name: 'Priya Patel (Tenant)',
      email: 'tenant@example.com',
      password: 'password123',
      role: 'tenant',
      phone: '+91 98450 12345',
    });

    console.log('[Seed] Creating sample properties...');
    const createdProperties = await Promise.all(
      sampleProperties.map((prop) => {
        return Property.create({
          ...prop,
          ownerId: owner._id,
        });
      })
    );

    console.log(`[Seed] Created ${createdProperties.length} properties.`);

    // Create a demo enquiry
    console.log('[Seed] Creating sample enquiries...');
    await Enquiry.create({
      tenantId: tenant._id,
      ownerId: owner._id,
      propertyId: createdProperties[0]._id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      message: 'Hi Rajesh, I would like to schedule a viewing for this 2BHK this Saturday morning. Is that possible?',
      status: 'new',
    });

    await Enquiry.create({
      tenantId: tenant._id,
      ownerId: owner._id,
      propertyId: createdProperties[1]._id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      message: 'Hello, is the penthouse maintenance charge included in the monthly rent?',
      status: 'contacted',
      ownerNotes: 'Called tenant, explained maintenance is ₹3,500 extra.',
    });

    // Create a sample shortlist
    console.log('[Seed] Creating sample shortlist for tenant...');
    await Shortlist.create({
      userId: tenant._id,
      propertyId: createdProperties[0]._id,
    });
    await Shortlist.create({
      userId: tenant._id,
      propertyId: createdProperties[2]._id,
    });

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('  Property Owner : owner@example.com  / password123');
    console.log('  Tenant         : tenant@example.com / password123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

// If run directly via node scripts/seed.js
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
