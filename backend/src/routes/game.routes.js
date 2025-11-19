import express from "express"
import multer from "multer"
import { gameUpload, getGames, getGameById, getMyGamesWithSummary, searchGames } from "../controllers/gameupload.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() })

router.post(
  '/gameUpload',
  protectRoute,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  gameUpload
);

router.get('/games', getGames);
router.get('/games/my', protectRoute, getMyGamesWithSummary);
router.get('/games/search', searchGames);
router.get('/games/:id', getGameById);


export default router