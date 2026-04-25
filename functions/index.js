const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/admin', require('./src/routes/admin'));
app.use('/creators', require('./src/routes/creators'));
app.use('/brands', require('./src/routes/brands'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setGlobalOptions({ region: "us-central1" });

exports.api = onRequest({ cors: true, maxInstances: 10 }, app);
