const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { collection, getDocs, doc, updateDoc, getDoc } = require('firebase/firestore');
const { authenticateToken, requireRole } = require('../middleware/auth');

const fetchAll = async (colName) => {
  const snapshot = await getDocs(collection(db, colName));
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
};

// GET /api/admin/users - All users
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await fetchAll('users');
    const creators = await fetchAll('creators');
    const brands = await fetchAll('brands');
    
    const safeUsers = users.map(({ password, ...u }) => {
      let details = null;
      if (u.role === 'creator') {
        details = creators.find(c => c.userId === u.id);
      } else if (u.role === 'brand') {
        details = brands.find(b => b.userId === u.id);
      }
      return { ...u, details };
    });
    
    res.json({ users: safeUsers });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/creators - All creators with user info
router.get('/creators', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const creators = await fetchAll('creators');
    const users = await fetchAll('users');
    const result = creators.map(c => {
      const user = users.find(u => u.id === c.userId);
      const { password, ...safeUser } = user || {};
      return { ...c, user: safeUser };
    });
    res.json({ creators: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/brands - All brands with user info
router.get('/brands', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const brands = await fetchAll('brands');
    const users = await fetchAll('users');
    const result = brands.map(b => {
      const user = users.find(u => u.id === b.userId);
      const { password, ...safeUser } = user || {};
      return { ...b, user: safeUser };
    });
    res.json({ brands: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/users/:id/status - Approve or reject
router.patch('/users/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const userRef = doc(db, 'users', req.params.id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return res.status(404).json({ error: 'User not found' });
    
    await updateDoc(userRef, { status });
    const updated = (await getDoc(userRef)).data();
    const { password, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/campaigns - All campaigns
router.get('/campaigns', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const campaigns = await fetchAll('campaigns');
    const brands = await fetchAll('brands');
    const users = await fetchAll('users');
    const result = campaigns.map(c => {
      const brand = brands.find(b => b.id === c.brandId);
      const brandUser = brand ? users.find(u => u.id === brand.userId) : null;
      return { ...c, brand: brand ? { ...brand, userName: brandUser?.name } : null };
    });
    res.json({ campaigns: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/stats
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await fetchAll('users');
    const totalUsers = users.length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;
    
    const creatorsSnap = await getDocs(collection(db, 'creators'));
    const brandsSnap = await getDocs(collection(db, 'brands'));
    const campaignsSnap = await getDocs(collection(db, 'campaigns'));
    const applicationsSnap = await getDocs(collection(db, 'applications'));
    
    res.json({
      totalUsers,
      pendingUsers,
      totalCreators: creatorsSnap.size,
      totalBrands: brandsSnap.size,
      totalCampaigns: campaignsSnap.size,
      totalApplications: applicationsSnap.size,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
