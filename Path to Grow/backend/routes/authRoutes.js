const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = require("../middleware/authMiddleware"); // Import the middleware
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ firstName, lastName, email, password });
    await user.save();

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send the response
    res.json({
      message: "Login successful",  // Optional message
      token: token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Edit profile route
router.put("/edit-profile", verifyToken, async (req, res) => {
  const { firstName, lastName } = req.body;
  const { userId } = req.user; // Now req.user contains the authenticated user data

  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      { firstName, lastName }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});


module.exports = router;
