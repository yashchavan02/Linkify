import express from 'express';
import "dotenv/config";
import connectToDB from './configuration/db.js'
import UrlRouter from './routes/url.js';
import { redirectToUrl } from './controllers/url.js';

const app = express();
const PORT = process.env.PORT || 5000;

// connect to db which is in configuration folder
connectToDB();

// use to parse json
app.use(express.json()); 

// serve static frontend
app.use(express.static('public'));

// api routes
app.use("/api/url", UrlRouter);

// short url redirect route
app.get('/:shortUrl', redirectToUrl);

app.listen(PORT, () => console.log(`server is start at port ${PORT}`))