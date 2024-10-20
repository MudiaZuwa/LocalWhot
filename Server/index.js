const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("sendStacks", (stacks, playerTurn, room) => {
    socket.to(room).emit("recieveStacks", stacks, playerTurn);
  });

  socket.on("userReady", (ready, roomName) => {
    if (rooms[roomName]) {
      rooms[roomName][socket.id] = ready;
      io.to(roomName).emit("recieveUserReady", rooms[roomName]);
      io.to(roomName).emit("update-room-users", Object.keys(rooms[roomName]));
    }
  });

  socket.on("join-room", (roomName) => {
    socket.join(roomName);

    if (!rooms[roomName]) rooms[roomName] = {};

    const allReady = Object.values(rooms[roomName]).every((player) => player);
    if (
      Object.keys(rooms[roomName]).length < 4 ||
      (!allReady && Object.keys(rooms[roomName]).length > 1)
    ) {
      rooms[roomName][socket.id] = false;
      io.to(roomName).emit("update-room-users", Object.keys(rooms[roomName]));
    }
  });

  socket.on("disconnect", () => {
    for (const roomName in rooms) {
      if (rooms[roomName][socket.id] !== undefined) {
        const { [socket.id]: _, ...remainingUsers } = rooms[roomName];
        rooms[roomName] = remainingUsers;

        io.to(roomName).emit("update-room-users", Object.keys(rooms[roomName]));

        if (!rooms[roomName]) return;
        if (Object.keys(remainingUsers).length === 0) {
          delete rooms[roomName];
        }
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
