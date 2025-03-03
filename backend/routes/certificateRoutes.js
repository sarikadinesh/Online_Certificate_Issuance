const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  requestCertificate,
  getPendingRequests,
  getAllRequests,
  updateRequestStatus,
  getUserRequests,
  getRequestById,
  serveUploadedFiles,
} = require("../controllers/certificateController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Storage Configuration (Fixing File Path Encoding)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // Upload directory
  filename: (req, file, cb) => {
    // Remove spaces, special characters, and ensure a safe filename
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[()]/g, "").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

// ✅ File Upload Middleware (Only PDFs Allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("document");

// ✅ Middleware to Handle Upload Errors
const uploadHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error", error: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// 📝 **Applicant: Submit a Certificate Request**
router.post("/", authMiddleware, uploadHandler, requestCertificate);

// 📝 **Applicant: Get Their Own Certificate Requests**
router.get("/user", authMiddleware, getUserRequests);

// 📝 **Admin & Applicant: Get All Pending Requests**
router.get("/pending", authMiddleware, getPendingRequests);

// 📝 **Admin: Get All Requests (Includes Applicant Details)**
router.get("/all", authMiddleware, adminMiddleware, getAllRequests);

// 📝 **Admin: Update Certificate Status & Add Remarks**
router.put("/:requestId", authMiddleware, adminMiddleware, updateRequestStatus);

// 📝 **Applicant/Admin: Get Request by ID**
router.get("/:requestId", authMiddleware, getRequestById);

// 🆕 **Admin: Get List of All Uploaded Files**
router.get("/files", authMiddleware, adminMiddleware, (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving files", error: err.message });
    }

    const fileList = files.map((file) => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        fileName: file,
        fileUrl: `/uploads/${encodeURIComponent(file)}`, // Properly encoded URL
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        uploadedAt: stats.birthtime,
      };
    });

    res.json({ files: fileList });
  });
});

// ✅ **Serve Uploaded Files (Ensuring Proper Encoding)**
router.get("/uploads/:filename", serveUploadedFiles);

module.exports = router;
