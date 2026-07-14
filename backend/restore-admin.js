import dotenv from 'dotenv';
dotenv.config();
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { User } from './src/models/user.model.js';
import { ROLES } from './src/enums/index.js';

const run = async () => {
    try {
        await connectDatabase();
        await User.findOneAndUpdate({ email: 'admin@sportsclub.app' }, { role: ROLES.ADMIN });
        console.log('Successfully restored admin role to admin@sportsclub.app');
    } catch (err) {
        console.error(err);
    } finally {
        await disconnectDatabase();
        process.exit(0);
    }
}

run();
