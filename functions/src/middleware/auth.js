const jwt = require('jsonwebtoken');
const { db } = require('../firebase');
const { doc, getDoc } = require('firebase/firestore');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userDoc = await getDoc(doc(db, 'users', decoded.id));
    if (!userDoc.exists()) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = { ...userDoc.data(), id: userDoc.id };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};

const requireApproved = (req, res, next) => {
  if (req.user.status !== 'approved') {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  next();
};

module.exports = { authenticateToken, requireRole, requireApproved };
