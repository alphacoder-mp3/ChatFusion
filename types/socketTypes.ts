import { Messages } from '@/types/chatMessageTypes';
export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  message: (value: Messages) => void;
}

export interface ClientToServerEvents {
  hello: (value: string) => void;
  message: (value: Messages) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
