
import React, { useEffect, useRef, useState } from "react";
import type { RootState } from "@/redux/stores/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
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
  createdAt?: string;
  updatedAt?: string;
}

interface IncomingMessage {
  senderId: string;
  text: string;
}

const SenderChatpage = () => {
  const { id } = useParams();

  const { userData } = useSelector(
    (state: RootState) => state.auth
  );

  const senderId = userData?._id;
  const receiverId = id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch message history
  const getMessages = async () => {
    if (!receiverId || !senderId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/chat/get-messages/${receiverId}`
      );

      setMessages(response.data);
    } catch (error) {
      console.log("Get messages error:", error);
      setError("Messages load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  // Realtime socket connection
  useEffect(() => {
    if (!senderId || !receiverId) return;

    socket.connect();

    const handleReceiveMessage = (newMessage: IncomingMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `${Date.now()}-${Math.random()}`,
          sender: newMessage.senderId,
          receiver: senderId,
          text: newMessage.text,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [senderId, receiverId]);

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
      });

      // Update sender's chat
      setMessages((prev) => [...prev, response.data]);
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
  }, [receiverId, senderId]);

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
    <div className="min-h-screen bg-[#0b1020] p-3 text-white sm:p-6">
      <div className="mx-auto flex h-[calc(100vh-24px)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] shadow-2xl sm:h-[calc(100vh-48px)]">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#111a2e] px-4 py-4 sm:px-6">
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
            <h2 className="font-semibold text-white">Chat</h2>
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
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#0d1527] px-5 py-3">
          <MessageCircle size={17} className="text-[#bef264]" />
          <p className="text-xs text-slate-400">
            Discuss pickup, delivery and parcel details here.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-slate-400">
              <Loader2 size={20} className="animate-spin text-[#bef264]" />
              <span className="text-sm">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
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
            messages.map((msg) => {
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
                      <p
                        className={`mt-1 text-right text-[10px] ${
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
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between gap-3 border-t border-red-500/20 bg-red-500/5 px-4 py-3">
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
          className="border-t border-white/10 bg-[#111a2e] p-3 sm:p-4"
        >
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1527] p-2 transition focus-within:border-[#bef264]/40">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
