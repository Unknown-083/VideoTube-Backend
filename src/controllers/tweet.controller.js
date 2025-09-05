import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async(req , res ) => {
    const {content} = req.body

    if(content.trim()==="") throw new ApiError(400, "Content is required!");

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if(!tweet) throw new ApiError(500, "Error while creating tweet!");

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet post created successfully!", tweet))
})

const getUserTweets = asyncHandler(async(req, res) => {
    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
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
                            avatar: {url: 1}
                        }
                    }
                ]
            }
        }
    ])
 
    if(!userTweets) throw new ApiError(500, "Error while fetching user tweets!")
    
    return res
    .status(200)
    .json(new ApiResponse(200, "User Tweets fetched successfully!", userTweets))
})