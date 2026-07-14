import mongoose from 'mongoose';

const run = async () => {
    try {
        await mongoose.connect('mongodb+srv://trialcandidatekmphitech_db_user:TodoApp123@cluster0.4br43la.mongodb.net/sunny_club?appName=Cluster0');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // List ALL users before deletion so we know what's what
        const allUsers = await usersCollection.find({}).project({ name: 1, email: 1, role: 1 }).toArray();
        console.log('\n=== ALL USERS IN DATABASE ===');
        allUsers.forEach(u => console.log(`  [${u.role}] ${u.name} | ${u.email}`));
        
        // Delete anything with mock patterns in email OR name
        const result = await usersCollection.deleteMany({
            $or: [
                { email: { $regex: /mock_/i } },
                { email: { $regex: /@example\.com$/i } },
                { name: { $regex: /User \d+/i } },
            ]
        });
        
        console.log(`\n✅ Deleted ${result.deletedCount} mock users.`);
        
        // Show what remains
        const remaining = await usersCollection.find({}).project({ name: 1, email: 1, role: 1 }).toArray();
        console.log('\n=== REMAINING USERS (your originals) ===');
        remaining.forEach(u => console.log(`  [${u.role}] ${u.name} | ${u.email}`));
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
