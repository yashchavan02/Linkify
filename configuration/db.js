import mongoose from "mongoose";
import "dotenv/config";

async function  connectToDB() {
  const mongoURL = process.env.MONGO_ATLAS || "mongodb://localhost:27017/YCurlShortner";
  await mongoose.connect(mongoURL);
  console.log("connect to the DB");
}

export default connectToDB;