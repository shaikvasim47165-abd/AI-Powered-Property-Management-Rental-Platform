const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Heuristic fallback parser when Gemini API key is not configured or offline.
 * Extracts bedrooms, city, maxRent, furnished, and amenities using smart regex.
 */
const fallbackQueryParser = (query) => {
  const text = query.toLowerCase();
  const filters = {
    city: null,
    bedrooms: null,
    maxRent: null,
    minRent: null,
    propertyType: null,
    furnished: null,
    amenities: [],
  };

  // Bedrooms: e.g. "1bhk", "2 bhk", "3 bedroom", "studio"
  const bhkMatch = text.match(/(\d+)\s*(?:bhk|bedroom|bed)/i);
  if (bhkMatch) {
    filters.bedrooms = parseInt(bhkMatch[1], 10);
  } else if (text.includes('studio')) {
    filters.bedrooms = 0;
    filters.propertyType = 'Studio';
  }

  // Rent / Budget: e.g. "under 25k", "under 25000", "< 30000", "below 20,000", "between 15k and 25k"
  const kMatch = text.match(/(?:under|below|less than|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)(?:\s*k)?/i);
  if (kMatch) {
    let val = parseInt(kMatch[1], 10);
    if (text.includes(`${kMatch[1]}k`) || val < 100) {
      val = val * 1000;
    }
    filters.maxRent = val;
  }

  // Common Cities
  const cities = ['chennai', 'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'pune', 'delhi', 'noida', 'gurgaon', 'kolkata'];
  for (const c of cities) {
    if (text.includes(c)) {
      filters.city = c === 'bengaluru' ? 'Bangalore' : c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Property types
  if (text.includes('villa')) filters.propertyType = 'Villa';
  else if (text.includes('apartment') || text.includes('flat')) filters.propertyType = 'Apartment';
  else if (text.includes('independent house') || text.includes('house')) filters.propertyType = 'Independent House';
  else if (text.includes('penthouse')) filters.propertyType = 'Penthouse';

  // Furnishing
  if (text.includes('fully furnished') || text.includes('furnished')) {
    filters.furnished = true;
  } else if (text.includes('unfurnished')) {
    filters.furnished = false;
  }

  // Amenities detection
  const commonAmenities = [
    { key: 'parking', name: 'Parking' },
    { key: 'power backup', name: 'Power Backup' },
    { key: 'generator', name: 'Power Backup' },
    { key: 'gym', name: 'Gym' },
    { key: 'swimming pool', name: 'Swimming Pool' },
    { key: 'pool', name: 'Swimming Pool' },
    { key: 'lift', name: 'Lift' },
    { key: 'elevator', name: 'Lift' },
    { key: 'security', name: 'Security' },
    { key: 'cctv', name: 'CCTV' },
    { key: 'pet friendly', name: 'Pet Friendly' },
    { key: 'wifi', name: 'WiFi' },
    { key: 'balcony', name: 'Balcony' },
  ];

  for (const item of commonAmenities) {
    if (text.includes(item.key) && !filters.amenities.includes(item.name)) {
      filters.amenities.push(item.name);
    }
  }

  return filters;
};

/**
 * Parses natural language search query using Gemini.
 * Returns structured parameters strictly validated.
 */
const parseNaturalLanguageSearch = async (userQuery) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    console.log('[AI Search] Gemini API key not detected. Using intelligent heuristic query parser.');
    const parsed = fallbackQueryParser(userQuery);
    return {
      structuredFilters: parsed,
      aiExplanation: `Extracted parameters: ${parsed.bedrooms ? `${parsed.bedrooms} BHK` : ''} ${parsed.city ? `in ${parsed.city}` : ''} ${parsed.maxRent ? `under ₹${parsed.maxRent.toLocaleString('en-IN')}` : ''} ${parsed.amenities.length ? `with ${parsed.amenities.join(', ')}` : ''}`.trim() || `Showing properties matching your request "${userQuery}".`,
      isAiGenerated: false,
    };
  }

  const prompt = `
You are a precise real-estate search parameter parser.
Convert the user's natural language rental property search request into a JSON object with only the following structure:
{
  "city": string or null (e.g. "Chennai", "Bangalore", "Mumbai"),
  "bedrooms": number or null (e.g. 1, 2, 3),
  "minRent": number or null,
  "maxRent": number or null,
  "propertyType": string or null (must be one of: "Apartment", "Villa", "Independent House", "Studio", "Penthouse" or null),
  "furnished": boolean or null,
  "amenities": array of strings (choose from: ["Parking", "Power Backup", "Security", "Lift", "Gym", "Swimming Pool", "WiFi", "Pet Friendly", "CCTV", "Balcony"]),
  "summaryExplanation": a polite 1-sentence explanation of what criteria you extracted to help the user.
}

Rules:
1. ONLY return pure JSON. No markdown code blocks, no backticks, no conversational fluff.
2. If rent is specified in 'k' (e.g. 25k), convert to actual thousands (25000).
3. Do not invent criteria the user did not ask for.

User query: "${userQuery}"
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean any markdown formatting if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(text);
    return {
      structuredFilters: {
        city: parsed.city || null,
        bedrooms: typeof parsed.bedrooms === 'number' ? parsed.bedrooms : null,
        minRent: typeof parsed.minRent === 'number' ? parsed.minRent : null,
        maxRent: typeof parsed.maxRent === 'number' ? parsed.maxRent : null,
        propertyType: parsed.propertyType || null,
        furnished: typeof parsed.furnished === 'boolean' ? parsed.furnished : null,
        amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
      },
      aiExplanation: parsed.summaryExplanation || `Filtered for your search: "${userQuery}"`,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('[AI Search] Gemini parsing failed:', error.message);
    const fallback = fallbackQueryParser(userQuery);
    return {
      structuredFilters: fallback,
      aiExplanation: `Showing properties matching your request "${userQuery}".`,
      isAiGenerated: false,
    };
  }
};

/**
 * Answers questions about a specific property strictly using MongoDB property data.
 * Adheres strictly to Section 9 (AI Scope Boundary) of the MVP specification:
 * - Clarification, amenities, price, availability are allowed.
 * - Legal advice, contract advice, valuation/investment opinions are refused and redirected.
 */
const answerPropertyQuestion = async (property, question) => {
  const lowerQ = question.toLowerCase();

  // Boundary checks: check for out-of-scope topics
  const outOfScopeKeywords = [
    'legal', 'court', 'lawyer', 'contract validity', 'stamp paper', 'lease agreement clause',
    'investment', 'good deal', 'worth buying', 'negotiate rent down', 'loan', 'mortgage',
    'will price increase', 'roi', 'valuation'
  ];

  const isOutOfScope = outOfScopeKeywords.some(keyword => lowerQ.includes(keyword));
  if (isOutOfScope) {
    return {
      answer: "I can assist you with property specifications, pricing, amenities, and platform steps. For legal advice, rental contract terms, or financial/investment counseling, please consult a qualified legal or financial professional.",
      grounded: true,
      isAiGenerated: false,
    };
  }

  const genAI = getGeminiClient();

  if (!genAI) {
    // Intelligent rule-based answering directly from DB fields when Gemini API key is missing
    const rent = `₹${property.rent.toLocaleString('en-IN')}/month`;
    const deposit = `₹${property.deposit.toLocaleString('en-IN')}`;
    const amenities = property.amenities.length > 0 ? property.amenities.join(', ') : 'Standard residential amenities';

    if (lowerQ.includes('rent') || lowerQ.includes('price') || lowerQ.includes('cost')) {
      return { answer: `The monthly rent for this property is ${rent}, with a security deposit of ${deposit}.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('deposit')) {
      return { answer: `The security deposit required is ${deposit}. Monthly rent is ${rent}.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('park') || lowerQ.includes('car')) {
      const hasParking = property.amenities.some(a => a.toLowerCase().includes('parking'));
      return { answer: hasParking ? 'Yes, dedicated parking is available with this listing.' : 'Parking is not listed in the standard amenities for this listing.', grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('furnish')) {
      return { answer: `This property is ${property.furnishingStatus || (property.furnished ? 'Furnished' : 'Unfurnished')}.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('bedroom') || lowerQ.includes('bhk') || lowerQ.includes('bath')) {
      return { answer: `This is a ${property.bedrooms} BHK ${property.propertyType} with ${property.bathrooms} bathroom(s) covering approximately ${property.areaSqFt} sq.ft.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('location') || lowerQ.includes('where') || lowerQ.includes('area')) {
      return { answer: `This property is located in ${property.location.area}, ${property.location.city}.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('amenit')) {
      return { answer: `Available amenities include: ${amenities}.`, grounded: true, isAiGenerated: false };
    }
    if (lowerQ.includes('availab')) {
      const dateStr = property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : 'Immediate';
      return { answer: `Status is currently '${property.status}' and available from ${dateStr}.`, grounded: true, isAiGenerated: false };
    }

    return {
      answer: `This is a ${property.bedrooms} BHK ${property.propertyType} in ${property.location.area}, ${property.location.city} available for ${rent} (${deposit} deposit). Amenities: ${amenities}. Description: ${property.description}`,
      grounded: true,
      isAiGenerated: false,
    };
  }

  // Format property context safely for Gemini
  const propertyContext = {
    title: property.title,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqFt: property.areaSqFt,
    rentINR: property.rent,
    depositINR: property.deposit,
    city: property.location.city,
    area: property.location.area,
    address: property.location.address || 'Contact owner for full address',
    amenities: property.amenities,
    furnishingStatus: property.furnishingStatus || (property.furnished ? 'Furnished' : 'Unfurnished'),
    status: property.status,
    availableFrom: property.availableFrom,
    description: property.description,
  };

  const systemInstruction = `
You are the AI Property Assistant for PropAI.
Answer the tenant's question about THIS SPECIFIC PROPERTY accurately, concisely, and politely.

CRITICAL INSTRUCTIONS:
1. ONLY state facts present in the PROPERTY DATA below. Never invent details, prices, distances, or amenities not listed.
2. If the user asks about something not mentioned in the property data (e.g. specific pet rules, exact metro distance if not in description), state that it is not specified and advise them to send an enquiry to the owner.
3. If the user asks for legal advice, rental agreement legality, investment opinions, or rent negotiation advice, politely decline and recommend consulting a professional.
4. Keep the answer under 3-4 clear sentences.
5. Format currency in Indian Rupees (₹).

PROPERTY DATA:
${JSON.stringify(propertyContext, null, 2)}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });
    const result = await model.generateContent(question);
    const answer = result.response.text().trim();
    return {
      answer,
      grounded: true,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('[AI Question] Gemini failed:', error.message);
    return {
      answer: `This is a ${property.bedrooms} BHK ${property.propertyType} in ${property.location.area}, ${property.location.city} for ₹${property.rent.toLocaleString('en-IN')}/month. Amenities include: ${property.amenities.join(', ')}. Please use the "Enquire Now" button to ask the owner directly!`,
      grounded: true,
      isAiGenerated: false,
    };
  }
};

module.exports = {
  parseNaturalLanguageSearch,
  answerPropertyQuestion,
};
