
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { RootState } from "@/redux/stores/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Send,
  UserRound,
  Loader2,
  RefreshCw,
} from "lucide-react";

import api from "@/services/Axios";
import { socket } from "@/socket/socket";

interface Message {
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

const SenderChatpage = () => {
  const { id } = useParams();

  const { userData } = useSelector(
    (state: RootState) => state.auth
  );

  const senderId = userData?._id;
  const receiverId = id;
  const activeConversationRef = useRef("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receiverProfile, setReceiverProfile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const receiverName =
    receiverProfile && receiverProfile.id === receiverId
      ? receiverProfile.name
      : "";

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const peerTypingTimeoutRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);

  useEffect(() => {
    activeConversationRef.current = `${senderId || ""}:${receiverId || ""}`;
  }, [senderId, receiverId]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingActiveRef.current && receiverId) {
      socket.emit("stop-typing", { receiverId });
      typingActiveRef.current = false;
    }
  }, [receiverId]);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!receiverId) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!typingActiveRef.current) {
      socket.emit("typing", { receiverId });
      typingActiveRef.current = true;
    }
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(stopTyping, 1500);
  };

  // Fetch message history
  const getMessages = useCallback(async () => {
    if (!receiverId || !senderId) return;

    const requestKey = `${senderId}:${receiverId}`;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/chat/get-messages/${receiverId}`
      );
      if (activeConversationRef.current !== requestKey) return;
      const history = Array.isArray(response.data)
        ? response.data.filter(
            (msg: Message) =>
              (String(msg.sender) === String(senderId) &&
                String(msg.receiver) === String(receiverId)) ||
              (String(msg.sender) === String(receiverId) &&
                String(msg.receiver) === String(senderId)),
          )
        : [];

      setMessages((current) => {
        const relevantMessages = current.filter(
          (msg) =>
            (String(msg.sender) === String(senderId) &&
              String(msg.receiver) === String(receiverId)) ||
            (String(msg.sender) === String(receiverId) &&
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
      if (activeConversationRef.current !== requestKey) return;
      console.log("Get messages error:", error);
      setError("Messages load nahi ho paaye.");
    } finally {
      if (activeConversationRef.current === requestKey) setLoading(false);
    }
  }, [receiverId, senderId]);

  // Realtime socket connection
  useEffect(() => {
    if (!senderId || !receiverId) return;

    const handleReceiveMessage = (newMessage: IncomingMessage) => {
      if (String(newMessage.senderId) !== String(receiverId)) return;

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
      if (String(typingSenderId) !== String(receiverId)) return;
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
      if (String(typingSenderId) !== String(receiverId)) return;
      setIsPeerTyping(false);
      if (peerTypingTimeoutRef.current !== null) {
        window.clearTimeout(peerTypingTimeoutRef.current);
        peerTypingTimeoutRef.current = null;
      }
    };

    const markConversationSeen = () => {
      socket.emit("mark-seen", { receiverId });
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
  }, [senderId, receiverId, stopTyping]);

  useEffect(() => {
    if (!receiverId) return;
    let active = true;

    api.get(`/auth/user/profile/${receiverId}`)
      .then((response) => {
        if (active) {
          setReceiverProfile({ id: receiverId, name: response.data.user.name });
        }
      })
      .catch((error) => {
        console.error("Get chat participant error:", error);
      });

    return () => {
      active = false;
    };
  }, [receiverId]);

  // Send message
  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !receiverId || sending) return;

    try {
      setSending(true);
      setError("");

      // Save message in MongoDB through REST API
      const response = await api.post(
        `/chat/send-message/${receiverId}`,
        {
          message: trimmedMessage,
        }
      );

      // Send realtime message to receiver
      socket.emit("send-message", {
        receiverId,
        text: trimmedMessage,
        messageId: response.data._id,
      });

      // Update sender's chat
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

  // Fetch history when chat opens
  useEffect(() => {
    getMessages();
  }, [getMessages]);

  const visibleMessages = messages.filter(
    (msg) =>
      (String(msg.sender) === String(senderId) &&
        String(msg.receiver) === String(receiverId)) ||
      (String(msg.sender) === String(receiverId) &&
        String(msg.receiver) === String(senderId)),
  );

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!senderId || !receiverId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-slate-400">
        User information unavailable.
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#0b1020] p-3 text-white sm:p-6">
      <div className="mx-auto flex h-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#111a2e] px-4 py-4 sm:px-6">
          <button
            onClick={() => window.history.back()}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#bef264]/10 text-[#bef264]">
            <UserRound size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-white">
              {receiverName || "Chat"}
            </h2>
            <p className="truncate text-xs text-slate-400">
              {receiverId}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#bef264]/20 bg-[#bef264]/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#bef264]" />
            <span className="text-xs font-medium text-[#bef264]">
              Quick & Pick
            </span>
          </div>
        </div>

        {/* Chat Information */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d1527] px-5 py-3">
          <MessageCircle size={17} className="text-[#bef264]" />
          <p className="text-xs text-slate-400">
            Discuss pickup, delivery and parcel details here.
          </p>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-slate-400">
              <Loader2 size={20} className="animate-spin text-[#bef264]" />
              <span className="text-sm">Loading messages...</span>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#bef264]/10 text-[#bef264]">
                <MessageCircle size={30} />
              </div>

              <h3 className="text-lg font-semibold text-white">
                No messages yet
              </h3>

              <p className="mt-2 max-w-xs text-sm text-slate-400">
                Start your conversation! Send a message to discuss your parcel.
              </p>
            </div>
          ) : (
            visibleMessages.map((msg) => {
              const isSender =
                String(msg.sender) === String(senderId);

              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                      isSender
                        ? "rounded-br-sm bg-[#bef264] text-[#0b1020]"
                        : "rounded-bl-sm border border-white/10 bg-[#1a2942] text-white"
                    }`}
                  >
                    <p className="break-words text-sm leading-relaxed">
                      {msg.text}
                    </p>

                    {msg.createdAt && (
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <p
                          className={`text-[10px] ${
                            isSender
                              ? "text-[#0b1020]/60"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isSender &&
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
              <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-[#1a2942] px-4 py-2 text-xs text-slate-400">
                Typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-xs text-red-400">{error}</p>

            <button
              onClick={getMessages}
              className="flex items-center gap-1 text-xs text-[#bef264] hover:underline"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="shrink-0 border-t border-white/10 bg-[#111a2e] p-3 sm:p-4"
        >
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1527] p-2 transition focus-within:border-[#bef264]/40">
            <input
              type="text"
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#bef264] px-4 py-3 text-sm font-semibold text-[#0b1020] transition hover:bg-[#d9ff87] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}

              <span className="hidden sm:inline">
                {sending ? "Sending..." : "Send"}
              </span>
            </button>
          </div>

          <p className="mt-2 px-2 text-[10px] text-slate-500">
            Keep your communication clear and related to your parcel.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SenderChatpage;
