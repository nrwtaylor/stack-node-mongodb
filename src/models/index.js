//const mongoose = require('mongoose');
import mongoose from "mongoose";
mongoose.Promise = global.Promise;

//db.mongoose = mongoose;
import user from  "./user.model.js";
import role from "./role.model.js";
//const db = {mongoose:mongoose,user:user, model:model};
//db.role = require("./role.model");
//db.ROLES = ["user", "admin", "moderator"];

const db = {mongoose:mongoose,user:user, role:role,
ROLES: ["user", "admin", "moderator"]};


export default db;
