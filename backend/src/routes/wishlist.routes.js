import express from "express";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import GameUpload from "../models/gameupload.model.js";
import { toggleWishlist, getWishlist, getTopWishlisted } from "../controllers/wishlist.controller.js";

const router = express.Router();


router.post("/:gameId/toggle", protectRoute, toggleWishlist);

router.get("/",protectRoute, getWishlist);
router.get("/top", getTopWishlisted);

export default router;
