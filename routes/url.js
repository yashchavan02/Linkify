const { Router } = require("express"); 
const { generateShortUrl } = require("../controllers/url.js");

const UrlRouter = Router();

UrlRouter.post("/shorten", generateShortUrl);

module.exports = UrlRouter;