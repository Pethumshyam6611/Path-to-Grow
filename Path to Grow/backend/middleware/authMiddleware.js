// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Authorization header with Bearer token

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next(); // Call the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
