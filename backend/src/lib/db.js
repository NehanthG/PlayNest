import mongoose from "mongoose"

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://mongo-service:27017/playnest")
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error);
        
    }
}