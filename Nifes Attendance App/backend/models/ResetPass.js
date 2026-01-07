import mongoose from "mongoose";

const resetPassSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },  
  code: { type: String, unique: true, required: true },
});

const ResetPass = mongoose.model("ResetPass", resetPassSchema);

export default ResetPass;
