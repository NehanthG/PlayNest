import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    genres: {
      type: [String],
      default: [],
    },
    coverName: {
      type: String,
      default: "",
    },
    coverUrl: {
      type: String,
      default: "",
    },
    coverPublicId: {
      type: String,
      default: "",
    },
    bannerName: {
      type: String,
      default: "",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    bannerPublicId: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    download: {
      type: String,
      required: true,
      trim: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const GameUpload = mongoose.model("GameUpload", gameSchema);

export default GameUpload;
