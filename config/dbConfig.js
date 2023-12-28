const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGO_URL;

// mongoose.connect(url).then(console.log("Database connected successfully!")).catch((err)=>console.error(err.message));
const dataBaseConnect=async()=>{
    try {
        const database = await mongoose.connect(url)
        console.log("database connected successfully");
        
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={dataBaseConnect}