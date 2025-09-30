const UserModel = require('../models/url.js');
const isValidUrl = require('../service/validate.js');

async function generateShortUrl(req, res) {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ error: 'Bad Request', message: 'Original URL is required' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Bad Request', message: 'The URL is not valid' });
    }

    const existingUrl = await UserModel.findOne({ originalUrl });
    if (existingUrl) {
      await UserModel.updateOne({ originalUrl }, { createdAt: new Date() });
      return res.status(200).json({
        shortUrl: `${req.protocol}://${req.get('host')}/${existingUrl.shortUrl}`,
        message: 'URL already exists, returning existing short URL',
      });
    }

    const { nanoid } = await import('nanoid');
    const shortUrl = nanoid(5);

    const dataToSave = new UserModel({ originalUrl, shortUrl });
    await dataToSave.save();

    const protocol = 'https';
    return res.status(201).json({
      shortUrl: `${protocol}://${req.get('host')}/${shortUrl}`,
      message: 'Short URL created successfully',
    });
  } catch (error) {
    console.error('Error in generateShortUrl:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: `There is some error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
}

async function redirectToUrl(req, res) {
  try {
    const { shortUrl } = req.params;
    if (!shortUrl) {
      return res.status(400).json({ error: 'Bad Request', message: 'Short URL is required' });
    }

    const url = await UserModel.findOne({ shortUrl });
    if (url) {
      return res.redirect(301, url.originalUrl);
    } else {
      return res.status(404).json({ error: 'Not Found', message: 'No URL found for the provided short URL' });
    }
  } catch (error) {
    console.error('Error in redirectToUrl:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: `There is some error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { generateShortUrl, redirectToUrl };