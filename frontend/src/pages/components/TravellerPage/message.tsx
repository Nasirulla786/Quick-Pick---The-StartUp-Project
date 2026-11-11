
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  MessageCircle,
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

interface IChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

const Message = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const { myTrips } = useSelector((state: RootState) => state.trips);

  const [selectedParcel, setSelectedParcel] =
    useState<IParcelRequest | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Get all accepted parcels from all trips
  const acceptedParcels: IParcelRequest[] = Array.from(
    new Map(
      myTrips
        .flatMap((trip) => trip.parcels || [])
        .filter((parcel) => parcel.requestStatus === "accepted")
        .map((parcel) => [parcel._id, parcel])
    ).values()
  );

  // Logged-in traveller sends message to sender
  const receiver = selectedParcel?.sender;

  // Fetch messages
  const getMessages = async () => {
    if (!receiver) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/chat/get-messages/${receiver}`
      );

      // Backend should return an array of populated messages
      const data = response.data;

      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Get messages error:", error);
      setError("Messages load nahi ho paaye.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when selected parcel changes
  useEffect(() => {
    if (selectedParcel) {
      getMessages();
    } else {
      setMessages([]);
      setError("");
    }
  }, [selectedParcel?._id]);

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

      const response = await api.post(
        `/chat/send-message/${receiver}`,
        {
          message: trimmedMessage,
        }
      );

      // Backend response uses "text"
      setMessages((prev) => [...prev, response.data]);
      setMessage("");
    } catch (error) {
      console.log("Send message error:", error);
      setError("Message send nahi ho paaya.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
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
        <div className="grid h-[calc(100vh-190px)] min-h-[550px] overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] md:grid-cols-[320px_1fr]">

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
            } min-w-0 flex-col`}
          >
            {selectedParcel ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:p-5">
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
                      {selectedParcel.title}
                    </h2>

                    <p className="mt-1 text-xs text-[#bef264]">
                      Accepted Parcel
                    </p>
                  </div>

                  <span className="rounded-full bg-[#bef264]/10 px-3 py-1 text-xs font-semibold text-[#bef264]">
                    Accepted
                  </span>
                </div>

                {/* Parcel Information */}
                <div className="border-b border-white/10 bg-[#0d1527] p-4">
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
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
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
                        String(msg.sender) === String(userData?._id);

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
                              <p className="mt-1 text-right text-[10px] opacity-60">
                                {new Date(
                                  msg.createdAt
                                ).toLocaleTimeString([], {
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

                {/* Error while sending */}
                {error && messages.length > 0 && (
                  <p className="px-4 pb-2 text-center text-xs text-red-400">
                    {error}
                  </p>
                )}

                {/* Message Input */}
                <div className="border-t border-white/10 p-4">
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
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
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
