import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyChannel } from "../middlewares/verifyChannel.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-subscribers/:channelId").get(verifyChannel, getUserChannelSubscribers);
router.route("/toggle/:channelId").get(verifyChannel, toggleSubscription);
router.route("/get-subscribed-channels/:channelId").get(getSubscribedChannels);

export default router;
