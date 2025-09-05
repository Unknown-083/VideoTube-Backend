import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyChannel = async (req, _, next) => {
  try {
    const { channelId } = req.params;

    if (!(channelId && isValidObjectId(channelId)))
      throw new ApiError(400, "Valid channelId is required!");

    const channel = await User.findById(channelId);

    if (!channel) throw new ApiError(400, "Channel doesn't exists!");

    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Channel doesn't exists!");
  }
};
