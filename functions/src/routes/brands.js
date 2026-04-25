const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { collection, getDocs, doc, setDoc, updateDoc, getDoc, query, where, deleteDoc } = require('firebase/firestore');
const { authenticateToken, requireRole, requireApproved } = require('../middleware/auth');

const fetchOneByUserId = async (colName, userId) => {
  const q = query(collection(db, colName), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
};

// GET /api/brands/profile
router.get('/profile', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const brand = await fetchOneByUserId('brands', req.user.id);
    if (!brand) return res.status(404).json({ error: 'Brand profile not found' });
    res.json({ brand });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/brands/profile
router.put('/profile', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const { companyName, valuation } = req.body;
    const brand = await fetchOneByUserId('brands', req.user.id);
    if (!brand) return res.status(404).json({ error: 'Brand profile not found' });
    
    await updateDoc(doc(db, 'brands', brand.id), {
      ...(companyName && { companyName }),
      ...(valuation && { valuation })
    });
    
    const updated = (await getDoc(doc(db, 'brands', brand.id))).data();
    res.json({ brand: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/brands/campaigns - Create campaign
router.post('/campaigns', authenticateToken, requireRole('brand'), requireApproved, async (req, res) => {
  try {
    const { title, nicheRequired, paymentMin, paymentMax, requirements } = req.body;
    if (!title || !requirements) {
      return res.status(400).json({ error: 'Title and requirements are required' });
    }

    const brand = await fetchOneByUserId('brands', req.user.id);
    if (!brand) return res.status(400).json({ error: 'Brand profile not found' });

    const campaignId = uuidv4();
    const campaign = {
      id: campaignId,
      brandId: brand.id,
      title,
      nicheRequired: nicheRequired || [],
      paymentMin: paymentMin || 0,
      paymentMax: paymentMax || 0,
      requirements,
      applicants: [],
      selectedCreators: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'campaigns', campaignId), campaign);
    res.status(201).json({ campaign });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/brands/campaigns - Get brand's campaigns
router.get('/campaigns', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const brand = await fetchOneByUserId('brands', req.user.id);
    if (!brand) return res.json({ campaigns: [] });

    const q = query(collection(db, 'campaigns'), where('brandId', '==', brand.id));
    const snap = await getDocs(q);
    const campaigns = snap.docs.map(d => {
      const c = d.data();
      return {
        ...c,
        applicantCount: (c.applicants || []).length,
        selectedCount: (c.selectedCreators || []).length,
      };
    });
    res.json({ campaigns });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/brands/campaigns/:id
router.delete('/campaigns/:id', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const brand = await fetchOneByUserId('brands', req.user.id);
    const cSnap = await getDoc(doc(db, 'campaigns', req.params.id));
    if (!cSnap.exists() || cSnap.data().brandId !== brand?.id) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    await deleteDoc(doc(db, 'campaigns', req.params.id));
    res.json({ message: 'Campaign deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/brands/campaigns/:id/applicants
router.get('/campaigns/:id/applicants', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const brand = await fetchOneByUserId('brands', req.user.id);
    const cSnap = await getDoc(doc(db, 'campaigns', req.params.id));
    if (!cSnap.exists() || cSnap.data().brandId !== brand?.id) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const q = query(collection(db, 'applications'), where('campaignId', '==', req.params.id));
    const snap = await getDocs(q);
    
    const applicants = [];
    for (const d of snap.docs) {
      const a = d.data();
      const creatorSnap = await getDoc(doc(db, 'creators', a.creatorId));
      if (creatorSnap.exists()) {
        const creator = creatorSnap.data();
        const userSnap = await getDoc(doc(db, 'users', creator.userId));
        const user = userSnap.exists() ? userSnap.data() : null;
        applicants.push({
          applicationId: a.id,
          status: a.status,
          appliedAt: a.appliedAt,
          creator: { ...creator, name: user?.name, email: user?.email },
        });
      }
    }
    res.json({ applicants });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/brands/applications/:id/status - Accept or reject applicant
router.patch('/applications/:id/status', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const { status, taskDetails, contactEmail, upiId } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const appRef = doc(db, 'applications', req.params.id);
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) return res.status(404).json({ error: 'Application not found' });
    const application = appSnap.data();

    await updateDoc(appRef, { status, updatedAt: new Date().toISOString() });
    const updatedApp = (await getDoc(appRef)).data();

    if (status === 'accepted') {
      const campRef = doc(db, 'campaigns', application.campaignId);
      const campSnap = await getDoc(campRef);
      if (campSnap.exists()) {
        const campaign = campSnap.data();
        const selected = campaign.selectedCreators || [];
        if (!selected.includes(application.creatorId)) {
          await updateDoc(campRef, { selectedCreators: [...selected, application.creatorId] });
        }
      }

      // Check existing task
      const tQ = query(collection(db, 'tasks'), where('applicationId', '==', application.id));
      const tSnap = await getDocs(tQ);
      if (tSnap.empty) {
        const taskId = uuidv4();
        await setDoc(doc(db, 'tasks', taskId), {
          id: taskId,
          applicationId: application.id,
          campaignId: application.campaignId,
          creatorId: application.creatorId,
          taskDetails: taskDetails || '',
          contactEmail: contactEmail || '',
          upiId: upiId || '',
          status: 'assigned',
          proofUrl: null,
          notes: null,
          submittedAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
        });
      }
    }

    res.json({ application: updatedApp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/brands/tasks/:id/complete
router.patch('/tasks/:id/complete', authenticateToken, requireRole('brand'), async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const tSnap = await getDoc(taskRef);
    if (!tSnap.exists()) return res.status(404).json({ error: 'Task not found' });
    
    await updateDoc(taskRef, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    const updatedTask = (await getDoc(taskRef)).data();
    res.json({ task: updatedTask });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
