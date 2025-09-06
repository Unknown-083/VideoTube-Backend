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
├── controllers/
├── middlewares/
├── models/
├── routes/
├── config/
├── utils/
├── .env
├── server.js
├── package.json
