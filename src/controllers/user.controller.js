import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  console.log("Name : ", fullname);

  if (
    [fullname, email, password, username].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser)
    throw new ApiError(409, "User Already exists with the username or email");

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log(coverImageLocalPath);

  if (!avatarLocalPath) throw new ApiError(400, "Avatar File is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) throw new ApiError(400, "Error in Uploading Avatar File");

  const user = await User.create({
    fullname,
    avatar: {
      url: avatar.url,
      publicId: avatar.public_id,
    },
    coverImage: coverImage
      ? { url: coverImage.url, publicId: coverImage.public_id }
      : null,
    username: username.toLowerCase(),
    password,
    email,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while creating the user!");

  return res
    .status(201)
    .json(new ApiResponse(200, "User Created Successfully!", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);

    const { email, username, password } = req.body;
    console.log(username, email);

    if (!(username || email))
      throw new ApiError(401, "Username or Email is required!");

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!existedUser)
      throw new ApiError(
        402,
        "User does not exist with the username or email!"
      );

    const passwordCorrect = await existedUser.isPasswordCorrect(password);

    if (!passwordCorrect) throw new ApiError(402, "Invalid Credentials!");

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      existedUser._id
    );

    const loggedInUser = await User.findById(existedUser._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "User logged in successfully", {
          loggedInUser,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Enter valid credentials!");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request!");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decodedToken?._id);

    if (!user) throw new ApiError(402, "Invalid Refresh Token!");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(403, "Refresh Token is expired or used");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "Refresh Token is updated successfully", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid Refresh Token!");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Got Current User Successfully!", { data: req.user })
    );
});

const updateCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword))
    throw new ApiError(400, "Old password and new password is required");

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid Old Password!");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully", {}));
});

const updateCurrentUserDetails = asyncHandler(async (req, res) => {
  const { email, fullname, username } = req.body;

  if (!(email || fullname || username))
    throw new ApiError(400, "Provide data for updation");

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        email,
        fullname,
        username,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User Info Updated Successfully!", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  console.log("Avatar Path ", avatarLocalPath);
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) throw new ApiError(500, "Error while uploading updated avatar!");

  // Delete old avatar
  const userId = req.user?._id;
  console.log(userId);

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found!");
  console.log(user.avatar.publicId);

  const response = await deleteOnCloudinary(user.avatar.publicId);
  console.log(response);
  if (!response)
    throw new ApiError(500, "Failed to delete Avatar on Cloudinary");

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: avatar.url,
          publicId: avatar.public_id,
        },
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Updated avatar successfully!", updatedUser));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath)
    throw new ApiError(400, "Cover Image file is missing");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage)
    throw new ApiError(500, "Error while uploading updated cover image!");

  // Delete old coverImage
  const userId = req.user?._id;
  console.log(userId);

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found!");

  if (user.coverImage) {
    const response = await deleteOnCloudinary(user.coverImage?.publicId);
    if (!response)
      throw new ApiError(500, "Failed to delete coverImage on Cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: coverImage.url,
          publicId: coverImage.public_id,
        },
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Updated cover image successfully!", updatedUser)
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) throw new ApiError(400, "User not found!");

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?.id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        isSubscribed: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
      },
    },
  ]);

  if (!channel?.length) throw new ApiError("Channel does not exists!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User channel fetched Successfully!", channel[0])
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Fetched user history successfully!",
        user[0].watchHistory
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateCurrentUserPassword,
  updateCurrentUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
