import GameUpload from "../models/gameupload.model.js";
import Review from "../models/review.model.js";

export const recentGames =async (req, res) => {
  try {
    const games = await GameUpload.find().sort({ createdAt: -1 }).limit(6);
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent games" });
  }
}

export const topRatedGames =async (req, res) => {
  try {
    const games = await Review.aggregate([
      {
        $group: {
          _id: "$gameId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, totalReviews: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "gameuploads",
          localField: "_id",
          foreignField: "_id",
          as: "game",
        },
      },
      { $unwind: "$game" },
      {
        $project: {
          _id: 1,
          avgRating: 1,
          totalReviews: 1,
          title: "$game.title",
          coverUrl: "$game.coverUrl",
          coverName: "$game.coverName",
          genres: "$game.genres",
          description: "$game.description",
        },
      },
    ]);

    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top rated games" });
  }
}

export const trendingGames= async (req, res) => {
  try {
    // Games with the most reviews or wishlists in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trending = await Review.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: "$gameId", recentReviews: { $sum: 1 } } },
      { $sort: { recentReviews: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "gameuploads",
          localField: "_id",
          foreignField: "_id",
          as: "game",
        },
      },
      { $unwind: "$game" },
      {
        $project: {
          _id: 1,
          recentReviews: 1,
          title: "$game.title",
          coverUrl: "$game.coverUrl",
          coverName: "$game.coverName",
          description: "$game.description",
          genres: "$game.genres",
        },
      },
    ]);

    res.json(trending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trending games" });
  }
}

export const recommendedGames=async (req, res) => {
  try {
    const user = req.user;

    // Fetch the user's wishlisted and reviewed games
    const reviewedGames = await Review.find({ userId: user._id }).populate("gameId");
    const wishlistedGames = user.wishlist || [];

    // Collect genres from both sets
    const genres = new Set();
    reviewedGames.forEach(r => r.gameId.genres.forEach(g => genres.add(g)));
    wishlistedGames.forEach(gameId => {
      if (gameId.genres) gameId.genres.forEach(g => genres.add(g));
    });

    if (!genres.size) {
      const fallback = await GameUpload.find().sort({ createdAt: -1 }).limit(6);
      return res.json(fallback);
    }

    const recommended = await GameUpload.find({ genres: { $in: Array.from(genres) } })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(recommended);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recommended games" });
  }
}