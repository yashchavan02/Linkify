const { model, Schema } = require("mongoose");

const UrlSchema = new Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});

const UserModel = model('url', UrlSchema);

module.exports = UserModel;