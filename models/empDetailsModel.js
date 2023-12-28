const mongoose = require("mongoose")

const employeeSchema = mongoose.Schema({
    EmployeeId:{
        type:Number,
        required:true
    },
    FirstName:{
        type:String
    },
    LastName:{
        type:String
    },
    role:{
        type:String,
    },
    email:{
        type:String,
    },
    balance:{
        type:Number,
        default:0
    },
    wallet:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

const EmpModel = mongoose.model('empdetails',employeeSchema)

module.exports = {EmpModel};