const { db } = require('./db');
const { messages } = require('./models');

module.exports = function(io) {
    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id);
        socket.on("sendMessage", async (data) => {
            const { sender, message } = data;

            try {
                await db.insert(messages).values({ sender, message });

                io.emit("receiveMessage", data);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};
