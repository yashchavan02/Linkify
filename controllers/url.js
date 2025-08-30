import { nanoid } from "nanoid";
import UserModel from "../models/url.js";
import isValidUrl from "../service/validate.js";

export async function generateShortUrl(req, res) {
  try {
    const { originalUrl } = req.body;
    if(!originalUrl) return res.status(400).send({ message : "Long url is required" });
    if(!isValidUrl(originalUrl)) return res.status(400).send({ message : "The url is not valid" });
    const shortUrl = nanoid(10);

    const dataToSave = new UserModel({originalUrl, shortUrl});
    await dataToSave.save();

    res.status(201).send({ shortUrl : `${req.protocol}://${req.get('host')}/${shortUrl}` });
  } catch(error) {
    return res.status(500).send({ message : `their is some error : ${error.message}`});
  }
};

export async function redirectToUrl(req, res){
  try {
    const { shortUrl } = req.params;
    if(!shortUrl) return res.status(400).send( {message : "Short Url is required"} );
    const url = await UserModel.findOne({shortUrl : shortUrl});
    if(url){
      return res.redirect(url.originalUrl)
    } else {
      return res.status(404).send({ message : "No Url Found"});
    }
  } catch(error) {
    return res.status(500).send({ message : `their is some error : ${error.message}`});
  }
};