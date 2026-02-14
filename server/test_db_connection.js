const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection Failed:', err.message);
    if (err.message.includes('bad auth')) {
        console.error('👉 Cause: Incorrect Username or Password.');
    } else if (err.cause && err.cause.code === 'ENOTFOUND') {
        console.error('👉 Cause: Hostname not found. Check the URI.');
    } else {
        console.error('👉 Cause: Likely IP Whitelist issue or Network Firewall.');
    }
    process.exit(1);
  });
