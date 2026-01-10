import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  img: { type: String, required: true },
  descrip: { type: String, required: true },
  start: { type: Date, required: true },
  stop: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  attendance: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
