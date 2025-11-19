import Review from "../models/review.model.js";

export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { gameId } = req.params;

  try {
    const newReview = new Review({
      gameId,
      userId: req.user._id,
      rating,
      comment,
    });

    await newReview.save();
    res.status(201).json({ message: "Review added successfully!", review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
}

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ userId })
      .populate({ path: 'gameId' })
      .sort({ createdAt: -1 });

    // Map to a lean structure
    const data = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      game: r.gameId ? {
        _id: r.gameId._id,
        title: r.gameId.title,
        coverUrl: r.gameId.coverUrl,
        bannerUrl: r.gameId.bannerUrl,
        genres: r.gameId.genres,
        description: r.gameId.description,
      } : null,
    }));

    res.json(data);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
}

export const getUserAverageRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ userId });

    if (!reviews.length) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
    const averageRating = Number((totalRating / totalReviews).toFixed(2));

    res.json({ averageRating, totalReviews });
  } catch (err) {
    console.error("Error fetching user average rating:", err);
    res.status(500).json({ error: "Failed to fetch user average rating" });
  }
}

export const getAllReviews = async(req,res)=>{
    try{
        const {gameId} = req.params;
        const reviews = await Review.find({gameId}).populate("userId").sort({createdAt:-1});
        res.status(200).json(reviews)
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to fetch reviews"})
    }
}

export const deleteReview = async(req,res)=>{
    try{
        const {reviewId} = req.params;
        const review = await Review.findById(reviewId);
        if(!review){
            return res.status(404).json({error:"Review not found"})
        }
        if(review.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"Unauthorized"})
        }
        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({message:"Review deleted successfully!"})
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to delete review"})
    }
}


export const getRatingSummary = async (req, res) => {
  try {
    const { gameId } = req.params;
    const reviews = await Review.find({ gameId });

    if (!reviews.length) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    res.json({ averageRating, totalReviews });
  } catch (err) {
    console.error("Error fetching rating summary:", err);
    res.status(500).json({ error: "Failed to fetch rating summary" });
  }
}

export const toggleReviewReaction = async (req, res) => {
  try {
    const { reviewId, action } = req.params; // action = 'like' or 'dislike'
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const hasLiked = review.likes.includes(userId);
    const hasDisliked = review.dislikes.includes(userId);

    if (action === "like") {
      if (hasLiked) {
        // If already liked, remove like (toggle off)
        review.likes.pull(userId);
      } else {
        // Add like
        review.likes.push(userId);
        // If they had disliked before, remove it
        if (hasDisliked) review.dislikes.pull(userId);
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        // If already disliked, remove dislike (toggle off)
        review.dislikes.pull(userId);
      } else {
        // Add dislike
        review.dislikes.push(userId);
        // Remove like if exists
        if (hasLiked) review.likes.pull(userId);
      }
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await review.save();

    res.json({
      message: `Review ${action} updated`,
      likesCount: review.likes.length,
      dislikesCount: review.dislikes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review reaction" });
  }
};
