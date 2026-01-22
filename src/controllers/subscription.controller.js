import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscriberExists = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscriberExists) {
    await Subscription.deleteOne(subscriberExists);

    return res
      .status(200)
      .json(new ApiResponse(200, "Subscriber removed successfully!", {}));
  }

  const newSubscriber = await Subscription.create({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (!newSubscriber)
    throw new ApiError(500, "Error while adding new subscriber!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscriber added successfully!", newSubscriber));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: { url: 1 },
            },
          },
        ],
      },
    },
  ]);

  if (!subscribers || !Array.isArray(subscribers))
    throw new ApiError(500, "Error while fetching channel subscribers list!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers fetched successfully!", subscribers)
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: { url: 1 },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        channel: 1,
      },
    },
    {
      $replaceRoot: { newRoot: "$channel" },
    }
  ]);

  if (!subscribedChannels || !Array.isArray(subscribedChannels))
    throw new ApiError(500, "Error while fetching subscribed channels list!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed channels fetched successfully!", subscribedChannels));
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
