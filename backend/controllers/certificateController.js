const CertificateRequest = require("../models/CertificateRequest");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// ✅ Configure Nodemailer (TLS Disabled for Self-Signed Certificates)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email app password
    },
    tls: {
        rejectUnauthorized: false, // ✅ Disables TLS verification
    },
});

// ✅ Request certificate (Applicant)
const requestCertificate = async (req, res) => {
    const { certificateType } = req.body;
    const applicantId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ message: "❌ Document upload is required" });
    }

    // ✅ Sanitize filename
    const originalFilename = req.file.filename;
    const sanitizedFilename = originalFilename.replace(/\s+/g, "_");

    try {
        const user = await User.findById(applicantId);
        if (!user) return res.status(404).json({ message: "❌ User not found" });

        const newRequest = new CertificateRequest({
            applicantId,
            applicantName: user.name,
            applicantEmail: user.email,
            certificateType,
            documentPath: sanitizedFilename,
            status: "pending",
        });

        await newRequest.save();

        res.status(201).json({
            message: "✅ Certificate request submitted successfully",
            request: {
                ...newRequest.toObject(),
                documentPath: `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${encodeURIComponent(sanitizedFilename)}`,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "❌ Error creating certificate request", error: err.message });
    }
};

// ✅ Get all requests (Admin Only)
const getAllRequests = async (req, res) => {
    try {
        const requests = await CertificateRequest.find().sort({ createdAt: -1 });

        const requestsWithFiles = requests.map((request) => ({
            ...request.toObject(),
            documentPath: request.documentPath
                ? `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${encodeURIComponent(request.documentPath)}`
                : null,
        }));

        res.json({ requests: requestsWithFiles });
    } catch (err) {
        res.status(500).json({ message: "❌ Error fetching all requests", error: err.message });
    }
};

// ✅ Update certificate status & send email notification with attachment (Admin Only)
const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, remarks } = req.body;

    try {
        const request = await CertificateRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "❌ Request not found" });

        const validStatuses = ["approved", "rejected", "pending"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "❌ Invalid status provided" });
        }

        request.status = status;
        request.remarks = remarks || request.remarks;
        if (status === "approved") request.issuedDate = new Date();

        await request.save();

        // ✅ Certificate File Path (Modify as needed)
        const certificatePath = path.join(__dirname, "../uploads", `${request._id}.pdf`);

        // ✅ Prepare email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: request.applicantEmail,
            subject: `Certificate Request ${status.toUpperCase()}`,
            text: `Hello ${request.applicantName},\n\nYour certificate request has been ${status.toUpperCase()}.\n\nRemarks: ${remarks || "No additional remarks."}\n\nBest regards,\nCertificate Issuance System`,
            attachments: status === "approved" && fs.existsSync(certificatePath) 
                ? [{ filename: `${request._id}.pdf`, path: certificatePath }]
                : [],
        };

        // ✅ Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Email sending failed:", error);
            } else {
                console.log("✅ Email sent with attachment:", info.response);
            }
        });

        res.json({ message: `✅ Request ${status} successfully`, request });
    } catch (err) {
        res.status(500).json({ message: "❌ Error updating request status", error: err.message });
    }
};

// ✅ Get all pending requests (Admin & Applicant)
const getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await CertificateRequest.find({ status: "pending" }).sort({ createdAt: -1 });

        res.json({ requests: pendingRequests });
    } catch (err) {
        res.status(500).json({ message: "❌ Error fetching pending requests", error: err.message });
    }
};

// ✅ Get requests for a specific user (Applicant)
const getUserRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        const userRequests = await CertificateRequest.find({ applicantId: userId }).sort({ createdAt: -1 });

        const requestsWithFullPaths = userRequests.map((request) => ({
            ...request.toObject(),
            documentPath: request.documentPath
                ? `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${encodeURIComponent(request.documentPath)}`
                : null,
        }));

        res.json({ requests: requestsWithFullPaths });
    } catch (err) {
        res.status(500).json({ message: "❌ Error fetching user requests", error: err.message });
    }
};

// ✅ Get request by ID (Admin & Applicant)
const getRequestById = async (req, res) => {
    const { requestId } = req.params;

    try {
        const request = await CertificateRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "❌ Request not found" });

        res.json({
            ...request.toObject(),
            documentPath: request.documentPath
                ? `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${encodeURIComponent(request.documentPath)}`
                : null,
        });
    } catch (err) {
        res.status(500).json({ message: "❌ Error fetching request by ID", error: err.message });
    }
};

// ✅ Serve uploaded files (Handles special characters properly)
const serveUploadedFiles = (req, res) => {
    const filePath = path.join(__dirname, "../uploads", decodeURIComponent(req.params.filename));

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: "❌ File not found" });
    }
};

module.exports = {
    requestCertificate,
    getAllRequests,
    updateRequestStatus,
    getPendingRequests,
    getUserRequests,
    getRequestById,
    serveUploadedFiles,
};
