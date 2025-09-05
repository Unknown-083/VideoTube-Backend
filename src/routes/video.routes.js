import { deleteVideo, getAllVideos, getVideoById, publishAVideo, updateVideoDetails, updateVideoThumbnail } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route('/').get(getAllVideos)

router
    .route("/upload-video")
    .post(
        upload.fields([
            {
                name: "thumbnail",
                maxCount: 1
            },
            {
                name: "videoFile",
                maxCount: 1
            }
        ]),
        publishAVideo
    )

router
    .route("/:videoId")
    .get(getVideoById)
    
router.route("/delete/:videoId").delete(deleteVideo)

router.route('/update/thumbnail/:videoId').patch(upload.single("thumbnail"), updateVideoThumbnail)
router.route('/update/account-details/:videoId').patch(updateVideoDetails);
// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router