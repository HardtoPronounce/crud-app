const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const bodyParser = require('body-parser');
const sequelize = require('./config');
const path = require('path');
require('dotenv').config();

const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const port = process.env.PORT || 3000;

const sessionStore = new SequelizeStore({
   db: sequelize,
});

app.use(session({
   secret: 'your-secret-key',
   resave: false,
   saveUninitialized: false,
   store: sessionStore,
   cookie: {
       secure: true, // Use secure cookies in production
       maxAge: 1000 * 60 * 60 * 24 // 1 day
   }
}));

sessionStore.sync();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define custom routes to serve HTML files
app.get('/create', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

app.get('/logout', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'logout.html'));
});

app.get('/update', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'update.html'));
});

app.get('/delete', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});

app.get('/register', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/read', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'read.html'));
});

// Test DB connection
sequelize.authenticate()
   .then(() => console.log('Database connected...'))
   .catch(err => console.log('Error: ' + err));

// Routes
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Start server
if (process.env.NODE_ENV === 'dev') {
   app.listen(port, () => {
       console.log(`Server running on port ${port}`);
   });
}

module.exports.handler = serverless(app);