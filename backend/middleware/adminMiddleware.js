const User = require('../models/User'); // Make sure you have a User model

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Authorization error', error: err.message });
    }
};

module.exports = adminMiddleware;
