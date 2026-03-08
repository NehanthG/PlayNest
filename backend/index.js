import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";
const app = express() ;
import { connectDB } from "./src/lib/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import gameuploadRoutes from "./src/routes/game.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import discoveryRoutes from "./src/routes/discovery.route.js";
// import messageRoutes from "./routes/message.route.js";
// import { app, server } from "./lib/socket.js";
import aiRoutes from "./src/routes/ai.routes.js";


dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
// 
app.use(express.json({ limit: "10mb" }));  // for JSON
app.use(express.urlencoded({ limit: "10mb", extended: true })); 
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Hello World!");
  });

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://play-nest-ruby.vercel.app"
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/gameUpload", gameuploadRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});