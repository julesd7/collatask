const { db } = require('./db');
const { messages } = require('./models');

const { eq } = require('drizzle-orm');

module.exports = function(io) {
    io.on("connection", (socket) => {
        socket.on("joinRoom", async (room) => {
            socket.join(room);
            const data = await db.select().from(messages).where(eq(messages.room, room)).orderBy({ createdAt: "asc" }).limit(50);
            socket.emit("historicalMessages", data);
        });

        socket.on("sendMessage", async (data) => {
            const { sender, message, room } = data;

            try {
                await db.insert(messages).values({ sender, message, room });

                io.to(room).emit("receiveMessage", data);

                socket.emit('messageAck', data);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};
