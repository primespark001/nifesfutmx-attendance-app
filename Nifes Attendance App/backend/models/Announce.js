import mongoose from "mongoose";

const announceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  info: { type: String, required: true },
  img: { type: String, required: true },
  descrip: { type: String, required: true },
  duration: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Announce = mongoose.model("Announce", announceSchema);

export default Announce;
