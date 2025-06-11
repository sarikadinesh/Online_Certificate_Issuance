const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config();

console.log("Loaded PORT from .env:", process.env.PORT);

connectDB();

const app = express();

// CORS configuration: allow your frontend origin only
const corsOptions = {
    origin: "http://localhost:3000", // change if frontend runs elsewhere
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(helmet());
app.use(compression());

// Import routes
const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/upload", uploadRoutes);

// Serve static uploads folder securely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(err.status || 500).json({
        message: "Internal Server Error",
        error: err.message,
    });
});

// Start the server
const PORT = process.env.PORT || 7500;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
