const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pg = require("pg");
require("dotenv").config();

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

const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hello", helloRoute);
app.use("/api/user", accountRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-assignments", projectAssignmentRoutes);
app.use("/api/user-projects", userProjectsRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/card-assignments", cardAssignmentRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/contact", contactRoutes);

// Socket.io
socketHandler(io);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Export the app
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`WebSocket is running on port ${PORT}`);
    });
}
