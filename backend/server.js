const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet"); // ✅ Security Headers
const compression = require("compression"); // ✅ Optimize Responses

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // ✅ Adds Security Headers
app.use(compression()); // ✅ Compress Responses

// Import Routes
const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Serve uploaded files securely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(err.status || 500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
