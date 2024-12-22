const Review = require("../models/Review");
const {
  isFloatBetween0And10,
  max500Character,
} = require("../validations/index");

const addReviewAndRating = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const { rating, reviewText } = req.body;

    //if rating is not a float between 0 and 10
    if (!isFloatBetween0And10(rating)) {
      return res
        .status(400)
        .json({ error: "rating must be a float between 0 and 10" });
    }

    //if max numbers of characters are more then 500
    if (!max500Character(reviewText)) {
      return res
        .status(400)
        .json({ error: "reviewText can have maximum of 500 characters." });
    }

    const review = await Review.create({ movieId, rating, reviewText });

    res.status(201).json({ message: "Review added successfully.", review });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to add review and rating." });
  }
};

const getTopFiveRatedReviews = async () => {
  try {
    const topRatedReviews = await Review.findAll({
      order: [["rating", "DESC"]],
      limit: 5,
    });

    return topRatedReviews;
  } catch (error) {
    throw new Error("Failed to fetch top 5 rated review.");
  }
};

module.exports = { addReviewAndRating, getTopFiveRatedReviews };
