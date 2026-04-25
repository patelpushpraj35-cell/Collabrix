const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('./src/firebase');
const { doc, setDoc, getDoc } = require('firebase/firestore');

async function seed() {
  const adminId = '12345-admin-67890';
  const adminDoc = await getDoc(doc(db, 'users', adminId));
  
  const hashed = await bcrypt.hash('admin123', 10);
  await setDoc(doc(db, 'users', adminId), {
    id: adminId,
    name: 'Super Admin',
    email: 'admin@collabrix.io',
    password: hashed,
    role: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString()
  });
  console.log('Admin user seeded/updated in Firebase.');
  process.exit(0);
}

seed().catch(console.error);
