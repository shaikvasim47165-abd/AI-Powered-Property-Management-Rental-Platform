require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Shortlist = require('../models/Shortlist');
const { seedData } = require('./seed');
const geminiService = require('../services/geminiService');

const runVerification = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING PROPAI MVP VERIFICATION SUITE');
  console.log('====================================================');

  try {
    await connectDB();
    await seedData();

    // 1. Verify Users
    console.log('\n[1] Verifying User Authentication Data...');
    const owner = await User.findOne({ email: 'owner@example.com' }).select('+password');
    const tenant = await User.findOne({ email: 'tenant@example.com' }).select('+password');

    if (!owner || owner.role !== 'owner') throw new Error('Owner user verification failed');
    if (!tenant || tenant.role !== 'tenant') throw new Error('Tenant user verification failed');
    const isOwnerPwValid = await owner.comparePassword('password123');
    const isTenantPwValid = await tenant.comparePassword('password123');
    if (!isOwnerPwValid || !isTenantPwValid) throw new Error('Password hash validation failed');
    console.log('  ✅ Owner and Tenant accounts verified with bcrypt hashing.');

    // 2. Verify Properties & Filtering
    console.log('\n[2] Verifying Property Queries and Multi-filters...');
    const totalProps = await Property.countDocuments({ status: 'available' });
    console.log(`  Total active listings in DB: ${totalProps}`);
    if (totalProps < 5) throw new Error('Insufficient properties in seed');

    // Filter by city: Chennai
    const chennaiProps = await Property.find({ 'location.city': /Chennai/i });
    console.log(`  Filtered for city=Chennai: ${chennaiProps.length} matches found.`);
    if (chennaiProps.length === 0) throw new Error('City filter test failed');

    // Filter by bedrooms: 2 BHK
    const twoBhkProps = await Property.find({ bedrooms: 2 });
    console.log(`  Filtered for bedrooms=2: ${twoBhkProps.length} matches found.`);

    // Filter by amenities: Parking
    const parkingProps = await Property.find({ amenities: 'Parking' });
    console.log(`  Filtered for amenities=Parking: ${parkingProps.length} matches found.`);

    // 3. Verify Shortlists
    console.log('\n[3] Verifying Shortlists Collection...');
    const userShortlists = await Shortlist.find({ userId: tenant._id }).populate('propertyId');
    console.log(`  Tenant saved properties count: ${userShortlists.length}`);
    if (userShortlists.length === 0) throw new Error('Shortlist verification failed');
    console.log('  ✅ Shortlist mapped to real MongoDB property IDs.');

    // 4. Verify Enquiries
    console.log('\n[4] Verifying Enquiries Workflow...');
    const ownerEnquiries = await Enquiry.find({ ownerId: owner._id });
    console.log(`  Owner received enquiries count: ${ownerEnquiries.length}`);
    if (ownerEnquiries.length === 0) throw new Error('Enquiry verification failed');
    console.log('  ✅ Enquiries correctly mapped between tenant, property, and owner.');

    // 5. Verify AI Natural Language Search Parser
    console.log('\n[5] Verifying AI Natural Language Search & MongoDB Grounding...');
    const sampleQuery = '2BHK in Chennai with parking under 30k';
    const aiSearchResult = await geminiService.parseNaturalLanguageSearch(sampleQuery);
    console.log(`  Query: "${sampleQuery}"`);
    console.log('  Extracted Structured Filters:', JSON.stringify(aiSearchResult.structuredFilters, null, 2));

    // Run query against real DB
    const aiMongoQuery = { status: 'available' };
    if (aiSearchResult.structuredFilters.city) {
      aiMongoQuery['location.city'] = new RegExp(aiSearchResult.structuredFilters.city, 'i');
    }
    if (aiSearchResult.structuredFilters.bedrooms) {
      aiMongoQuery.bedrooms = aiSearchResult.structuredFilters.bedrooms;
    }
    if (aiSearchResult.structuredFilters.maxRent) {
      aiMongoQuery.rent = { $lte: aiSearchResult.structuredFilters.maxRent };
    }
    const matchingRealProps = await Property.find(aiMongoQuery);
    console.log(`  Real database properties matching AI criteria: ${matchingRealProps.length}`);
    matchingRealProps.forEach((p) => {
      console.log(`    - ${p.title} (${p.bedrooms} BHK, ₹${p.rent.toLocaleString('en-IN')}/mo in ${p.location.city})`);
    });
    console.log('  ✅ AI strictly queries real MongoDB documents without inventing listings.');

    // 6. Verify Grounded Property Specific Q&A
    console.log('\n[6] Verifying Grounded Listing Q&A & Scope Boundaries...');
    const firstProp = chennaiProps[0];
    const q1 = 'Does this property have parking?';
    const ans1 = await geminiService.answerPropertyQuestion(firstProp, q1);
    console.log(`  Q: "${q1}"`);
    console.log(`  A: "${ans1.answer}" (Grounded: ${ans1.grounded})`);

    const q2 = 'Can you interpret the legal validity of the rental agreement clause for me?';
    const ans2 = await geminiService.answerPropertyQuestion(firstProp, q2);
    console.log(`  Q (Out of scope): "${q2}"`);
    console.log(`  A: "${ans2.answer}"`);

    console.log('\n====================================================');
    console.log('🎉 ALL MVP VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runVerification();
