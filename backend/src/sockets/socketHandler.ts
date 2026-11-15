import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Socket middleware for optional token verification
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'cosmic_six_classified_space_app_jwt_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        (socket as any).user = decoded;
      } catch (err) {
        console.warn('[Socket.IO] Connecting client provided an unverified/expired token');
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Mission client connected: ${socket.id}`);

    // Join specific mission or astronaut rooms
    socket.on('subscribe:astronaut', (astronautId: string) => {
      socket.join(`astronaut:${astronautId}`);
    });

    socket.on('unsubscribe:astronaut', (astronautId: string) => {
      socket.leave(`astronaut:${astronautId}`);
    });

    socket.on('subscribe:mission', (missionId: string) => {
      socket.join(`mission:${missionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Mission client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};
