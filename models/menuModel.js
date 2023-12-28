const mongoose = require("mongoose")
const MenuSchema = mongoose.Schema({
    title:{
        required: true,
        type:String
    },
    time:{
        required:true,
        type:String
    }
},{
    timestamps:true
})
const menuModel = mongoose.model('menuCategory',MenuSchema)
module.exports = {menuModel}