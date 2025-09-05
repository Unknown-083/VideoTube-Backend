import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})
// import express from "express";
import { dbConnect } from "./db/index.js";
import { app } from "./app.js";

// const app = express();

// ;(async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI,"/",DB_NAME);
//         app.on("error", (error) => {
//             console.log("Error: ", error);
            
//         })

//         app.listen(() => {
//             console.log("App is listening on ", process.env.PORT);
            
//         })
        
//     } catch (error) {
//         console.log("DB error ", error);
        
//     }
// })()

dbConnect()
.then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log("App is listening at ", port);
        
    })
})
.catch((err) => {
    console.log("Mongo DB Connection Failed :: ", err);
    
})