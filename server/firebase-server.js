const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBtK4DqP3HhCe_2z2SB1Yc7G5gSQng36ms",
  authDomain: "todo-list-e7788.firebaseapp.com",
  projectId: "todo-list-e7788",
  storageBucket: "todo-list-e7788.firebasestorage.app",
  messagingSenderId: "82740211196",
  appId: "1:82740211196:web:7297f087941f3fdb5f5679",
  measurementId: "G-NMEYHYHE17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

module.exports = { db, app };
