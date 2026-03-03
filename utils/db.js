import mongoose from "mongoose";

const connectDB = async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Ecommerce"
    });
    console.log("mongodb connected");
  }catch(error){
    console.log("mongo connection error", error);
  }
}

export default connectDB;