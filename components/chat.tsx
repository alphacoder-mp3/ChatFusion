'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const socket = io();

type Messages = { sender: string; content: string };

export function Chat() {
  const [isConnected, setIsConnected] = useState(socket.connected); // if at all socket.connected gives warning or errors we can set it to false instead in that case
  const [transport, setTransport] = useState('N/A');
  const [messages, setMessages] = useState<Array<Messages>>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', transport => {
        setTransport(transport.name);
      });

      // socket.emit('message', { sender: 'User', content: 'world' }); // emitting message as component gets mounted
      socket.on('message', (value: Messages) => {
        setMessages(prev => [...prev, value]);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;

    if (message.trim()) {
      const messageData = { sender: 'User', content: message };
      socket.emit('message', messageData);
      // await sendMessage(formData);  // this is when we setup a backend to store these messages
      formRef.current?.reset();
    }
  };

  return (
    <div>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      {messages.map((msg, i) => (
        <div key={i} className="mb-2">
          <strong>{msg.sender}:</strong> {msg.content}
        </div>
      ))}
      <form onSubmit={handleSubmit} ref={formRef} className="mt-8 inline-flex">
        <Input
          type="text"
          name="message"
          className="mr-2 rounded border p-2 border-none shadow-lg"
          placeholder="Type a message"
        />
        <Button type="submit" className="rounded px-4 py-2 shadow-lg">
          Send
        </Button>
      </form>
    </div>
  );
}
