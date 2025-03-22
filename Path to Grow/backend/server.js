require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json()); // For parsing application/json

// Import Routes
const authRoutes = require("./routes/authRoutes");
const careerRoutes = require("./routes/careerRoutes");
const cvRoutes = require("./routes/cvRoutes"); // Add this line

// Routes
app.use("/auth", authRoutes);
app.use("/career", careerRoutes);
app.use("/cv", cvRoutes); // Add this line

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
