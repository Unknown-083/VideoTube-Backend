import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const dbConnect = async() => {
    try {
        console.log(process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    
        console.log(conn.connection.host);
        
    } catch (error) {
        console.log("DB Error", error);
        process.exit(1);
    }
}

// dbConnect();