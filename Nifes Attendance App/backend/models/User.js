import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  surname: { type: String, required: true },
  firstname: { type: String, required: true },
  othername: { type: String },
  phone: { type: String, required: true },
  dob: { type: String, required: true },
  family: { type: String, required: true },
  unit: { type: String, required: true },
  faculty: { type: String, required: true },
  dept: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pswd: { type: String, required: true },
  theme: { type: String, default: "system" },
  attended: [{ type: String }],
  consistency: { type: Number, default: 0 },
  badge: { type: String, default: "member" },
  profileImgUrl: { type: String, default: "" },
  isLoggedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
