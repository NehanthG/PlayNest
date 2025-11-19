import express from "express";


import { protectRoute } from "../middleware/auth.middleware.js";
import { recommendedGames, recentGames, topRatedGames, trendingGames } from "../controllers/discovery.controller.js";
const router = express.Router();

/* -------------------- 🆕 Recently Uploaded -------------------- */
router.get("/recent", recentGames);

/* -------------------- ⭐ Top Rated -------------------- */
router.get("/top-rated", topRatedGames);

/* -------------------- 💥 Trending Games -------------------- */
router.get("/trending", trendingGames);

/* -------------------- 🎮 Recommended for You -------------------- */
router.get("/recommended", protectRoute, recommendedGames);

export default router;
