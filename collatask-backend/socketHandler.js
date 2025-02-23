const { db } = require('./db');
const { messages } = require('./models');

module.exports = function(io) {
    io.on("connection", (socket) => {
        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} join room: ${room}`);
        });

        socket.on("sendMessage", async (data) => {
            const { sender, message, room } = data;

            try {
                await db.insert(messages).values({ sender, message, room });

                io.to(room).emit("receiveMessage", data);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};
