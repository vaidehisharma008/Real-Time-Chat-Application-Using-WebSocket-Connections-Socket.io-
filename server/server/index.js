const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // for local dev; restrict in production
    methods: ["GET", "POST"]
  }
});

// Optional basic route
app.get('/', (req, res) => {
  res.send({ status: 'Socket.io server running' });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a default room (optional)
  socket.join('global-room');

  // Broadcast when a user joins
  socket.broadcast.to('global-room').emit('message', {
    system: true,
    text: `A user joined the chat`,
    timestamp: Date.now()
  });

  // Handle incoming chat messages from clients
  socket.on('chatMessage', (msg) => {
    // msg expected: { name, text }
    const payload = {
      id: socket.id + '-' + Date.now(),
      name: msg.name || 'Anonymous',
      text: msg.text || '',
      timestamp: Date.now()
    };

    // Broadcast to everyone in the room
    io.to('global-room').emit('message', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id} (${reason})`);
    socket.broadcast.to('global-room').emit('message', {
      system: true,
      text: `A user left the chat`,
      timestamp: Date.now()
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
