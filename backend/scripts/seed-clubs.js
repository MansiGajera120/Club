/**
 * Seed script — creates a demo club-owner plus a set of approved, browsable
 * India-based clubs (and a few events) so the app has real content on first run.
 *
 * Idempotent: safe to run repeatedly. Clubs/events are upserted by a natural
 * key (owner+name / club+title), so re-running updates rather than duplicates.
 *
 * Usage:
 *   npm run seed:clubs
 *   OWNER_EMAIL=owner@demo.com OWNER_PASSWORD=Secret123 npm run seed:clubs
 */
import mongoose from 'mongoose';

import logger from '../src/logger/index.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/user.model.js';
import { Club } from '../src/models/club.model.js';
import { Event } from '../src/models/event.model.js';
import {
  ROLES,
  AUTH_PROVIDER,
  USER_STATUS,
  CLUB_STATUS,
  GENDER,
} from '../src/enums/index.js';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'demo.owner@sportsclub.app';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'Owner@12345';
const OWNER_NAME = process.env.OWNER_NAME || 'Demo Club Owner';

/** Days from now, as a Date (used for realistic future event dates). */
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// ---- Real, distinct per-club media --------------------------------------
// Stored as absolute URLs; the API passes absolute http(s) image URLs straight
// through (see utils/url.js), so no local upload files are needed. All image
// IDs are real, verified Unsplash photos.

/** Landscape sport photo (gallery). */
const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=70`;

/** Square sport photo (used as the club "logo"/thumbnail — a real image). */
const square = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=400&q=75`;

/** logo (real square photo) + 3 distinct gallery photos, keyed by club name. */
const MEDIA = {
  'Mumbai Strikers Football Academy': {
    logo: square('1431324155629-1a6deb1dec8d'),
    gallery: [
      photo('1522778119026-d647f0596c20'),
      photo('1459865264687-595d652de67e'),
      photo('1431324155629-1a6deb1dec8d'),
    ],
  },
  'AquaSprint Swimming Academy': {
    logo: square('1530549387789-4c1017266635'),
    gallery: [
      photo('1519315901367-f34ff9154487'),
      photo('1600965962361-9035dbfd1c50'),
      photo('1530549387789-4c1017266635'),
    ],
  },
  'Delhi Dribblers Basketball Club': {
    logo: square('1546519638-68e109498ffc'),
    gallery: [
      photo('1608245449230-4ac19066d2d0'),
      photo('1519861531473-9200262188bf'),
      photo('1546519638-68e109498ffc'),
    ],
  },
  'Nrityam Gymnastics Academy': {
    logo: square('1541534741688-6078c6bfb5c5'),
    gallery: [
      photo('1518611012118-696072aa579a'),
      photo('1574680096145-d05b474e2155'),
      photo('1541534741688-6078c6bfb5c5'),
    ],
  },
  'Ace Smash Tennis Academy': {
    logo: square('1554068865-24cecd4e34b8'),
    gallery: [
      photo('1622279457486-62dcc4a431d6'),
      photo('1595435934249-5df7ed86e1c0'),
      photo('1554068865-24cecd4e34b8'),
    ],
  },
  'Chennai Chargers Cricket Academy': {
    logo: square('1531415074968-036ba1b575da'),
    gallery: [
      photo('1540747913346-19e32dc3e97e'),
      photo('1607734834519-d8576ae60ea6'),
      photo('1531415074968-036ba1b575da'),
    ],
  },
};

const CLUBS = [
  {
    name: 'Mumbai Strikers Football Academy',
    sport: 'Football',
    city: 'Mumbai',
    address: 'Andheri Sports Complex, Andheri West, Mumbai, Maharashtra 400058',
    description:
      'AIFF-affiliated youth football academy with licensed coaches. Weekly training, '
      + 'turf matches and inter-academy tournaments across all age groups.',
    gender: GENDER.MIXED,
    ageMin: 6,
    ageMax: 16,
    price: 2500,
    isFeatured: true,
    contact: {
      phone: '+91 98200 11223',
      email: 'info@mumbaistrikers.in',
      website: 'https://mumbaistrikers.in',
      instagram: 'mumbaistrikersfc',
    },
    registrationLink: 'https://mumbaistrikers.in/register',
  },
  {
    name: 'AquaSprint Swimming Academy',
    sport: 'Swimming',
    city: 'Pune',
    address: 'Koregaon Park, Pune, Maharashtra 411001',
    description:
      'Learn-to-swim through competitive squads in a heated semi-Olympic pool. '
      + 'Small batches and certified instructors for water confidence and technique.',
    gender: GENDER.MIXED,
    ageMin: 4,
    ageMax: 18,
    price: 1800,
    isFeatured: true,
    contact: {
      phone: '+91 98220 44556',
      email: 'hello@aquasprint.in',
      website: 'https://aquasprint.in',
      instagram: 'aquasprint.pune',
    },
    registrationLink: 'https://aquasprint.in/join',
  },
  {
    name: 'Delhi Dribblers Basketball Club',
    sport: 'Basketball',
    city: 'New Delhi',
    address: 'Siri Fort Sports Complex, August Kranti Marg, New Delhi 110049',
    description:
      'Fast-paced basketball development — fundamentals, scrimmages and a competitive '
      + 'league on indoor wooden courts open through the year.',
    gender: GENDER.MALE,
    ageMin: 8,
    ageMax: 18,
    price: 1500,
    isFeatured: false,
    contact: {
      phone: '+91 98110 77889',
      email: 'coach@delhidribblers.in',
      website: 'https://delhidribblers.in',
    },
    registrationLink: 'https://delhidribblers.in/tryouts',
  },
  {
    name: 'Nrityam Gymnastics Academy',
    sport: 'Gymnastics',
    city: 'Bengaluru',
    address: 'Indiranagar 100 Ft Road, Bengaluru, Karnataka 560038',
    description:
      'Gymnastics from tots to team — strength, flexibility and confidence in a safe, '
      + 'fully-matted facility with spotting-certified coaches.',
    gender: GENDER.FEMALE,
    ageMin: 3,
    ageMax: 14,
    price: 2200,
    isFeatured: true,
    contact: {
      phone: '+91 98450 33221',
      email: 'team@nrityamgym.in',
      website: 'https://nrityamgym.in',
      instagram: 'nrityam.gymnastics',
    },
    registrationLink: 'https://nrityamgym.in/enroll',
  },
  {
    name: 'Ace Smash Tennis Academy',
    sport: 'Tennis',
    city: 'Hyderabad',
    address: 'Gachibowli Stadium Road, Hyderabad, Telangana 500032',
    description:
      'Year-round tennis coaching on clay and hard courts. Group clinics and private '
      + 'lessons with AITA-certified coaches and former state players.',
    gender: GENDER.MIXED,
    ageMin: 6,
    ageMax: 17,
    price: 3000,
    isFeatured: false,
    contact: {
      phone: '+91 99490 66778',
      email: 'play@acesmash.in',
      website: 'https://acesmash.in',
      instagram: 'acesmash.hyd',
    },
    registrationLink: 'https://acesmash.in/book',
  },
  {
    name: 'Chennai Chargers Cricket Academy',
    sport: 'Cricket',
    city: 'Chennai',
    address: 'Nungambakkam High Road, Chennai, Tamil Nadu 600034',
    description:
      'Junior cricket coaching covering batting, bowling and fielding. Weekend nets and '
      + 'a summer inter-club league on well-maintained turf wickets.',
    gender: GENDER.MALE,
    ageMin: 10,
    ageMax: 19,
    price: 2000,
    isFeatured: false,
    contact: {
      phone: '+91 90030 55447',
      email: 'info@chennaichargers.in',
      website: 'https://chennaichargers.in',
    },
    registrationLink: 'https://chennaichargers.in/register',
  },
];

/** Events keyed by club name. */
const EVENTS = {
  'Mumbai Strikers Football Academy': [
    {
      title: 'Monsoon Football Camp',
      description: 'A week-long intensive camp focused on dribbling, passing and match play.',
      location: 'Andheri Sports Complex, Mumbai',
      startDate: daysFromNow(21),
      endDate: daysFromNow(26),
      registrationLink: 'https://mumbaistrikers.in/monsoon-camp',
    },
    {
      title: 'Free Trial & Open Day',
      description: 'Try a free training session and meet the coaching team.',
      location: 'Andheri Sports Complex, Mumbai',
      startDate: daysFromNow(10),
    },
  ],
  'AquaSprint Swimming Academy': [
    {
      title: 'Summer Swim Intake',
      description: 'New batch intake for beginner swimmers. Assessment and squad placement.',
      location: 'AquaSprint Pool, Koregaon Park, Pune',
      startDate: daysFromNow(14),
    },
  ],
  'Nrityam Gymnastics Academy': [
    {
      title: 'Annual Gymnastics Showcase',
      description: 'End-of-term showcase where gymnasts perform their routines for family.',
      location: 'Nrityam Academy, Indiranagar, Bengaluru',
      startDate: daysFromNow(35),
    },
  ],
};

const run = async () => {
  await connectDatabase();

  // 1) Demo club owner (idempotent).
  let owner = await User.findOne({ email: OWNER_EMAIL });
  if (!owner) {
    owner = await User.create({
      name: OWNER_NAME,
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD, // hashed by the model pre-save hook
      role: ROLES.CLUB_OWNER,
      provider: AUTH_PROVIDER.LOCAL,
      isEmailVerified: true,
      status: USER_STATUS.ACTIVE,
    });
    logger.info(`Club owner created: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
  } else {
    logger.info(`Club owner already exists: ${OWNER_EMAIL}`);
  }

  // Optional: an admin to attribute the approval to.
  const admin = await User.findOne({ role: ROLES.ADMIN });

  // 2) Clubs (upsert by owner + name → re-runnable, no duplicates).
  let created = 0;
  let updated = 0;
  const clubByName = {};

  for (const data of CLUBS) {
    const existing = await Club.findOne({ owner: owner._id, name: data.name });
    const doc = {
      ...data,
      ...(MEDIA[data.name] ?? {}), // real logo + gallery per club
      owner: owner._id,
      priceCurrency: 'INR',
      status: CLUB_STATUS.APPROVED,
      approvedAt: new Date(),
      ...(admin ? { approvedBy: admin._id } : {}),
    };

    if (existing) {
      Object.assign(existing, doc);
      await existing.save();
      clubByName[data.name] = existing;
      updated += 1;
    } else {
      clubByName[data.name] = await Club.create(doc);
      created += 1;
    }
  }
  logger.info(`Clubs seeded — created: ${created}, updated: ${updated}`);

  // 2b) Remove stale clubs from this demo owner that are no longer in the set
  // (e.g. old US-based seed data), along with their events.
  const keepNames = CLUBS.map((c) => c.name);
  const stale = await Club.find({
    owner: owner._id,
    name: { $nin: keepNames },
  }).select('_id name');
  if (stale.length) {
    const ids = stale.map((c) => c._id);
    await Event.deleteMany({ club: { $in: ids } });
    await Club.deleteMany({ _id: { $in: ids } });
    logger.info(
      `Removed ${stale.length} stale club(s): ${stale.map((c) => c.name).join(', ')}`
    );
  }

  // 3) Events (upsert by club + title).
  let eventsUpserted = 0;
  for (const [clubName, events] of Object.entries(EVENTS)) {
    const club = clubByName[clubName];
    if (!club) continue;
    for (const ev of events) {
      await Event.findOneAndUpdate(
        { club: club._id, title: ev.title },
        { ...ev, club: club._id, isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      eventsUpserted += 1;
    }
  }
  logger.info(`Events seeded — upserted: ${eventsUpserted}`);

  await disconnectDatabase();
  await mongoose.connection.close();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Club seed failed: ${err.stack || err.message}`);
    process.exit(1);
  });
