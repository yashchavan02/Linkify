import { Router } from "express"; 
import { generateShortUrl } from "../controllers/url.js";

const UrlRouter = Router();

UrlRouter.post("/shorten", generateShortUrl);

export default UrlRouter;