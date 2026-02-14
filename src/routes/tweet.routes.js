import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  getAllTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllTweets).post(upload.single("tweetImage"), createTweet);

router.route("/:userId").get(getUserTweets);

router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router