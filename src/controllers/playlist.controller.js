import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (name.trim() === "" && description.trim() === "")
        throw new ApiError(400, "Name and description is required!");

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    if (!playlist) throw new ApiError(400, "Error while creating playlist!");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist created successfully!", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.params;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId },
        },
        { new: true }
    );

    if (!updatedPlaylist)
        throw new ApiError(500, "Error while adding video to playlist!");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video added to playlist successfully!",
                updatedPlaylist
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.params;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId },
        },
        { new: true }
    );

    if (!updatedPlaylist)
        throw new ApiError(500, "Error while removing video from playlist");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video removed from playlist successfully!",
                updatedPlaylist
            )
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            },
        },
    ]);

    if (!playlist) throw new ApiError(400, "Error while fething user playlists!");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist fetched successfully!", playlist));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!(playlistId && isValidObjectId(playlistId)))
        throw new ApiError(400, "Valid playlistId is required!");

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
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
                            fullname: 1,
                            avatar: { url: 1 },
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
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
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
                                        fullname: 1,
                                        username: 1,
                                        avatar: { url: 1 }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$owner"
                    }
                ]
            },
        }
    ]);

    if (!playlist) throw new ApiError(500, "Error while fetching the playlist");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist fetched successfully!", playlist[0]));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!(playlistId && isValidObjectId(playlistId)))
        throw new ApiError(400, "Valid playlistId is required");

    if (!name?.trim() && !description?.trim())
        throw new ApiError(400, "Either name or description is required!");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name,
                description,
            },
        },
        {new: true}
    );

    if (!updatePlaylist)
        throw new ApiError(500, "Error while updating playlist!");

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Playlist updated successfully!", updatedPlaylist)
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!(playlistId && isValidObjectId(playlistId)))
        throw new ApiError(400, "Valid playlistId is required!");

    const response = await Playlist.findByIdAndDelete(playlistId);

    if (!response) throw new ApiError(500, "Error while deleting playlist!");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist deleted successfully!", {}));
});

const getUserWatchLaterPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({
        owner: req.user._id,
        isDefault: true,
    }).populate("videos");
    if (!playlist) throw new ApiError(400, "Error while fething watch later playlist!");

    return res
        .status(200)
        .json(new ApiResponse(200, "Watch later playlist fetched successfully!", playlist));

});

export {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylists,
    getPlaylistById,
    getUserWatchLaterPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
};
