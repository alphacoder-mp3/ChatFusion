'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Messages } from '@/types/chatMessageTypes';

export const socket = io();

export function Chat() {
  const [isConnected, setIsConnected] = useState(socket.connected); // if at all socket.connected gives warning or errors we can set it to false instead in that case
  const [transport, setTransport] = useState('N/A');
  const [messages, setMessages] = useState<Array<Messages>>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [typingUsers, setTypingUsers] = useState(''); //1

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

      socket.on('typing', ({ username }) => {
        // setTypingUsers(prev => [...prev, username]); //2
        setTypingUsers(username);
      });

      socket.on('stop typing', () => {
        // setTypingUsers(prev => prev.filter(user => user !== username)); //3
        setTypingUsers('');
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
      socket.emit('stop typing'); // 4
      // await sendMessage(formData);  // this is when we setup a backend to store these messages
      formRef.current?.reset();
    }
  };

  const handleTyping = () => {
    socket.emit('typing'); //5
    let typingTimeout = undefined;
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop typing');
    }, 1000); // Stop typing after 1 second of inactivity
  };

  return (
    <div>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      <div className="mt-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
        {typingUsers && (
          <div className="text-gray-500">{typingUsers} is typing...</div> // 6
        )}
        {/* {typingUsers.map((user, i) => (
          <div key={i} className="text-gray-500">
            {user} is typing...
          </div>
        ))} */}
      </div>
      <form onSubmit={handleSubmit} ref={formRef} className="mt-8 inline-flex">
        <Input
          type="text"
          name="message"
          className="mr-2 rounded border p-2 border-none shadow-lg"
          placeholder="Type a message"
          onInput={handleTyping} //7
        />
        <Button type="submit" className="rounded px-4 py-2 shadow-lg">
          Send
        </Button>
      </form>
    </div>
  );
}
