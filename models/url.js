import { model, Schema } from "mongoose";

const UrlSchema = new Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});

const UserModel = model('url', UrlSchema);

export default UserModel;