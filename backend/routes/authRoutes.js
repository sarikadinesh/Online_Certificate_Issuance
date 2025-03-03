const express = require('express');
const router = express.Router();  // Define the router instance
const { registerUser, loginUser } = require('../controllers/authController');
const bcrypt = require("bcryptjs");
const User = require("../models/User"); 

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const validRoles = ["applicant", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role provided" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/login', loginUser);

module.exports = router;  // Export the router
