import mongoose from "mongoose";

const AICacheSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["suggest", "enhance"], // which route used this
      required: true,
    },
    title: { type: String },
    description: { type: String },
    result: { type: Object }, // stores AI output JSON (tags, genres, enhanced text)
  },
  { timestamps: true }
);

export default mongoose.model("AICache", AICacheSchema);
