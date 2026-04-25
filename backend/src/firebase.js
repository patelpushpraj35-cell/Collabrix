const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD7u7yEa9U-Ifs8Mh35L9j9OVe467DFNS4",
  authDomain: "collabrix-be036.firebaseapp.com",
  projectId: "collabrix-be036",
  storageBucket: "collabrix-be036.firebasestorage.app",
  messagingSenderId: "384148028887",
  appId: "1:384148028887:web:2ca124d3ab0ebe39ed9f92",
  measurementId: "G-ZGDLTQ9N6D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { app, db };
