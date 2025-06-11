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
const { addVerificationTicket } = require("../utils/pdfHelper"); // ✅ PDF processing function
const Certificate = require("../models/CertificateRequest"); // ✅ Certificate model
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Storage Configuration (Handles Special Characters)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
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

// 📝 **Admin: Approve Certificate & Add Verification Ticket**
router.put("/:requestId/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const certificate = await Certificate.findById(requestId);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (certificate.status === "approved") {
      return res.status(400).json({ message: "Certificate is already approved" });
    }

    // ✅ Ensure documentPath is correct
    let fileName = path.basename(certificate.documentPath); // Extract only filename
    let filePath = path.join(uploadDir, fileName); // Reconstruct full path

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return res.status(404).json({ message: `File not found: ${filePath}` });
    }

    // ✅ Generate new PDF with verification ticket
    const verifiedFileName = await addVerificationTicket(fileName, requestId);
    const verifiedFilePath = path.join(uploadDir, verifiedFileName);

    if (!fs.existsSync(verifiedFilePath)) {
      return res.status(500).json({ message: "Failed to generate verified certificate" });
    }

    // ✅ Update database with new file path
    certificate.status = "approved";
    certificate.remarks = req.body.remarks || "Approved";
    certificate.documentPath = verifiedFileName; // Store only the filename
    await certificate.save();

    res.json({ message: "Certificate approved & verification ticket added", verifiedFilePath });
  } catch (error) {
    console.error("❌ Error approving certificate:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 📝 **Admin: Reject Certificate**
router.put("/:requestId/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, remarks } = req.body;

    const request = await Certificate.findById(requestId);
    if (!request) return res.status(404).json({ message: "❌ Request not found" });

    const validStatuses = ["approved", "rejected", "pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "❌ Invalid status provided" });
    }

    request.status = status;
    request.remarks = remarks || request.remarks;
    if (status === "approved") request.issuedDate = new Date();

    await request.save();

    res.json({ message: `✅ Request ${status} successfully`, request });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating request status", error: err.message });
  }
});

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