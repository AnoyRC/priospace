"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Share,
  Users,
  Wifi,
  Download,
  Upload,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WebRTCShareModal({
  onClose,
  dailyTasks,
  customTags,
  habits,
  darkMode,
  theme,
  onImportData,
}) {
  // State management
  const [isHost, setIsHost] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("idle"); // idle, hosting, connecting, connected, shared, error
  const [nearbyPeers, setNearbyPeers] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [receivedData, setReceivedData] = useState(null);
  const [showReceivedData, setShowReceivedData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serverUrl, setServerUrl] = useState("ws://api.prio.space");
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Refs
  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // WebSocket and signaling functions
  const connectToSignalingServer = () => {
    try {
      wsRef.current = new WebSocket(serverUrl);

      wsRef.current.onopen = () => {
        console.log("Connected to signaling server");
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await handleSignalingMessage(message);
      };

      wsRef.current.onclose = () => {
        console.log("Disconnected from signaling server");
        if (status !== "idle" && status !== "shared") {
          setStatus("error");
          setErrorMessage("Lost connection to signaling server");
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("error");
        setErrorMessage(
          "Cannot connect to signaling server. Make sure the server is running."
        );
      };
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to connect to signaling server");
    }
  };

  const handleSignalingMessage = async (message) => {
    switch (message.type) {
      case "room-created":
        setStatus("hosting");
        setRoomId(message.roomId);
        break;

      case "peers-list":
        setNearbyPeers(message.peers);
        break;

      case "peer-joined":
        setNearbyPeers((prev) => [...prev, message.peer]);
        break;

      case "peer-left":
        setNearbyPeers((prev) => prev.filter((p) => p.id !== message.peerId));
        break;

      case "offer":
        await handleReceiveOffer(message.offer, message.from);
        break;

      case "answer":
        await handleReceiveAnswer(message.answer);
        break;

      case "ice-candidate":
        await handleReceiveIceCandidate(message.candidate);
        break;

      case "error":
        setStatus("error");
        setErrorMessage(message.message);
        break;
    }
  };

  // WebRTC peer connection functions
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            roomId: roomId,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setStatus("connected");
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setStatus("error");
        setErrorMessage("Connection failed");
      }
    };

    return pc;
  };

  // Room management functions
  const startHosting = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setStatus("hosting");

    connectToSignalingServer();

    setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "create-room",
            roomId: newRoomId,
          })
        );
      }
    }, 1000);
  };

  const joinRoom = (inputRoomId) => {
    setRoomId(inputRoomId);
    setIsClient(true);
    setStatus("connecting");

    connectToSignalingServer();

    setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "join-room",
            roomId: inputRoomId,
          })
        );
      }
    }, 1000);
  };

  // Data sharing functions
  const sendDataToPeer = async (peerId) => {
    try {
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Create data channel
      const dataChannel = pc.createDataChannel("todoData", {
        ordered: true,
      });

      dataChannel.onopen = () => {
        console.log("Data channel opened");
        const todoData = {
          dailyTasks,
          customTags,
          habits,
          darkMode,
          theme,
          exportDate: new Date().toISOString(),
          version: "3.0",
        };
        dataChannel.send(JSON.stringify(todoData));
        setStatus("shared");

        // Close modal after successful data send (Host side)
        setTimeout(() => {
          onClose();
        }, 1000);
      };

      dataChannel.onerror = (error) => {
        console.error("Data channel error:", error);
        setStatus("error");
        setErrorMessage("Failed to send data");
      };

      dataChannelRef.current = dataChannel;

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "offer",
            offer: offer,
            roomId: roomId,
            to: peerId,
          })
        );
      }
    } catch (error) {
      console.error("Error sending data:", error);
      setStatus("error");
      setErrorMessage("Failed to send data");
    }
  };

  // WebRTC message handlers
  const handleReceiveOffer = async (offer, from) => {
    try {
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onmessage = (event) => {
          try {
            const receivedTodoData = JSON.parse(event.data);
            setReceivedData(receivedTodoData);
            // On client side, when data is received, reset status to 'idle' to hide connected section
            setStatus("idle");
            setIsClient(false);
            setIsHost(false);
          } catch (error) {
            console.error("Error parsing received data:", error);
          }
        };
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "answer",
            answer: answer,
            roomId: roomId,
            to: from,
          })
        );
      }
    } catch (error) {
      console.error("Error handling offer:", error);
      setStatus("error");
      setErrorMessage("Failed to handle connection");
    }
  };

  const handleReceiveAnswer = async (answer) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleReceiveIceCandidate = async (candidate) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  // Data import function
  const importReceivedData = () => {
    if (receivedData && onImportData) {
      onImportData(receivedData);
      // Auto-close modal immediately after importing data
      onClose();
    }
  };

  // Cleanup functions
  const resetState = () => {
    setIsHost(false);
    setIsClient(false);
    setRoomId("");
    setStatus("idle");
    setNearbyPeers([]);
    setSelectedPeer(null);
    setReceivedData(null);
    setShowReceivedData(false);
    setErrorMessage("");
    setCopySuccess(false);

    if (wsRef.current) {
      wsRef.current.close();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const modalVariants = {
    hidden: { y: "100%", opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        variants={modalVariants}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <motion.div
          className="flex justify-center pt-4 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </motion.div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  delay: 0.25,
                  type: "spring",
                  stiffness: 300,
                }}
                className="p-2.5 bg-primary/10 rounded-xl"
              >
                <Share className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                Sync Tasks
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 dark:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Server Configuration */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-4 w-4" />
                Server URL
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="p-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <AnimatePresence>
              {showServerConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <Input
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="ws://api.prio.space"
                    className="border-2 border-gray-300 font-medium focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-800 py-3"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Enter your WebRTC signaling server URL
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Status Display - Only show when not idle and no received data */}
          {status !== "idle" && !receivedData && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
            >
              <div className="flex items-center gap-3">
                {status === "hosting" && (
                  <Wifi className="h-5 w-5 text-green-500 animate-pulse" />
                )}
                {status === "connecting" && (
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {status === "connected" && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                {status === "shared" && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                {status === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}

                <div className="flex-1">
                  <div className="font-extrabold text-gray-900 dark:text-gray-100">
                    {status === "hosting" && `Hosting Room: ${roomId}`}
                    {status === "connecting" && "Connecting..."}
                    {status === "connected" && "Connected!"}
                    {status === "shared" && "Todo Shared!"}
                    {status === "error" && "Connection Error"}
                  </div>
                  {errorMessage && (
                    <div className="text-sm text-red-500 font-medium">
                      {errorMessage}
                    </div>
                  )}
                </div>

                {/* Copy button for room ID when hosting */}
                {status === "hosting" && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={copyRoomId}
                      size="sm"
                      variant="outline"
                      className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Close button when shared */}
                {status === "shared" && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={onClose}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 rounded-xl font-extrabold"
                    >
                      Close
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Received Data Display */}
          {receivedData && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 rounded-xl border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-800/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <span className="font-extrabold text-green-700 dark:text-green-300">
                    Data Received!
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReceivedData(!showReceivedData)}
                  className="p-1"
                >
                  {showReceivedData ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {showReceivedData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-green-600 dark:text-green-400 mb-3 font-mono bg-white dark:bg-gray-800 p-3 rounded-xl border border-green-200 dark:border-green-700 max-h-32 overflow-y-auto"
                  >
                    <div>
                      Tasks: {Object.keys(receivedData.dailyTasks || {}).length}{" "}
                      days
                    </div>
                    <div>
                      Custom Tags: {(receivedData.customTags || []).length}
                    </div>
                    <div>Habits: {(receivedData.habits || []).length}</div>
                    <div>Theme: {receivedData.theme || "default"}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={importReceivedData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-extrabold py-3"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import This Data
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Main Content */}
          {status === "idle" && !receivedData && (
            <motion.div variants={contentVariants} className="space-y-4">
              {/* Host Option */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100">
                        Host a Room
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Share your tasks with others
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={startHosting}
                      variant="outline"
                      size="sm"
                      className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                    >
                      <Wifi className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="text-center text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider text-sm"
              >
                OR
              </motion.div>

              {/* Join Option */}
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Join Room
                </label>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="flex-1 border-2 border-gray-300 font-medium focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-800 py-3"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => joinRoom(roomId)}
                      disabled={!roomId.trim()}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-extrabold"
                    >
                      <Users className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Hosting View */}
          {status === "hosting" && (
            <motion.div variants={contentVariants} className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="text-center p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700"
              >
                <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-wider">
                  {roomId}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">
                  Share this Room ID with others
                </div>
              </motion.div>

              {nearbyPeers.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100 mb-3 text-lg">
                    Connected Users ({nearbyPeers.length})
                  </h3>
                  <div className="space-y-3">
                    {nearbyPeers.map((peer) => (
                      <motion.div
                        key={peer.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-extrabold text-gray-900 dark:text-gray-100">
                            User {peer.id.slice(-4)}
                          </span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => sendDataToPeer(peer.id)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 rounded-xl font-extrabold"
                          >
                            <Share className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600"
              >
                <div className="text-gray-500 dark:text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                  Waiting for users to join...
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Reset Button - Only show when status is not idle and no received data */}
          {status !== "idle" && status !== "shared" && !receivedData && (
            <motion.div
              variants={itemVariants}
              className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={resetState}
                  variant="outline"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold py-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
