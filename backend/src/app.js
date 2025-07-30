console.log('--- Starting app.js execution ---');

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

console.log('Dependencies loaded.');

// Load environment variables
dotenv.config();
console.log('dotenv config loaded. PORT:', process.env.PORT, 'MONGO_URI:', process.env.MONGO_URI ? '****' : 'NOT SET');

// Connect to database
// IMPORTANT: Let's make this an async call and add .catch for direct error visibility
console.log('Attempting to connect to DB...');
connectDB()
  .then(() => console.log('DB Connection Attempt Resolved (should be success or handled in db.js)'))
  .catch(err => {
    console.error('ERROR: DB connection promise rejected in app.js:', err.message);
    process.exit(1); // Exit if DB connection fails here
  });

const app = express();
console.log('Express app initialized.');

// Middleware
app.use(express.json());
app.use(cors());
console.log('Middleware set up.');

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
  console.log('Root path accessed.');
});
console.log('Basic route defined.');

const PORT = process.env.PORT || 5000;
console.log(`PORT variable set to: ${PORT}`);

// Add a try-catch around app.listen just in case
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  console.log('app.listen called.');
} catch (err) {
  console.error('ERROR: Failed to call app.listen:', err.message);
  process.exit(1);
}

console.log('--- End of app.js execution flow ---');