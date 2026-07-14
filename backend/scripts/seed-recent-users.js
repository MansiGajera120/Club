import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/user.model.js';
import { ROLES, AUTH_PROVIDER, USER_STATUS } from '../src/enums/index.js';

const run = async () => {
  try {
    await connectDatabase();
    const now = new Date();
    
    // We update existing users to have recent creation dates! This bypasses create strictness!
    const users = await User.find({}).limit(14);
    let i = 0;
    for (const u of users) {
        const randomDays = Math.floor(Math.random() * 7);
        const createdAt = new Date(now);
        createdAt.setDate(now.getDate() - randomDays);
        
        await User.findByIdAndUpdate(u._id, { createdAt }, { timestamps: false });
        
        // Also let's ensure roles are distributed
        if (i < 8) await User.findByIdAndUpdate(u._id, { role: ROLES.PARENT });
        else if (i < 12) await User.findByIdAndUpdate(u._id, { role: ROLES.CLUB_OWNER });
        else await User.findByIdAndUpdate(u._id, { role: ROLES.ADMIN });
        i++;
    }
    console.log('Seeded recent users successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};
run();
