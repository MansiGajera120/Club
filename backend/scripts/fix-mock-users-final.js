import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';

const run = async () => {
    try {
        await mongoose.connect('mongodb+srv://trialcandidatekmphitech_db_user:TodoApp123@cluster0.4br43la.mongodb.net/sunny_club?appName=Cluster0');
        
        const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
        
        // Find users that STILL have "User" in their name or "mock" in their email
        const users = await User.find({ 
            $or: [
                { name: { $regex: /User \d+/i } },
                { email: { $regex: /mock_/i } }
            ]
        });
        
        let c = 0;
        for (const u of users) {
             c++;
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            
            if (u.email === 'admin@sportsclub.app') continue;
            
            const emailPart = (firstName + lastName).toLowerCase();
            // Attach unique ID part to prevent duplicate key error!
            const fakeEmail = `${emailPart}_${u._id.toString().slice(-4)}@example.com`;
            
            await User.findByIdAndUpdate(u._id, { 
                name: `${firstName} ${lastName}`,
                email: fakeEmail 
            });
        }
        
        console.log('Restored remaining mock users to realistic names!', c);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
