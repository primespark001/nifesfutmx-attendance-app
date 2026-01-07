import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  admin_id: { type: String, unique: true, default: 'n7I2f9E4s0F5u1T8m3X0A6d1M9i3N7', required: true },  
  role: { type: String, required: true },  
  isLoggedIn: { type: Boolean, default: false },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
