require('dotenv').config();
const app = require('./app');
const { connectToDatabase } = require('./config/db');

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Backend API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

start();
