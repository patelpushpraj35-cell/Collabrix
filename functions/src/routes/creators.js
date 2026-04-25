const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { collection, getDocs, doc, setDoc, updateDoc, getDoc, query, where } = require('firebase/firestore');
const { authenticateToken, requireRole, requireApproved } = require('../middleware/auth');

const fetchOneByUserId = async (colName, userId) => {
  const q = query(collection(db, colName), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
};

const fetchAll = async (colName) => {
  const snapshot = await getDocs(collection(db, colName));
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
};

// POST /api/creators/profile - Save creator profile (step form)
router.post('/profile', authenticateToken, requireRole('creator'), async (req, res) => {
  try {
    const { niche, platforms, followers, avgViews, avgLikes, contentType, channelUrl } = req.body;
    const existing = await fetchOneByUserId('creators', req.user.id);

    if (existing) {
      await updateDoc(doc(db, 'creators', existing.id), {
        niche, platforms, followers, avgViews, avgLikes, contentType, channelUrl,
        updatedAt: new Date().toISOString()
      });
      const updated = (await getDoc(doc(db, 'creators', existing.id))).data();
      return res.json({ creator: updated });
    }

    const creatorId = uuidv4();
    const newCreator = {
      id: creatorId,
      userId: req.user.id,
      niche: niche || [],
      platforms: platforms || [],
      followers: followers || 0,
      avgViews: avgViews || 0,
      avgLikes: avgLikes || 0,
      contentType: contentType || 'both',
      channelUrl: channelUrl || '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'creators', creatorId), newCreator);
    res.status(201).json({ creator: newCreator });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/creators/profile - Get own profile
router.get('/profile', authenticateToken, requireRole('creator'), async (req, res) => {
  try {
    const creator = await fetchOneByUserId('creators', req.user.id);
    if (!creator) return res.status(404).json({ error: 'Profile not found' });
    res.json({ creator });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/creators/campaigns - Browse available campaigns
router.get('/campaigns', authenticateToken, requireRole('creator'), requireApproved, async (req, res) => {
  try {
    const creator = await fetchOneByUserId('creators', req.user.id);
    const campaigns = await fetchAll('campaigns');
    const brands = await fetchAll('brands');
    const users = await fetchAll('users');
    
    let creatorApps = [];
    if (creator) {
      const q = query(collection(db, 'applications'), where('creatorId', '==', creator.id));
      const appsSnap = await getDocs(q);
      creatorApps = appsSnap.docs.map(d => d.data());
    }

    const result = campaigns.map(c => {
      const brand = brands.find(b => b.id === c.brandId);
      const brandUser = brand ? users.find(u => u.id === brand.userId) : null;
      const application = creatorApps.find(a => a.campaignId === c.id);
      
      return {
        ...c,
        brandName: brandUser?.name || brand?.companyName || 'Unknown Brand',
        applicationStatus: application?.status || null,
        applicationId: application?.id || null,
      };
    });
    res.json({ campaigns: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/creators/campaigns/:id/apply
router.post('/campaigns/:id/apply', authenticateToken, requireRole('creator'), requireApproved, async (req, res) => {
  try {
    const cSnap = await getDoc(doc(db, 'campaigns', req.params.id));
    if (!cSnap.exists()) return res.status(404).json({ error: 'Campaign not found' });
    const campaign = cSnap.data();

    const creator = await fetchOneByUserId('creators', req.user.id);
    if (!creator) return res.status(400).json({ error: 'Complete your profile first' });

    const q = query(collection(db, 'applications'), 
      where('campaignId', '==', campaign.id), 
      where('creatorId', '==', creator.id));
    const snap = await getDocs(q);
    if (!snap.empty) return res.status(409).json({ error: 'Already applied' });

    const appId = uuidv4();
    const application = {
      id: appId,
      campaignId: campaign.id,
      creatorId: creator.id,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'applications', appId), application);
    
    const applicants = [...(campaign.applicants || []), creator.id];
    await updateDoc(doc(db, 'campaigns', campaign.id), { applicants });

    res.status(201).json({ application });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/creators/applications - My applications
router.get('/applications', authenticateToken, requireRole('creator'), async (req, res) => {
  try {
    const creator = await fetchOneByUserId('creators', req.user.id);
    if (!creator) return res.json({ applications: [] });

    const qApps = query(collection(db, 'applications'), where('creatorId', '==', creator.id));
    const appsSnap = await getDocs(qApps);
    
    const applications = [];
    const brands = await fetchAll('brands');
    const users = await fetchAll('users');

    for (const d of appsSnap.docs) {
      const a = d.data();
      let campaign = null;
      let task = null;
      
      const campSnap = await getDoc(doc(db, 'campaigns', a.campaignId));
      if (campSnap.exists()) {
        const cData = campSnap.data();
        const brand = brands.find(b => b.id === cData.brandId);
        const brandUser = brand ? users.find(u => u.id === brand.userId) : null;
        campaign = { ...cData, brandName: brandUser?.name || brand?.companyName };
      }

      const tQ = query(collection(db, 'tasks'), where('applicationId', '==', a.id));
      const tSnap = await getDocs(tQ);
      if (!tSnap.empty) task = tSnap.docs[0].data();

      applications.push({ ...a, campaign, task });
    }
    res.json({ applications });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/creators/tasks/:id/submit - Submit proof
router.post('/tasks/:id/submit', authenticateToken, requireRole('creator'), async (req, res) => {
  try {
    const { proofUrl, notes } = req.body;
    const taskRef = doc(db, 'tasks', req.params.id);
    const tSnap = await getDoc(taskRef);
    if (!tSnap.exists()) return res.status(404).json({ error: 'Task not found' });

    await updateDoc(taskRef, {
      proofUrl,
      notes,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
    
    const updatedTask = (await getDoc(taskRef)).data();
    res.json({ task: updatedTask });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
