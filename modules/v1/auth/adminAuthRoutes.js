const {
     listUsers, viewUser, createUser
} = require( "./authController");

const adminAuthRoutes =require( "express").Router();

adminAuthRoutes.post("/create-employee", createUser);
adminAuthRoutes.get("/view-employee", viewUser);
// adminAuthRoutes.put("/update-employee", updateUser);
// adminAuthRoutes.delete("delete-employee", deleteUser);
adminAuthRoutes.get("/employee-list", listUsers);

module.exports = adminAuthRoutes;