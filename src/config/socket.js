// config/socket.js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const jwt = require("jsonwebtoken");
const { getRedisClient } = require("./redis");
const logger = require("./winston");
const connectionHandler = require("../src/sockets/connectionHandler");
const chatHandler = require("../src/sockets/chatHandler");
const messageHandler = require("../src/sockets/messageHandler");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN?.split(",") || [
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    maxHttpBufferSize: 1e6, // 1MB
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis adapter for scaling across multiple servers
  const redisClient = getRedisClient();
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userType = decoded.userType;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    logger.info(`User ${socket.userId} connected`);

    // Register handlers
    connectionHandler.handleConnection(socket, io);
    chatHandler.registerChatHandlers(socket, io);
    messageHandler.registerMessageHandlers(socket, io);

    socket.on("disconnect", () => {
      connectionHandler.handleDisconnection(socket, io);
      logger.info(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
