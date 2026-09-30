const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { User, Report } = require('../src/models');

const HOUR = 60 * 60 * 1000;

const ADMIN_EMAIL = 'admin@climatrix.local';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'ChangeMe123!';

const reports = [
  [
    'Kolkata',
    'West Bengal',
    88.3639,
    22.5726,
    'flood',
    'Severe waterlogging near Park Street, shops taking in water',
    'verified',
    2,
    88,
    true,
  ],
  [
    'Kolkata',
    'West Bengal',
    88.366,
    22.574,
    'flood',
    'Flooding on Park Street, water entering shops',
    'duplicate',
    2,
    40,
    false,
    0,
  ],
  [
    'Howrah',
    'West Bengal',
    88.3103,
    22.5958,
    'rainfall',
    'Continuous heavy rain since morning near Howrah bridge',
    'auto_verified',
    3,
    79,
    true,
  ],
  [
    'Siliguri',
    'West Bengal',
    88.4285,
    26.7271,
    'fog',
    'Dense fog, visibility under 50 metres on the highway',
    'verified',
    5,
    84,
    false,
  ],
  [
    'Delhi',
    'Delhi',
    77.209,
    28.6139,
    'heatwave',
    'Scorching heat, loo winds, 44 degrees at noon',
    'verified',
    6,
    90,
    true,
  ],
  [
    'Delhi',
    'Delhi',
    77.23,
    28.65,
    'fog',
    'Thick smog and fog over ring road',
    'auto_verified',
    8,
    76,
    false,
  ],
  [
    'Mumbai',
    'Maharashtra',
    72.8777,
    19.076,
    'rainfall',
    'Heavy downpour in Andheri, local trains slow',
    'verified',
    4,
    86,
    true,
  ],
  [
    'Mumbai',
    'Maharashtra',
    72.86,
    19.05,
    'flood',
    'Waterlogging at Dadar, roads submerged',
    'pending',
    1,
    52,
    true,
  ],
  [
    'Guwahati',
    'Assam',
    91.7362,
    26.1445,
    'flood',
    'Brahmaputra overflow, low lying colonies flooded',
    'verified',
    10,
    92,
    true,
  ],
  [
    'Dibrugarh',
    'Assam',
    94.912,
    27.4728,
    'thunderstorm',
    'Lightning and thunder with heavy rain since evening',
    'auto_verified',
    7,
    77,
    false,
  ],
  [
    'Jaipur',
    'Rajasthan',
    75.7873,
    26.9124,
    'dust_storm',
    'Aandhi with dust reducing visibility',
    'verified',
    9,
    81,
    true,
  ],
  [
    'Jodhpur',
    'Rajasthan',
    73.0243,
    26.2389,
    'strong_wind',
    'Very strong gusty wind, hoardings falling',
    'pending',
    2,
    48,
    false,
  ],
  [
    'Bhubaneswar',
    'Odisha',
    85.8245,
    20.2961,
    'thunderstorm',
    'Thunderstorm with lightning near the coast',
    'verified',
    12,
    83,
    false,
  ],
  [
    'Chennai',
    'Tamil Nadu',
    80.2707,
    13.0827,
    'rainfall',
    'Steady rain and waterlogged streets in T Nagar',
    'pending',
    1,
    55,
    true,
  ],
  [
    'Patna',
    'Bihar',
    85.1376,
    25.5941,
    'heatwave',
    'Heat stroke cases, extreme heat and humidity',
    'pending',
    3,
    45,
    false,
  ],
  [
    'Kolkata',
    'West Bengal',
    88.35,
    22.56,
    'other',
    'URGENT!!! FLOOD EVERYWHERE!!! SHARE NOW',
    'flagged',
    1,
    8,
    false,
  ],
  [
    'Mumbai',
    'Maharashtra',
    72.9,
    19.1,
    'heatwave',
    'HEATWAVE!!! EVERYONE STAY INSIDE',
    'flagged',
    2,
    12,
    false,
  ],
  [
    'Kolkata',
    'West Bengal',
    88.4,
    22.6,
    'rainfall',
    'Light drizzle in Salt Lake this evening',
    'rejected',
    5,
    30,
    false,
  ],
  [
    'Guwahati',
    'Assam',
    91.75,
    26.16,
    'rainfall',
    'Heavy rain in Dispur, drains overflowing',
    'pending',
    1,
    50,
    true,
  ],
  [
    'Delhi',
    'Delhi',
    77.1,
    28.7,
    'dust_storm',
    'Dust storm approaching from the west, sky turning brown',
    'pending',
    1,
    47,
    false,
  ],
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI missing in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  if (process.argv.includes('--reset')) {
    await Report.deleteMany({});
    console.log('Existing reports deleted');
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: 'Demo Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const createdReports = [];

  for (const row of reports) {
    const [
      city,
      state,
      longitude,
      latitude,
      eventType,
      description,
      status,
      hoursAgo,
      credibilityScore,
      hasMedia,
      duplicateIndex,
    ] = row;

    const report = await Report.create({
      eventType,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        city,
        state,
      },
      eventDateTime: new Date(Date.now() - hoursAgo * HOUR),
      media: hasMedia
        ? [
            {
              url: 'https://placehold.co/600x400?text=Weather+Photo',
              type: 'photo',
            },
          ]
        : [],
      status,
      credibilityScore,
      duplicateOf:
        duplicateIndex !== undefined
          ? createdReports[duplicateIndex]._id
          : null,
      mlMeta: {
        fakeProbability: 100 - credibilityScore,
        processedAt: new Date(),
      },
    });

    createdReports.push(report);
  }

  console.log(`Seeded ${createdReports.length} reports`);

  console.log(
    `Admin login -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`
  );

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});