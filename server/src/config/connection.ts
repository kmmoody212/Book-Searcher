import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/googlebooks")
  .then(() => {
    // A check to make sure on my end whether connected to mongodb or not
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

export default mongoose.connection;
