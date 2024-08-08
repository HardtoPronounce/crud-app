const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const expressSession = require('express-session');

// Middleware for session handling
router.use(expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

router.get('/links', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        // Create a new user
        const user = await User.create({
            email,
            name,
            password, // Password will be hashed in the model
            role
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await user.validatePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
        
        req.session.userId = user.id; // Set user ID in session
        await req.session.save();
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Create a new user
router.post('/', async (req, res) => {
   try {
       const user = await User.create({
           email: req.body.email,
           name: req.body.name,
           password: req.body.password,
           role: req.body.role
       });
       res.status(201).json(user);
   } catch (err) {
       res.status(400).json({ message: err.message });
   }
});

router.get('/read', async (req, res) => {
    try {
        const users = await User.findAll();
        const response = users.map(user => {
            const userJson = user.toJSON(); // Convert user instance to plain object
            delete userJson.role; // Remove the role property
            return userJson;
        });
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update one user
router.patch('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.email != null) user.email = req.body.email;
        if (req.body.name != null) user.name = req.body.name;
        if (req.body.password != null) user.password = req.body.password;
        if (req.body.role != null) user.role = req.body.role;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;