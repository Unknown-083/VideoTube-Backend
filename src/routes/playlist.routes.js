import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyVideo } from "../middlewares/verifyVideo.middleware.js";
import { verifyPlaylist } from "../middlewares/verifyPlaylist.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  getUserWatchLaterPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// -----------------------------
// Watch Later Playlist
// -----------------------------
router.get("/watch-later", getUserWatchLaterPlaylist);

// -----------------------------
// Playlists Root
// -----------------------------
router.route("/")
  .post(createPlaylist)          // Create a new playlist
  .get(getUserPlaylists);       // Get all playlists of logged-in user

// -----------------------------
// Playlist by ID
// -----------------------------
router.route("/:playlistId")
  .get(verifyPlaylist, getPlaylistById)
  .patch(verifyPlaylist, updatePlaylist)
  .delete(verifyPlaylist, deletePlaylist);

// -----------------------------
// Videos inside Playlist (RESTful)
// -----------------------------
router.route("/:playlistId/videos/:videoId")
  .post(verifyVideo, verifyPlaylist, addVideoToPlaylist)       // Add video
  .delete(verifyVideo, verifyPlaylist, removeVideoFromPlaylist); // Remove video

export default router;
