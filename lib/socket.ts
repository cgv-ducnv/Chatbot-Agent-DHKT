import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      // Extract origin from API_BASE_URL for socket connection (removes /api/v1 suffix)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
      try {
        const url = new URL(apiBaseUrl);
        socketUrl = url.origin;
      } catch (error) {
        console.error("Invalid API_BASE_URL for socket connection:", error);
        socketUrl = "http://localhost:8000"; // Fallback default
      }
    }

    console.log("[Socket] Initializing socket with URL:", socketUrl);

    socket = io(socketUrl, {
      transports: ["websocket"],
      auth: {
        token,
      },
      query: {
        staff: "true",
      },
      autoConnect: false,
      // Quan trọng
      reconnection: true,
      reconnectionAttempts: 10, // tối đa 10 lần
      reconnectionDelay: 1000, // 1s giữa mỗi lần
      reconnectionDelayMax: 5000, // tối đa 5s
    });
  }
  return socket;
};
