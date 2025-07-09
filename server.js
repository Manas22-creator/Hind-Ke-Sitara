const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/musicApp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Schema and Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.json({ message: "Signup successful" });
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare hashed passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  res.json({ message: "Login successful" });
});

// Get all users (Admin panel)
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Delete user
app.delete("/api/users/:username", async (req, res) => {
  const username = req.params.username;
  await User.deleteOne({ username });
  res.json({ message: "User deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const SongRequestSchema = new mongoose.Schema({
  song: String,
  requester: String,
  time: String
});

const SongRequest = mongoose.model("SongRequest", SongRequestSchema);


// POST route to save a new song request
app.post("/api/song-request", async (req, res) => {
  const { song, requester, time } = req.body;
  const newRequest = new SongRequest({ song, requester, time });
  await newRequest.save();
  res.json({ message: "Song request saved successfully" });
});

// GET route to fetch all song requests (for admin)
app.get("/api/song-requests", async (req, res) => {
  const requests = await SongRequest.find();
  res.json(requests);
});
