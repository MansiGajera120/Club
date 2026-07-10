/**
 * One-off maintenance script: remove users whose email is not verified.
 *
 *   node scripts/removeUnverifiedUsers.js          # dry run (reports only)
 *   node scripts/removeUnverifiedUsers.js --apply   # actually delete
 *
 * Also reports (and, with --apply, deletes) any clubs owned by those users so
 * the database is not left with orphaned club documents.
 */
import mongoose from 'mongoose';
import config from '../src/config/index.js';
import User from '../src/models/user.model.js';
import Club from '../src/models/club.model.js';

const APPLY = process.argv.includes('--apply');

const run = async () => {
  await mongoose.connect(config.db.uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to ${mongoose.connection.name}\n`);

  const unverified = await User.find({ isEmailVerified: false })
    .select('_id email role createdAt')
    .lean();

  if (unverified.length === 0) {
    console.log('No unverified users found. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${unverified.length} unverified user(s):`);
  for (const u of unverified) {
    console.log(`  - ${u.email}  [${u.role}]  created ${new Date(u.createdAt).toISOString()}`);
  }

  const ownerIds = unverified.map((u) => u._id);
  const ownedClubs = await Club.find({ owner: { $in: ownerIds } })
    .select('_id name status owner')
    .lean();

  if (ownedClubs.length > 0) {
    console.log(`\n${ownedClubs.length} club(s) owned by these users (will also be removed):`);
    for (const c of ownedClubs) {
      console.log(`  - ${c.name} [${c.status}]`);
    }
  } else {
    console.log('\nNone of these users own any clubs.');
  }

  if (!APPLY) {
    console.log('\nDRY RUN — nothing deleted. Re-run with --apply to delete.');
    await mongoose.disconnect();
    return;
  }

  const clubResult = ownedClubs.length
    ? await Club.deleteMany({ owner: { $in: ownerIds } })
    : { deletedCount: 0 };
  const userResult = await User.deleteMany({ isEmailVerified: false });

  console.log(`\nDeleted ${userResult.deletedCount} user(s) and ${clubResult.deletedCount} club(s).`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
