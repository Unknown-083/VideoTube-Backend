import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyVideo } from "../middlewares/verifyVideo.middleware.js";
import { verifyPlaylist } from "../middlewares/verifyPlaylist.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist).get(getUserPlaylists);

// // Middleware to verify the playlist
// router.use("/:playlistId", verifyPlaylist);

router
  .route("/:playlistId")
  .get(verifyPlaylist, getPlaylistById)
  .patch(verifyPlaylist, updatePlaylist)
  .delete(verifyPlaylist, deletePlaylist);
router.route("/add-video/:playlistId").patch(verifyVideo, verifyPlaylist, addVideoToPlaylist);
router
  .route("/remove-video/:playlistId")
  .patch(verifyVideo, verifyPlaylist, removeVideoFromPlaylist);

export default router;
