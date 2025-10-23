import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const likeExists = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, "Removed video like successfully!", {}));
  }

  const likeAdded = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!likeAdded) throw new ApiError(500, "Error while adding video like!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Video like Added Successfully!", likeAdded));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!(commentId && isValidObjectId(commentId)))
    throw new ApiError(400, "Valid commentId is required!");

  const comment = await Comment.findById(commentId);

  if (!comment) throw new ApiError(400, "Comment doesn't exists with this Id");

  const likeExists = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment like removed successfully!", {}));
  }

  const likeAdded = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!likeAdded) throw new ApiError(500, "Error while adding comment like");

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment like added successfully!", likeAdded));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!(tweetId && isValidObjectId(tweetId)))
    throw new ApiError(400, "Valid tweetId is required");

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) throw new ApiError(404, "Tweet doesn't exists with this id");

  const likeExists = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet like removed successfully!", {}));
  }

  const likeAdded = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!likeAdded) throw new ApiError(500, "Error while adding tweet like");

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet like added successfully!", likeAdded));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              owner: 1,
              title: 1,
              duration: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!videos) throw new ApiError(500, "Error while fetching liked videos!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Like videos fetched successfully!", videos));
});

const getLikedComments = asyncHandler(async (req, res) => {
  const comments = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        comment: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "comment",
        foreignField: "_id",
        as: "comment",
        pipeline: [
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
                    fullname: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              content: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);
  if (!comments)
    throw new ApiError(500, "Error while fetching liked comments!");
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Liked comments fetched successfully!", comments)
    );
});

const getLikedTweets = asyncHandler(async (req, res) => {
  const tweets = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        tweet: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "tweet",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              content: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);
  if (!tweets) throw new ApiError(500, "Error while fetching liked tweets!");
  return res
    .status(200)
    .json(new ApiResponse(200, "Liked tweets fetched successfully!", tweets));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedComments,
  getLikedTweets,
};
