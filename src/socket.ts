// socket.ts
import { io } from "socket.io-client";

// // Check if the code is running in a browser environment
// const isBrowser = typeof window !== "undefined";

// // Initialize the socket only if the code is running in the browser
// export const socket = isBrowser ? io("http://localhost:3333") : undefined;

const DEV = true;

export const socket = io(`http://${DEV ? "localhost:3333" : "13.38.65.79:3333"}`);
