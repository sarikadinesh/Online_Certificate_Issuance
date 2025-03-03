require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// ✅ User Registration Function
const registerUser = async (req, res) => {
    console.log("🔹 Incoming registration request...");

    const { name, email, password, role } = req.body;

    try {
        // ✅ Check Required Fields
        if (!name || !email || !password || !role) {
            console.log("❌ Missing required fields");
            return res.status(400).json({ error: "❌ All fields are required" });
        }

        // ✅ Validate Role
        const validRoles = ["applicant", "admin"];
        if (!validRoles.includes(role)) {
            console.log("❌ Invalid role provided");
            return res.status(400).json({ error: "❌ Invalid role provided" });
        }

        // ✅ Check if User Already Exists
        console.log(`📨 Checking if user already exists: ${email}`);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("❌ User already exists:", email);
            return res.status(400).json({ error: "❌ User already exists" });
        }

        // ✅ Hash Password
        console.log("🔑 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create New User
        console.log("📝 Creating new user...");
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // ✅ Generate JWT Token
        console.log("🔑 Generating JWT token...");
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ User registered successfully:", email);

        // ✅ Send Welcome Email
        console.log("📨 Preparing to send welcome email...");
        const emailSubject = "🎉 Welcome to Online Certificate Verification System";
        const emailText = `Hello ${name},\n\nWelcome to our Online Certificate Verification System! 🎉\n\nYour account has been successfully created.\n\nBest regards,\nCertificate Issuance System Team`;

        try {
            await sendEmail(email, emailSubject, emailText);
            console.log("✅ Welcome email sent successfully");
        } catch (emailError) {
            console.error("❌ Error sending welcome email:", emailError);
        }

        res.status(201).json({
            message: "✅ User registered successfully",
            token,
            role: newUser.role,
            name: newUser.name,
        });

    } catch (err) {
        console.error("❌ Error during registration:", err.message);
        res.status(500).json({ error: "❌ Internal Server Error" });
    }
};

// ✅ User Login Function
const loginUser = async (req, res) => {
    console.log("🔹 Incoming login request...");

    const { email, password } = req.body;

    try {
        // ✅ Check Required Fields
        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ error: "❌ Email and password are required" });
        }

        // ✅ Find User by Email
        console.log(`📨 Checking if user exists: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "❌ User not found" });
        }

        // ✅ Validate Password
        console.log("🔑 Verifying password...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid credentials for:", email);
            return res.status(400).json({ error: "❌ Invalid credentials" });
        }

        // ✅ Generate JWT Token
        console.log("🔑 Generating JWT token...");
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ User logged in successfully:", email);
        res.json({
            message: "✅ User logged in successfully",
            token,
            role: user.role,
            name: user.name,
        });

    } catch (err) {
        console.error("❌ Error during login:", err.message);
        res.status(500).json({ error: "❌ Internal Server Error" });
    }
};

module.exports = { registerUser, loginUser };