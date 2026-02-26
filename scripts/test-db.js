const mongoose = require('mongoose');

// MONGODB_URI should be loaded via --env-file
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined. Run with: node --env-file=.env.local scripts/test-db.js');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });
