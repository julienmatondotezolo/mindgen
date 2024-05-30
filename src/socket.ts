// socket.ts
import { io } from "socket.io-client";

const socketUrl: string | undefined = process.env.NEXT_PUBLIC_SOCKET_URL;

// // Check if the code is running in a browser environment
// const isBrowser = typeof window !== "undefined";

// // Initialize the socket only if the code is running in the browser
// export const socket = isBrowser ? io("http://localhost:3333") : undefined;

export const socket = io(socketUrl!);
