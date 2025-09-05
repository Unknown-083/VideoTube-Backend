import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { verifyVideo } from "../middlewares/verifyVideo.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId")
    .get(verifyVideo, getVideoComments)
    .post(verifyVideo, addComment)

router.route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router
