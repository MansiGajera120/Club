/**
 * Seed script — creates (or updates) the initial admin account.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@sportsclub.app ADMIN_PASSWORD=Secret123 npm run seed
 *
 * Falls back to sensible defaults if those env vars are absent.
 */
import mongoose from 'mongoose';

import logger from '../src/logger/index.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/user.model.js';
import { ROLES, AUTH_PROVIDER, USER_STATUS } from '../src/enums/index.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sportsclub.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Platform Admin';

const run = async () => {
  await connectDatabase();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    logger.info(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // hashed by the model pre-save hook
      role: ROLES.ADMIN,
      provider: AUTH_PROVIDER.LOCAL,
      isEmailVerified: true,
      status: USER_STATUS.ACTIVE,
    });
    logger.info(`Admin created: ${ADMIN_EMAIL} (change the password after first login)`);
  }

  await disconnectDatabase();
  await mongoose.connection.close();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Seed failed: ${err.stack || err.message}`);
    process.exit(1);
  });
