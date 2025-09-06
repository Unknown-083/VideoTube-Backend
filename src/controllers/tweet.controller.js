import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.trim() === "") throw new ApiError(400, "Content is required!");

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) throw new ApiError(500, "Error while creating tweet!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet post created successfully!", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: { url: 1 },
            },
          },
        ],
      },
    },
    {
        $unwind: "$owner"
    }
  ]);

  if (!userTweets) throw new ApiError(500, "Error while fetching user tweets!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User Tweets fetched successfully!", userTweets)
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!(tweetId && isValidObjectId(tweetId)))
    throw new ApiError(400, "Valid tweetId is required!");
  if (content.trim() === "") throw new ApiError(400, "Content is required!");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (!updatedTweet) throw new ApiError(500, "Error while updating tweet!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully!", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!(tweetId && isValidObjectId(tweetId)))
    throw new ApiError(400, "Valid tweetId is required!");

  const response = await Tweet.findByIdAndDelete(tweetId, { new: true });

  if (!response) throw new ApiError(500, "Error while deleting tweet!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully!", {}));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
