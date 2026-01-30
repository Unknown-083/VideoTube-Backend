# 🎥 VideoTube Backend

A **YouTube-like Web App Backend** built with **Node.js**, **Express**, and **MongoDB**.  
This project simulates video platform functionalities including user authentication, video uploads, watch history, comments, likes, subscriptions, playlists, and more.

---

## 🚀 Features

- ✅ User Authentication (Register, Login, Logout)  
- ✅ User Profile Management (Update Info)  
- ✅ Video Uploading & Streaming  
- ✅ Watch History Tracking  
- ✅ Likes, Comments, Tweets (Social Interactions)  
- ✅ Subscriptions & Playlist Management  
- ✅ Secure Authentication using JWT & Password Hashing  
- ✅ Cloud Media Storage using Cloudinary  

---

## 🏗 Architecture Overview

![Architecture Diagram](./assets/architecture-diagram.png)  
*Diagram showing interaction between Client, API, Database, Cloud Storage, and Authentication Flow.*

---

## ⚡ Tech Stack

- Node.js  
- Express  
- MongoDB & Mongoose  
- Cloudinary (for media uploads)  
- JWT (Authentication)  
- bcrypt (Password Hashing)  
- multer (File Uploads)  
- dotenv (Environment Config)  
- cors (Cross-Origin Support)  

---

## 🧪 API Testing

All API endpoints have been thoroughly tested using [Postman](https://postman.co/workspace/My-Workspace~67f8b2dc-0d20-40c9-8831-dfb9e4656ad5/collection/42569826-617fb3ed-813a-43e9-8e68-ac55f045e47d?action=share&creator=42569826&active-environment=42569826-6aa4f43b-5e5e-4856-8e86-335d1575c9ec)  
👉 Explore and test endpoints in Postman Collection.

---

## 📂 Folder Structure (Example)

```text
├── public/
    └── temp/
    │   └── .gitkeep
├── src/ (16900 tokens)
    ├── constants.js
    ├── utils/ (800 tokens)
    │   ├── ApiResponse.js
    │   ├── asyncHandler.js (200 tokens)
    │   ├── ApiError.js (200 tokens)
    │   └── cloudinary.js (300 tokens)
    ├── middlewares/ (900 tokens)
    │   ├── multer.middleware.js
    │   ├── verifyChannel.middleware.js (200 tokens)
    │   ├── verifyPlaylist.middleware.js (200 tokens)
    │   ├── verifyVideo.middleware.js (200 tokens)
    │   └── auth.middleware.js (200 tokens)
    ├── models/ (1600 tokens)
    │   ├── tweet.model.js
    │   ├── subscription.model.js
    │   ├── comment.model.js
    │   ├── like.model.js (200 tokens)
    │   ├── playlist.model.js (200 tokens)
    │   ├── video.model.js (300 tokens)
    │   └── user.model.js (600 tokens)
    ├── db/ (100 tokens)
    │   └── index.js
    ├── routes/ (1700 tokens)
    │   ├── tweet.routes.js
    │   ├── comment.routes.js (200 tokens)
    │   ├── subscription.routes.js (200 tokens)
    │   ├── like.routes.js (200 tokens)
    │   ├── playlist.routes.js (300 tokens)
    │   ├── video.routes.js (300 tokens)
    │   └── user.routes.js (400 tokens)
    ├── index.js (300 tokens)
    ├── app.js (300 tokens)
    └── controllers/ (11200 tokens)
    │   ├── tweet.controller.js (700 tokens)
    │   ├── subscription.controller.js (900 tokens)
    │   ├── comment.controller.js (1000 tokens)
    │   ├── playlist.controller.js (1600 tokens)
    │   ├── like.controller.js (1600 tokens)
    │   ├── video.controller.js (2100 tokens)
    │   └── user.controller.js (3300 tokens)
├── .prettierignore
├── .prettierrc
├── package.json (200 tokens)
├── README.md (400 tokens)
└── .gitignore (600 tokens)
