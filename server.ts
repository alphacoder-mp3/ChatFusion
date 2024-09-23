import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@/types/socketTypes';
import { Messages } from '@/types/chatMessageTypes';

const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  let userCount = 0; // 1, Added this for server side handling of dynamic usernames, will be removed once we implement auth, then users value will come from front end
  const users = new Map(); // 2

  io.on('connection', socket => {
    userCount++; //3
    const username = `user${userCount}`; //4
    users.set(socket.id, username); //5
    console.log(`${username} connected`); //6

    socket.on('message', (value: Messages) => {
      console.log('message received', value);
      // socket.broadcast.emit('message', value); // Broadcast to all clients except the sender
      // io.emit('message', value); // Broadcast to all clients, including the sender
      io.emit('message', { sender: username, content: value.content }); //7
    });

    socket.on('typing', () => {
      socket.broadcast.emit('typing', { username }); //8
    });

    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', { username }); //9
    });

    socket.on('disconnect', () => {
      console.log(`${username} disconnected`);
      users.delete(socket.id); //10
    });

    socket.emit('noArg');
    socket.emit('basicEmit', 1, '2', Buffer.from([3]));
    socket.emit('withAck', '4', e => {
      console.log(`Ack received with value: ${e}`);
    });

    socket.data.name = 'John';
    socket.data.age = 42;
  });

  httpServer
    .once('error', err => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  );
});
