import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedComments,
  getLikedTweets,
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyVideo } from "../middlewares/verifyVideo.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(verifyVideo, toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/comments").get(getLikedComments);
router.route("/tweets").get(getLikedTweets);

export default router;
