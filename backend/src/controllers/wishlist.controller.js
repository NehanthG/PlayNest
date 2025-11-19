import User from "../models/user.model.js";
import GameUpload from "../models/gameupload.model.js";

export const toggleWishlist = async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const isWishlisted = user.wishlist.includes(gameId);

    if (isWishlisted) {
      user.wishlist.pull(gameId);
    } else {
      user.wishlist.push(gameId);
    }

    await user.save();
    res.json({
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
}

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
}

export const getTopWishlisted = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const aggregated = await User.aggregate([
      { $unwind: "$wishlist" },
      { $group: { _id: "$wishlist", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const ids = aggregated.map((a) => a._id);
    const games = await GameUpload.find({ _id: { $in: ids } });
    const map = new Map(games.map((g) => [String(g._id), g]));

    const result = aggregated
      .map((a) => ({ count: a.count, game: map.get(String(a._id)) }))
      .filter((x) => !!x.game);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top wishlisted" });
  }
}