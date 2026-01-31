const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDB() {
  try {
    const mongoURL = process.env.MONGO_ATLAS || 'mongodb://localhost:27017/YCurlShortner';
    if (!mongoURL) {
      throw new Error('MongoDB connection string is not set');
    }

    if (!mongoURL.startsWith('mongodb://') && !mongoURL.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB connection string format');
    }

    console.log('Attempting to connect to MongoDB');

    const mongoOptions = {
      dbName: 'YCurlShortner',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true,
    };

    let retries = 3;
    let lastError;
    while (retries > 0) {
      try {
        await mongoose.connect(mongoURL, mongoOptions);
        console.log('Connected to MongoDB');
        console.log(
          'Connection state:',
          mongoose.connection.readyState === 1 ? 'CONNECTED' : 'NOT CONNECTED'
        );
        break;
      } catch (err) {
        retries -= 1;
        lastError = err;
        console.error(`Connection attempt failed, ${retries} retries left:`, err.message);
        if (retries === 0) throw lastError;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    let isReconnecting = false;
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      if (mongoose.connection.readyState !== 1 && !isReconnecting) {
        isReconnecting = true;
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(mongoURL, mongoOptions).catch(err => {
          console.error('Reconnection attempt failed:', err.message);
          isReconnecting = false;
        }).then(() => {
          isReconnecting = false;
        });
      }
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection event: CONNECTED');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

connectToDB().catch(err => {
  console.error('Initial DB connection failed:', err.message);
});

module.exports = connectToDB;