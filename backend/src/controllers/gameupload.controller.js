import GameUpload from "../models/gameupload.model.js"
import cloudinary from "../lib/cloudinary.js"
import mongoose from "mongoose"
export const gameUpload = async (req, res) => {
  try {
    const { title, description, video, website, download } = req.body
    let { tags, genres } = req.body

    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags) } catch { tags = tags.split(',').map((t) => t.trim()).filter(Boolean) }
    }
    if (typeof genres === 'string') {
      try { genres = JSON.parse(genres) } catch { genres = genres.split(',').map((g) => g.trim()).filter(Boolean) }
    }

    const coverFile = req.files?.cover?.[0]
    const bannerFile = req.files?.banner?.[0]

    if (!title || !description || !video || !download || !coverFile || !bannerFile) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existing = await GameUpload.findOne({ $or: [{ title }, { video }] })
    if (existing) {
      return res.status(400).json({ message: "Game already exists" })
    }

    const uploadFromBuffer = (buffer, folder, publicId) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image', public_id: publicId },
          (err, result) => {
            if (err) return reject(err)
            resolve(result)
          }
        )
        stream.end(buffer)
      })

    const baseId = `${Date.now()}_${title.replace(/\s+/g, '_').toLowerCase()}`

    const [coverUpload, bannerUpload] = await Promise.all([
      uploadFromBuffer(coverFile.buffer, 'games/covers', `${baseId}_cover`),
      uploadFromBuffer(bannerFile.buffer, 'games/banners', `${baseId}_banner`),
    ])

    const game = await GameUpload.create({
      title,
      description,
      video,
      website: website || '',
      download,
      tags: Array.isArray(tags) ? tags : [],
      genres: Array.isArray(genres) ? genres : [],
      coverName: coverFile.originalname || '',
      coverUrl: coverUpload.secure_url,
      coverPublicId: coverUpload.public_id,
      bannerName: bannerFile.originalname || '',
      bannerUrl: bannerUpload.secure_url,
      bannerPublicId: bannerUpload.public_id,
      uploader: req.user?._id || null,
    })

    return res.status(201).json({ message: 'Game uploaded successfully', game })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getGames = async (req, res) => {
  try {
    const games = await GameUpload.find().sort({ createdAt: -1 })
    return res.status(200).json(games)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getGameById = async (req, res) => {
  try {
    const { id } = req.params
    const game = await GameUpload.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!game) return res.status(404).json({ message: 'Game not found' })
    
    return res.status(200).json(game)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error' })
  }
}


export const getMyGamesWithSummary = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await GameUpload.aggregate([
      {
        $match: {
          uploader: new mongoose.Types.ObjectId(userId),
        },
      },
      // Join reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "gameId",
          as: "reviews",
        },
      },
      // Join wishlists
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "gameId",
          as: "wishlists",
        },
      },
      // Add computed fields
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $avg: "$reviews.rating" },
              0,
            ],
          },
          totalReviews: { $size: "$reviews" },
          wishlistCount: { $size: "$wishlists" },
        },
      },
      // Only return relevant fields
      {
        $project: {
          _id: 1,
          title: 1,
          coverUrl: 1,
          coverName: 1,
          genres: 1,
          views: 1,
          description: 1,
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          wishlistCount: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching game summary:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const searchGames = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) return res.json([]);

    // Simple regex search across multiple fields
    const games = await GameUpload.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { genres: { $regex: query, $options: 'i' } },
      ],
    }).limit(20);

    res.json(games);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};