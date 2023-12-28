const mongoose = require("mongoose");
const dailyMenuSchema = mongoose.Schema({
    sub_menu_items: [{
        type: mongoose.Schema.ObjectId,
        ref: "subMenu",
    }],
    quantity:{
        type:Number,
        default:1
    },
    type:{
        type: mongoose.Schema.ObjectId,
        ref:"menuCategory",
    },
    date: {
        required: true,
        type: String,
        default: () => {
            const today = new Date();
            const formattedDate = today.toLocaleDateString().replaceAll("/","-");
            // const today = new Date();
            // const year = today.getFullYear();
            // const month = (today.getMonth() + 1).toString().padStart(2, '0');
            // const day = today.getDate().toString().padStart(2, '0');
            // const formattedDate = `${year}-${month}-${day}`;
            return formattedDate;
        },
    },
    time:{
        required: true,
        type: String,
        default: () => {
            const today = new Date();
            const options = { timeZone: 'Asia/Kolkata', hour12: false };
            const timeInIndia = today.toLocaleTimeString('en-IN', options);
            return timeInIndia;
        },
    }
},{
    timestamps:true
}
);
const dailyMenuModel = mongoose.model('dailyMenu', dailyMenuSchema);
module.exports = { dailyMenuModel };