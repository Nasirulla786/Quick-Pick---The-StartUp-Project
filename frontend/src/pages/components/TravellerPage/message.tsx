
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  MessageCircle,
  Check,
  CheckCheck,
  Package,
  MapPin,
  Send,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import type { RootState } from "@/redux/stores/store";
import type { IParcelRequest } from "@/redux/slices/tripSlice";
import api from "@/services/Axios";
import { socket } from "@/socket/socket";

interface IChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  status?: "sent" | "delivered" | "seen";
  createdAt?: string;
  updatedAt?: string;
}

interface IncomingMessage {
  _id?: string;
  senderId: string;
  text: string;
  status?: "sent" | "delivered" | "seen";
  createdAt?: string;
}

interface MessageStatusUpdate {
  messageId: string;
  status: "sent" | "delivered" | "seen";
}

const Message = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const { myTrips } = useSelector((state: RootState) => state.trips);

  const senderId = userData?._id;

  const [selectedParcel, setSelectedParcel] =
    useState<IParcelRequest | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [senderProfile, setSenderProfile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const peerTypingTimeoutRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);

  // Get accepted parcels
  const acceptedParcels: IParcelRequest[] = Array.from(
    new Map(
      myTrips
        .flatMap((trip) => trip.parcels || [])
        .filter((parcel) => parcel.requestStatus === "accepted")
        .map((parcel) => [parcel._id, parcel])
    ).values()
  );

  // Selected parcel sender
  const receiver = selectedParcel?.sender;
  const senderName =
    senderProfile && senderProfile.id === receiver ? senderProfile.name : "";

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingActiveRef.current && receiver) {
      socket.emit("stop-typing", { receiverId: receiver });
      typingActiveRef.current = false;
    }
  }, [receiver]);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!receiver) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!typingActiveRef.current) {
      socket.emit("typing", { receiverId: receiver });
      typingActiveRef.current = true;
    }
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(stopTyping, 1500);
  };

  // Fetch messages
  const getMessages = useCallback(async () => {
    if (!receiver) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/chat/get-messages/${receiver}`
      );
      const history = Array.isArray(response.data) ? response.data : [];

      setMessages((current) => {
        const relevantMessages = current.filter(
          (msg) =>
            (String(msg.sender) === String(senderId) &&
              String(msg.receiver) === String(receiver)) ||
            (String(msg.sender) === String(receiver) &&
              String(msg.receiver) === String(senderId)),
        );
        const byId = new Map(
          relevantMessages.map((msg) => [msg._id, msg]),
        );
        for (const msg of history) {
          byId.set(msg._id, { ...byId.get(msg._id), ...msg });
        }
        return Array.from(byId.values());
      });
    } catch (error) {
      console.log("Get messages error:", error);
      setError("Messages load nahi ho paaye.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [receiver, senderId]);

  // Realtime socket connection and listener
  useEffect(() => {
    if (!senderId) return;

    const handleReceiveMessage = (newMessage: IncomingMessage) => {
      // Only show messages from the currently selected conversation
      if (String(newMessage.senderId) !== String(receiver)) return;

      setMessages((prev) => {
        const messageId = newMessage._id || `${Date.now()}-${Math.random()}`;
        const incoming = {
          _id: messageId,
          sender: newMessage.senderId,
          receiver: senderId,
          text: newMessage.text,
          status: newMessage.status,
          createdAt: newMessage.createdAt || new Date().toISOString(),
        };
        const existingIndex = prev.findIndex((msg) => msg._id === messageId);
        if (existingIndex < 0) return [...prev, incoming];
        return prev.map((msg, index) =>
          index === existingIndex ? { ...msg, ...incoming } : msg,
        );
      });
      setIsPeerTyping(false);
      socket.emit("mark-seen", { receiverId: newMessage.senderId });
    };

    const handleMessageStatus = (update: MessageStatusUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === update.messageId
            ? { ...msg, status: update.status }
            : msg,
        ),
      );
    };

    const handleTyping = ({ senderId: typingSenderId }: { senderId: string }) => {
      if (String(typingSenderId) !== String(receiver)) return;
      setIsPeerTyping(true);
      if (peerTypingTimeoutRef.current !== null) {
        window.clearTimeout(peerTypingTimeoutRef.current);
      }
      peerTypingTimeoutRef.current = window.setTimeout(
        () => setIsPeerTyping(false),
        2000,
      );
    };

    const handleStopTyping = ({ senderId: typingSenderId }: { senderId: string }) => {
      if (String(typingSenderId) !== String(receiver)) return;
      setIsPeerTyping(false);
      if (peerTypingTimeoutRef.current !== null) {
        window.clearTimeout(peerTypingTimeoutRef.current);
        peerTypingTimeoutRef.current = null;
      }
    };

    const markConversationSeen = () => {
      if (receiver) socket.emit("mark-seen", { receiverId: receiver });
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-status", handleMessageStatus);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("connect", markConversationSeen);
    socket.connect();
    if (socket.connected) markConversationSeen();

    return () => {
      stopTyping();
      if (peerTypingTimeoutRef.current !== null) {
        window.clearTimeout(peerTypingTimeoutRef.current);
      }
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-status", handleMessageStatus);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("connect", markConversationSeen);
      socket.disconnect();
    };
  }, [senderId, receiver, stopTyping]);

  useEffect(() => {
    if (!receiver) {
      return;
    }

    let active = true;

    api.get(`/auth/user/profile/${receiver}`)
      .then((response) => {
        if (active) {
          setSenderProfile({ id: receiver, name: response.data.user.name });
        }
      })
      .catch((error) => {
        console.error("Get chat participant error:", error);
      });

    return () => {
      active = false;
    };
  }, [receiver]);

  // Fetch messages when parcel changes
  useEffect(() => {
    if (selectedParcel) {
      getMessages();
    } else {
      setMessages([]);
      setError("");
    }
  }, [selectedParcel, getMessages]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !receiver || sending) return;

    try {
      setSending(true);
      setError("");

      // Save message in database
      const response = await api.post(
        `/chat/send-message/${receiver}`,
        {
          message: trimmedMessage,
        }
      );

      // Send realtime message to receiver
      socket.emit("send-message", {
        receiverId: receiver,
        text: trimmedMessage,
        messageId: response.data._id,
      });

      // Update sender's UI
      setMessages((prev) => [...prev, response.data]);
      stopTyping();
      setMessage("");
    } catch (error) {
      console.log("Send message error:", error);
      setError("Message send nahi ho paaya.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-140px)] min-h-0 overflow-hidden bg-[#0b1020] p-4 text-white sm:h-[calc(100dvh-164px)] sm:p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col">

        {/* Header */}
        <div className="mb-6 shrink-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bef264]">
            <MessageCircle size={18} />
            Quick & Pick Messages
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Your Conversations
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Chat with senders of your accepted parcels.
          </p>
        </div>

        {/* Chat Layout */}
        <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] md:grid-cols-[320px_1fr]">

          {/* Left Sidebar */}
          <div
            className={`${
              selectedParcel ? "hidden md:flex" : "flex"
            } flex-col border-r border-white/10`}
          >
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Accepted Parcels
                </h2>

                <span className="rounded-full bg-[#bef264]/10 px-3 py-1 text-xs font-bold text-[#bef264]">
                  {acceptedParcels.length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {acceptedParcels.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Package
                    className="mx-auto mb-3 text-slate-500"
                    size={35}
                  />

                  <p className="font-medium text-slate-300">
                    No conversations yet
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Accepted parcel requests will appear here.
                  </p>
                </div>
              ) : (
                acceptedParcels.map((parcel) => (
                  <button
                    key={parcel._id}
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setMessage("");
                      setMessages([]);
                      setError("");
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedParcel?._id === parcel._id
                        ? "border-[#bef264]/40 bg-[#bef264]/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#bef264]/10 text-[#bef264]">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {parcel.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {parcel.from} → {parcel.to}
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-[#bef264]"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Chat Area */}
          <div
            className={`${
              selectedParcel ? "flex" : "hidden md:flex"
            } min-h-0 min-w-0 flex-col`}
          >
            {selectedParcel ? (
              <>
                {/* Chat Header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-white/10 p-4 sm:p-5">
                  <button
                    onClick={() => setSelectedParcel(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#bef264]/10 text-[#bef264]">
                    <Package size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold">
                      {senderName || "Sender"}
                    </h2>

                    <p className="mt-1 truncate text-xs text-[#bef264]">
                      {selectedParcel.title} · Accepted Parcel
                    </p>
                  </div>

                  <span className="rounded-full bg-[#bef264]/10 px-3 py-1 text-xs font-semibold text-[#bef264]">
                    Accepted
                  </span>
                </div>

                {/* Parcel Information */}
                <div className="shrink-0 border-b border-white/10 bg-[#0d1527] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Parcel Route
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <MapPin size={15} className="text-[#bef264]" />
                        {selectedParcel.from}
                        <span className="text-[#bef264]">→</span>
                        {selectedParcel.to}
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-xs text-slate-500">
                        Weight
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedParcel.weight} kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                  {loading ? (
                    <div className="m-auto flex items-center gap-2 text-sm text-slate-400">
                      <Loader2
                        size={18}
                        className="animate-spin text-[#bef264]"
                      />
                      Loading messages...
                    </div>
                  ) : error && messages.length === 0 ? (
                    <div className="m-auto text-center">
                      <p className="text-sm text-red-400">
                        {error}
                      </p>

                      <button
                        onClick={getMessages}
                        className="mt-3 inline-flex items-center gap-2 text-sm text-[#bef264]"
                      >
                        <RefreshCw size={14} />
                        Try again
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="m-auto text-center">
                      <MessageCircle
                        size={30}
                        className="mx-auto mb-3 text-[#bef264]"
                      />

                      <h3 className="font-semibold">
                        Start a conversation
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Send your first message to the parcel sender.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe =
                        String(msg.sender) === String(senderId);

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              isMe
                                ? "rounded-br-sm bg-[#bef264] text-[#0b1020]"
                                : "rounded-bl-sm bg-[#1e293b] text-white"
                            }`}
                          >
                            <p className="break-words text-sm">
                              {msg.text}
                            </p>

                            {msg.createdAt && (
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <p className="text-right text-[10px] opacity-60">
                                  {new Date(
                                    msg.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {isMe &&
                                  (msg.status === "seen" ? (
                                    <CheckCheck
                                      size={14}
                                      aria-label="Seen"
                                      className="text-sky-500"
                                    />
                                  ) : msg.status === "delivered" ? (
                                    <CheckCheck
                                      size={14}
                                      aria-label="Delivered"
                                      className="text-slate-500"
                                    />
                                  ) : (
                                    <Check
                                      size={14}
                                      aria-label="Sent"
                                      className="text-slate-500"
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {isPeerTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-sm bg-[#1e293b] px-4 py-2 text-xs text-slate-400">
                        Typing...
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Error */}
                {error && messages.length > 0 && (
                  <p className="shrink-0 px-4 pb-2 text-center text-xs text-red-400">
                    {error}
                  </p>
                )}

                {/* Message Input */}
                <div className="shrink-0 border-t border-white/10 p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1527] p-2"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
                    />

                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="rounded-lg bg-[#bef264] p-3 text-[#0b1020] disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Send size={17} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#bef264]/10 text-[#bef264]">
                  <MessageCircle size={36} />
                </div>

                <h2 className="text-xl font-bold">
                  Your Messages
                </h2>

                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  Select an accepted parcel from the left to open its
                  conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
