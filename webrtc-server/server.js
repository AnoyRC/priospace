const WebSocket = require("ws");
require("dotenv").config();

class SignalingServer {
  constructor(port = process.env.PORT || 3001) {
    this.port = port;
    this.wss = new WebSocket.Server({ port: this.port });
    this.rooms = new Map(); // roomId -> Set of client objects
    this.clients = new Map(); // ws -> { id, roomId }

    this.setupServer();
    console.log(`🚀 WebRTC Signaling Server running on port ${this.port}`);
    console.log(`📡 Ready to facilitate peer-to-peer connections!`);
  }

  setupServer() {
    this.wss.on("connection", (ws) => {
      const clientId = this.generateClientId();
      const client = { id: clientId, roomId: null, ws: ws };
      this.clients.set(ws, client);

      console.log(`✅ Client ${clientId} connected`);

      // Send connection confirmation immediately
      this.sendMessage(ws, {
        type: "connected",
        clientId: clientId,
      });

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error("❌ Error parsing message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
        this.handleDisconnect(ws);
      });

      // Add ping/pong for connection health
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });
    });

    // Ping clients every 30 seconds to maintain connection health
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          console.log("🔌 Terminating dead connection");
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  generateClientId() {
    return Math.random().toString(36).substring(2, 15);
  }

  handleMessage(ws, data) {
    const client = this.clients.get(ws);
    if (!client) {
      console.warn("⚠️  Message from unknown client");
      return;
    }

    console.log(`📨 Message from ${client.id}:`, data.type);

    switch (data.type) {
      case "create-room":
        this.handleCreateRoom(ws, data);
        break;

      case "join-room":
        this.handleJoinRoom(ws, data);
        break;

      case "leave-room":
        this.handleLeaveRoom(ws);
        break;

      case "offer":
        this.handleOffer(ws, data);
        break;

      case "answer":
        this.handleAnswer(ws, data);
        break;

      case "ice-candidate":
        this.handleIceCandidate(ws, data);
        break;

      case "ping":
        // Respond to client ping
        this.sendMessage(ws, { type: "pong" });
        break;

      default:
        console.log("⚠️  Unknown message type:", data.type);
        this.sendError(ws, "Unknown message type");
    }
  }

  handleCreateRoom(ws, data) {
    const client = this.clients.get(ws);
    const { roomId } = data;

    if (!roomId) {
      this.sendError(ws, "Room ID is required");
      return;
    }

    // If client is already in this room, just confirm
    if (client.roomId === roomId) {
      console.log(`🏠 Client ${client.id} already in room ${roomId}`);
      this.sendMessage(ws, {
        type: "room-created",
        roomId: roomId,
      });
      this.sendPeersList(ws, roomId);
      return;
    }

    // Remove client from previous room if any
    if (client.roomId) {
      this.removeClientFromRoom(client);
    }

    // Check if room already exists
    if (this.rooms.has(roomId)) {
      // Room exists, join it instead
      console.log(`🏠 Room ${roomId} already exists, joining instead`);
      this.handleJoinRoom(ws, data);
      return;
    }

    // Create new room
    const room = new Set();
    room.add(client);
    this.rooms.set(roomId, room);
    client.roomId = roomId;

    console.log(`🏠 Room ${roomId} created by ${client.id}`);

    // Confirm room creation
    this.sendMessage(ws, {
      type: "room-created",
      roomId: roomId,
    });

    // Send empty peers list initially
    this.sendPeersList(ws, roomId);
  }

  handleJoinRoom(ws, data) {
    const client = this.clients.get(ws);
    const { roomId } = data;

    if (!roomId) {
      this.sendError(ws, "Room ID is required");
      return;
    }

    // If client is already in this room, just confirm
    if (client.roomId === roomId) {
      console.log(`👥 Client ${client.id} already in room ${roomId}`);
      this.sendMessage(ws, {
        type: "room-joined",
        roomId: roomId,
      });
      this.sendPeersList(ws, roomId);
      return;
    }

    // Remove client from previous room if any
    if (client.roomId) {
      this.removeClientFromRoom(client);
    }

    // Check if room exists, create if it doesn't
    if (!this.rooms.has(roomId)) {
      console.log(`🏠 Room ${roomId} doesn't exist, creating it`);
      const room = new Set();
      this.rooms.set(roomId, room);
    }

    const room = this.rooms.get(roomId);

    // Check room capacity (limit to 10 users per room)
    if (room.size >= 10) {
      this.sendError(ws, "Room is full");
      return;
    }

    // Add client to room
    room.add(client);
    client.roomId = roomId;

    console.log(
      `👥 Client ${client.id} joined room ${roomId} (${room.size} total)`
    );

    // Confirm room join
    this.sendMessage(ws, {
      type: "room-joined",
      roomId: roomId,
    });

    // Notify all other clients in room about new peer
    this.broadcastToRoom(
      roomId,
      {
        type: "peer-joined",
        peer: { id: client.id },
      },
      client.id
    );

    // Send peers list to new client
    this.sendPeersList(ws, roomId);
  }

  handleLeaveRoom(ws) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) {
      this.sendMessage(ws, {
        type: "room-left",
        success: true,
      });
      return;
    }

    this.removeClientFromRoom(client);

    this.sendMessage(ws, {
      type: "room-left",
      success: true,
    });
  }

  handleOffer(ws, data) {
    const client = this.clients.get(ws);
    const { offer, roomId, to } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    // Forward offer to specific peer
    const targetClient = this.findClientInRoom(roomId, to);
    if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
      this.sendMessage(targetClient.ws, {
        type: "offer",
        offer: offer,
        from: client.id,
      });
      console.log(`🤝 Offer forwarded from ${client.id} to ${to}`);
    } else {
      this.sendError(ws, "Target peer not found or disconnected");
    }
  }

  handleAnswer(ws, data) {
    const client = this.clients.get(ws);
    const { answer, roomId, to } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    // Forward answer to specific peer
    const targetClient = this.findClientInRoom(roomId, to);
    if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
      this.sendMessage(targetClient.ws, {
        type: "answer",
        answer: answer,
        from: client.id,
      });
      console.log(`✅ Answer forwarded from ${client.id} to ${to}`);
    } else {
      this.sendError(ws, "Target peer not found or disconnected");
    }
  }

  handleIceCandidate(ws, data) {
    const client = this.clients.get(ws);
    const { candidate, roomId, to } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    if (to) {
      // Send to specific peer
      const targetClient = this.findClientInRoom(roomId, to);
      if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(targetClient.ws, {
          type: "ice-candidate",
          candidate: candidate,
          from: client.id,
        });
        console.log(`🧊 ICE candidate sent from ${client.id} to ${to}`);
      }
    } else {
      // Broadcast to all other peers in room
      this.broadcastToRoom(
        roomId,
        {
          type: "ice-candidate",
          candidate: candidate,
          from: client.id,
        },
        client.id
      );
      console.log(`🧊 ICE candidate broadcasted from ${client.id}`);
    }
  }

  handleDisconnect(ws) {
    const client = this.clients.get(ws);
    if (!client) return;

    console.log(`❌ Client ${client.id} disconnected`);

    // Remove from room if in one
    if (client.roomId) {
      this.removeClientFromRoom(client);
    }

    // Remove from clients map
    this.clients.delete(ws);
  }

  removeClientFromRoom(client) {
    const { roomId } = client;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove client from room
    room.delete(client);

    // Notify other clients about peer leaving
    this.broadcastToRoom(
      roomId,
      {
        type: "peer-left",
        peerId: client.id,
      },
      client.id
    );

    // Clean up empty room
    if (room.size === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} deleted (empty)`);
    } else {
      console.log(
        `👋 Client ${client.id} left room ${roomId} (${room.size} remaining)`
      );
    }

    client.roomId = null;
  }

  findClientInRoom(roomId, clientId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    for (const client of room) {
      if (client.id === clientId) {
        return client;
      }
    }
    return null;
  }

  sendPeersList(ws, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const client = this.clients.get(ws);
    if (!client) return;

    const peers = Array.from(room)
      .filter((c) => c.id !== client.id)
      .map((c) => ({ id: c.id }));

    this.sendMessage(ws, {
      type: "peers-list",
      peers: peers,
      roomId: roomId,
    });

    console.log(`📋 Sent peers list to ${client.id}: ${peers.length} peers`);
  }

  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    let sentCount = 0;
    for (const client of room) {
      if (excludeClientId && client.id === excludeClientId) continue;

      if (client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
        sentCount++;
      } else {
        console.warn(`⚠️  Client ${client.id} has closed connection, removing`);
        // Clean up dead connections
        room.delete(client);
        this.clients.delete(client.ws);
      }
    }

    if (sentCount > 0) {
      console.log(`📡 Broadcasted to ${sentCount} clients in room ${roomId}`);
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn("⚠️  Attempted to send message to closed connection");
      return false;
    }
  }

  sendError(ws, message) {
    this.sendMessage(ws, {
      type: "error",
      message: message,
    });
  }

  // Utility methods for monitoring
  getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalClients: this.clients.size,
      rooms: {},
    };

    for (const [roomId, room] of this.rooms) {
      stats.rooms[roomId] = {
        clientCount: room.size,
        clients: Array.from(room).map((c) => c.id),
      };
    }

    return stats;
  }

  printStats() {
    const stats = this.getRoomStats();
    console.log("\n📊 Server Stats:");
    console.log(`   Total Rooms: ${stats.totalRooms}`);
    console.log(`   Total Clients: ${stats.totalClients}`);

    if (stats.totalRooms > 0) {
      console.log("   Room Details:");
      for (const [roomId, roomData] of Object.entries(stats.rooms)) {
        console.log(`     ${roomId}: ${roomData.clientCount} clients`);
      }
    }
    console.log("");
  }

  // Graceful shutdown
  shutdown() {
    console.log("\n🛑 Shutting down signaling server...");

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Notify all clients about shutdown
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendMessage(ws, {
          type: "server-shutdown",
          message: "Server is shutting down",
        });
      }
    });

    this.wss.close(() => {
      console.log("✅ Server closed gracefully");
    });
  }
}

// Create and start the server
const server = new SignalingServer(process.env.PORT || 3001);

// Optional: Print stats every 30 seconds
const statsInterval = setInterval(() => {
  const stats = server.getRoomStats();
  if (stats.totalClients > 0) {
    server.printStats();
  }
}, 30000);

// Graceful shutdown handlers
const gracefulShutdown = () => {
  clearInterval(statsInterval);
  server.shutdown();
  setTimeout(() => {
    process.exit(0);
  }, 5000);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = SignalingServer;
