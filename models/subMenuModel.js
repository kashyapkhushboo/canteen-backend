const mongoose = require("mongoose")
const subMenuSchema = mongoose.Schema({
    menu_id:{
        type: mongoose.Schema.ObjectId,
        ref:"menuCategory",
        },
    item_name:{
        required: true,
        type:String
    },
    price:{
        required: true,
        type:Number
    },
    quantity:{
type:Number,
default:1
    },
    // count:{
    //     type:Number,
    //     default:0
    // }
},{
    timestamps:true
})
const subMenuModel = mongoose.model('subMenu',subMenuSchema)
module.exports = {subMenuModel}