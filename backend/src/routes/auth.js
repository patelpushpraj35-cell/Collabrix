const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../firebase');
const { collection, getDocs, query, where, setDoc, doc } = require('firebase/firestore');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, mobile, password, companyName, valuation } = req.body;

    if (!['creator', 'brand'].includes(role)) {
      return res.status(400).json({ error: 'Role must be creator or brand' });
    }
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = {
      id: userId,
      role,
      name,
      email,
      mobile,
      password: hashed,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(usersRef, userId), newUser);

    if (role === 'brand') {
      const brandId = uuidv4();
      await setDoc(doc(db, 'brands', brandId), {
        id: brandId,
        userId,
        companyName: companyName || name,
        valuation: valuation || 0,
        createdAt: new Date().toISOString(),
      });
    } else if (role === 'creator') {
      const { niche, platforms, followers, avgViews, avgLikes, contentType, channelUrl } = req.body;
      const creatorId = uuidv4();
      await setDoc(doc(db, 'creators', creatorId), {
        id: creatorId,
        userId,
        niche: niche || [],
        platforms: platforms || [],
        followers: Number(followers) || 0,
        avgViews: Number(avgViews) || 0,
        avgLikes: Number(avgLikes) || 0,
        contentType: contentType || 'both',
        channelUrl: channelUrl || '',
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      userId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = querySnapshot.docs[0].data();

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
const { authenticateToken } = require('../middleware/auth');
router.get('/me', authenticateToken, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

module.exports = router;
