import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyVideo = asyncHandler(async(req , _, next ) => {
    try {
        const videoId = req.body?.videoId || req.params?.videoId;
        
        if(!(videoId && isValidObjectId(videoId))) throw new ApiError(400, "Valid video id is required")

        const video = await Video.findById(videoId);

        if(!video) throw new ApiError(400, "Invalid Video Id!");

        req.video = video
        next()
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong while verifying video");
    }
})