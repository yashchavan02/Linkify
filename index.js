const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));


app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://linkify-yashchavan02.vercel.app'] : true,
  credentials: true
}));


app.use(compression());


if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Hello from Linkify!',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong, please check!' 
    : err.message;
    
  res.status(500).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString(),
    path: req.url
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

async function startServer() {
  try {
    const connectToDB = require('./configuration/db.js');
    await connectToDB();
    console.log('Database connected successfully');

    try {
      const UrlRouter = require('./routes/url.js');
      const { redirectToUrl } = require('./controllers/url.js');
      
      app.use('/api/url', UrlRouter);
      app.get('/:shortUrl', redirectToUrl);
    } catch (error) {
      console.error('API routes failed to load:', error.message);
      
      app.post('/api/url/shorten', (req, res) => {
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Database connection required for URL shortening'
        });
      });
      
      app.get('/:shortUrl', (req, res) => {
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Database connection required for URL redirection'
        });
      });
    }

    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to connect to database, server not started:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }

    console.error('Vercel environment: Continuing without database connection');
  }
}

startServer();

module.exports = app;