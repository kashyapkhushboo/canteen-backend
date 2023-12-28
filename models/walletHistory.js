const mongoose = require("mongoose")

const walletSchema = mongoose.Schema({
    emp_id:{
    type:Number,
    required:true
    },
    fullName:{
        type:String,
        required:true
    },
    previousBalance:{
        type:Number,
        required:true
    },
    priviousWallet:{
        type:Number,
        required:true
    },   payment:{
        type: Number,
    required: true,
  },
    updatedBalance:{
        type:Number,
        required:true
    },
    updatedWallet:{
        type:Number,
        required:true
    },
    date: {
        required: true,
        type: String,
      },
      time: {
        required: true,
        type: String,
    
      },
 
},{
    timestamps:true
}
)

const walletModel=mongoose.model("walletHistory",walletSchema)

module.exports = {walletModel}
