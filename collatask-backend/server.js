const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import the routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const projectAssignmentRoutes = require('./routes/projectAssignments');
const userProjectsRoutes = require('./routes/userProjects');
const cardRoutes = require('./routes/cards');
const cardAssignmentRoutes = require('./routes/cardAssignments');
const boardRoutes = require('./routes/boards');
const contactRoutes = require('./routes/contact');
const helloRoute = require('./routes/hello');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hello', helloRoute);
app.use('/api/user', accountRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-assignments', projectAssignmentRoutes);
app.use('/api/user-projects', userProjectsRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/card-assignments', cardAssignmentRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/contact', contactRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Export the app
module.exports = app;

// Start the server only if this file is executed directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
