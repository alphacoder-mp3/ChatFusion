import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface ServerToClientEvents {
  message: (message: { sender: string; content: string }) => void;
  typing: (data: { username: string }) => void;
  'stop typing': (data: { username: string }) => void;
}

interface ClientToServerEvents {
  message: (message: { content: string }) => void;
  typing: () => void;
  'stop typing': () => void;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Assume you store the JWT in localStorage
    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket };
};
