import mongoose from 'mongoose';

const ORIGINAL_EMAILS = [
  'admin@sportsclub.app',
  'sunny.radadiya2005@gmail.com',
  'sunnyradadiya46@gmail.com',
  'demo.owner@sportsclub.app',
  '23ce122@charusat.edu.in',
  'darshita.kmphitech@gmail.com',
  'sunnyradadiya76@gmail.com',
  'sunnyradadiya.edunet@gmail.com',
  'trial.candidate.kmphitech@gmail.com',
  'sunnyff843@gmail.com',
  'darshan.kmphitech@gmail.com',
  'darshan.kmphitech@yopmail.com',
];

const run = async () => {
    try {
        await mongoose.connect('mongodb+srv://trialcandidatekmphitech_db_user:TodoApp123@cluster0.4br43la.mongodb.net/sunny_club?appName=Cluster0');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // Delete everyone NOT in the original list
        const result = await usersCollection.deleteMany({
            email: { $nin: ORIGINAL_EMAILS }
        });
        
        console.log(`✅ Deleted ${result.deletedCount} mock/fake users.`);
        
        // Verify what remains
        const remaining = await usersCollection.find({}).project({ name: 1, email: 1, role: 1 }).toArray();
        console.log('\n=== YOUR ORIGINAL USERS (restored) ===');
        remaining.forEach(u => console.log(`  [${u.role}] ${u.name} | ${u.email}`));
        console.log(`\nTotal: ${remaining.length} users`);
        
    } catch (err) {
        console.error(err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
