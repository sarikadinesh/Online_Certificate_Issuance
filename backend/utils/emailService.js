const nodemailer = require("nodemailer");
require('dotenv').config();

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// ✅ Function to Send Emails
const sendEmail = async (to, subject, text) => {
    try {
        console.log(`📨 Attempting to send email to: ${to}`);
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });

        console.log(`✅ Email sent successfully: ${info.response}`);
    } catch (error) {
        console.error(`❌ Email send failed to ${to}:`, error);
    }
};

module.exports = sendEmail;
