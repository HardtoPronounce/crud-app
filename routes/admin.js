const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Serve the admin HTML page
router.get('/', isAdmin, (req, res) => {
    res.sendFile('admin.html', { root: 'public' });
});

// API route for admin to get all users with role
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
