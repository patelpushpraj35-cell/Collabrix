// In-memory database (replace with real DB in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [],
  creators: [],
  brands: [],
  campaigns: [],
  applications: [],
  tasks: [],
};

// Seed admin user
(async () => {
  const hashed = await bcrypt.hash('admin123', 10);
  db.users.push({
    id: uuidv4(),
    role: 'admin',
    name: 'Super Admin',
    email: 'admin@collabrix.io',
    mobile: '9999999999',
    password: hashed,
    status: 'approved',
    createdAt: new Date().toISOString(),
  });
})();

module.exports = db;
