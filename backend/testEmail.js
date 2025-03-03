const nodemailer = require("nodemailer");
require('dotenv').config();

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email app password
    },
    tls: {
        rejectUnauthorized: false, // ✅ Disable TLS verification for self-signed certificates
    },
});

// ✅ Function to Send Test Email
const sendTestEmail = async () => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "anonymous06021978@gmail.com", // Replace with the recipient's email address
        subject: "Test Email",
        text: "This is a test email.",
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Test email sent successfully: ${info.response}`);
    } catch (error) {
        console.error("❌ Error sending test email:", error);
    }
};

sendTestEmail();