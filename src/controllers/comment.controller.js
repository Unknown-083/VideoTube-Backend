import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) throw new ApiError(400, "Video Id is missing");

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner"
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        hasLiked: {
          $in: [req.user?._id || null, "$likes.likedBy"],
        }
      },
    },
    {
      $skip: (parseInt(page) - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
    {
      $project: {
        _id: 1,
        content: 1,
        video: 1,
        owner: {
          username: 1,
          avatar: { url: 1 },
        },
        createdAt: 1,
        updatedAt: 1,
        likesCount: 1,
        hasLiked: 1,
      },
    },
  ]);

  if (!comments)
    throw new ApiError(500, "Error while fetching Video Comments!");

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(200, "Fetched comments successfully!", {
      comments,
      totalComments,
      page,
      TotalPages: parseInt(totalComments / limit),
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "Video Id is missing");
  if (content.trim() === "") throw new ApiError(400, "Comment is empty!");

  //:TODO
  const addedComment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!addedComment) throw new ApiError(500, "Error while adding the comment!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Added comment successfully!", addedComment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!(commentId && content))
    throw new ApiError(400, "Comment Id or content is missing");

  const oldComment = await Comment.findById(commentId);
  if (!oldComment)
    throw new ApiError(400, "Comment doesn't exists with this ID");

  if (!oldComment.owner.equals(req.user._id))
    throw new ApiError(402, "You are not authorized to update this comment");

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (!newComment) throw new ApiError(500, "Error while updating the comment!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Updated the comment successfully!", newComment)
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(400, "Invalid Comment Id");
  if (!comment.owner.equals(req.user._id))
    throw new ApiError(400, "You are not authorized to delete this comment");

  const response = await Comment.findByIdAndDelete(commentId, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", {}));
});

export { getVideoComments, addComment, updateComment, deleteComment };
