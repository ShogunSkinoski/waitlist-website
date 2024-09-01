const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../join_close_beta/build')));

const uri = process.env.MONGODB_URI;
console.log('Connecting to MongoDB:', uri);
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('betaSignups');
    await db.collection('signups').createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

connectToDatabase();

app.post('/api/submit-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const signups = db.collection('signups');
    
    await signups.updateOne(
      { email },
      { $setOnInsert: { email, signupDate: new Date() } },
      { upsert: true }
    );

    const totalSignups = await signups.countDocuments();

    res.status(200).json({ message: 'Email submitted successfully', totalSignups });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      const totalSignups = await db.collection('signups').countDocuments();
      return res.status(200).json({ message: 'Email already registered', totalSignups });
    }
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Failed to submit email' });
  }
});

app.get('/api/total-signups', async (req, res) => {
  try {
    const totalSignups = await db.collection('signups').countDocuments();
    res.status(200).json({ totalSignups });
  } catch (error) {
    console.error('Error fetching total signups:', error);
    res.status(500).json({ error: 'Failed to fetch total signups' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../join_close_beta/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});