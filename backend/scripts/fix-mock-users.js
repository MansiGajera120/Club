import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';

const run = async () => {
    try {
        await mongoose.connect('mongodb+srv://trialcandidatekmphitech_db_user:TodoApp123@cluster0.4br43la.mongodb.net/sunny_club?appName=Cluster0');
        
        const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
        
        const users = await User.find({ name: { $regex: /User \d+/ } });
        
        let c = 0;
        for (const u of users) {
             c++;
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            
            if (u.email === 'admin@sportsclub.app') continue;
            
            const emailPart = (firstName + lastName).toLowerCase();
            const fakeEmail = `${emailPart}${Math.floor(Math.random()*100)}@gmail.com`;
            
            await User.findByIdAndUpdate(u._id, { 
                name: `${firstName} ${lastName}`,
                email: fakeEmail 
            });
        }
        
        console.log('Restored mock users to realistic names!', c);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
