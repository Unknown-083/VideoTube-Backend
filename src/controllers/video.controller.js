import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdBy",
    sortType = 1,
  } = req.query;

  const videos = await Video.aggregate([
    {
      $match: { isPublished: true },
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
              fullname: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0]}
      }
    },
    {
      $sort: {
        [sortBy]: parseInt(sortType),
      },
    },
    {
      $skip: (parseInt(page)-1) * parseInt(limit)
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  if (!videos?.length)
    throw new ApiError(500, "Something went wrong while fetching videos!");

  const totalVideos = await Video.countDocuments();

  return res.status(200).json(
    new ApiResponse(200, "Fetched Videos successfully!", {
      videos,
      currentPage: parseInt(page),
      totalPages: parseInt(totalVideos / limit + 1),
      totalVideos,
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  // Ask title and description and check if not empty
  // upload the video and thumbnail on cloudinary and get the url to store
  // publish on db and return the video data
  const { title, description } = req.body;

  if (
    [title, description].some((item) => {
      item?.trim() === "";
    })
  )
    throw new ApiError(400, "Both fields are required!");

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video file is missing!");
  if (!thumbnailLocalPath)
    throw new ApiError(400, "Thumbnail file is missing!");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile)
    throw new ApiError(500, "Error while uploading video on cloudinary!");

  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFile.url,
      publicId: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      publicId: thumbnail.public_id,
    },
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  const uploadedVideo = await Video.findById(video?._id).select("-owner");

  if (!uploadedVideo)
    throw new ApiError(500, "Error while uploading the video");

  return res
    .status(200)
    .json(new ApiResponse(200, "Video uploaded successfully!", uploadedVideo));
});

const getVideoById = asyncHandler(async (req, res) => {
  // get video id and check if not empty
  // search the video in the db
  // return the video url
  const { videoId } = req.params;

  const views = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  );

  if (!views) throw new ApiError(500, "Error while updating views!");

  // Watch History can be implemented here

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {watchHistory: videoId}
    },
    {new: true}
  )
  
  if(!user) throw new ApiError(500, "Error while updating watch history!");

  const videoFile = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        subscribersCount: { size: "$subscribers" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?.id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  if (!videoFile) throw new ApiError(500, "Error while feching video file!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Fetched Successfully!", videoFile));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  if (!title?.trim() && !description?.trim())
    throw new ApiError(402, "Atleast one field is required!");

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
      },
    },
    { new: true }
  );

  if (!video) throw new ApiError(500, "Error while updating Video details!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Video details updated successfully!", video));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  const thumbnailLocalPath  = req.file?.path;  

  if (!thumbnailLocalPath)
    throw new ApiError(402, "Thumbnail file is required");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail)
    throw new ApiError(
      500,
      "Error while uploading thumbnail file on cloudinary"
    );

  const video = await Video.findById(videoId);

  // Delete on cloudinary
  const deleteResponse = await deleteOnCloudinary(video.thumbnail.publicId);

  if (!deleteResponse)
    throw new ApiError(500, "Failed to delete old thumbnail");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: {
          url: thumbnail.url,
          publicId: thumbnail.public_id,
        },
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Thumbnail Updated successfully!", updatedVideo)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Delete the video file from cloudinary
  // Delete the document from DB
  const video = await Video.findById(videoId);
  
  const deleteVideo = await deleteOnCloudinary(video.videoFile.publicId, "video");
  const deleteThumbnail = await deleteOnCloudinary(video.thumbnail.publicId);
  
  if (!(deleteThumbnail && deleteVideo))
    throw new ApiError(500, "Failed to delete video files on cloudinary!");

  const result = await Video.findByIdAndDelete(videoId, {new: true});

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", {}));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
};
