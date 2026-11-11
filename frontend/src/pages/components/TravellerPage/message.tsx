
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  MessageCircle,
  Package,
  MapPin,
  Send,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import type { RootState } from "@/redux/stores/store";
import type { IParcelRequest } from "@/redux/slices/tripSlice";

interface IParcel {
  _id: string;
  title: string;
  sender: string;
  traveller: string;
  trip: string;
  from: string;
  to: string;
  weight: number;
  budget: number;
  requestStatus: string;
  status: string;
}


export interface TravelRequest {
  _id: string;
  budget: number;
  createdAt: string;
  date: string;
  from: string;
  requestStatus: "accepted" | "rejected" | "pending";
  sender: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  title: string;
  to: string;
  traveller: string;
  trip: string;
  updatedAt: string;
  weight: number;
  __v: number;
}

const Message = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const { myTrips } = useSelector((state: RootState) => state.trips);

  const [selectedParcel, setSelectedParcel] = useState<IParcelRequest | null>(null);
  const [message, setMessage] = useState("");

  // Get all accepted parcels from all trips
  const acceptedParcels: IParcelRequest[] = Array.from(
    new Map(
      myTrips
        .flatMap((trip) => trip.parcels || [])
        .filter((parcel) => parcel.requestStatus === "accepted")
        .map((parcel) => [parcel._id, parcel])
    ).values()
  );
  console.log("this is accepted", acceptedParcels);

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
          <div className={`${selectedParcel ? "hidden md:flex" : "flex"} flex-col border-r border-white/10`}>

            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Accepted Parcels</h2>

                <span className="rounded-full bg-[#bef264]/10 px-3 py-1 text-xs font-bold text-[#bef264]">
                  {acceptedParcels.length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">

              {acceptedParcels.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Package className="mx-auto mb-3 text-slate-500" size={35} />
                  <p className="font-medium text-slate-300">
                    No conversations yet
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Accepted parcel requests will appear here.
                  </p>
                </div>
              ) : (
                acceptedParcels.map((parcel: IParcelRequest) => (
                  <button
                    key={parcel._id}
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setMessage("");
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedParcel?._id === parcel._id
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

                      <CheckCircle2 size={16} className="shrink-0 text-[#bef264]" />
                    </div>
                  </button>
                ))
              )}

            </div>
          </div>

          {/* Right Chat Area */}
          <div className={`${selectedParcel ? "flex" : "hidden md:flex"} min-w-0 flex-col`}>

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
                      <p className="text-xs text-slate-500">Parcel Route</p>
                      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <MapPin size={15} className="text-[#bef264]" />
                        {selectedParcel.from}
                        <span className="text-[#bef264]">→</span>
                        {selectedParcel.to}
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-xs text-slate-500">Weight</p>
                      <p className="mt-1 font-semibold">
                        {selectedParcel.weight} kg
                      </p>
                    </div>

                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bef264]/10 text-[#bef264]">
                    <MessageCircle size={30} />
                  </div>

                  <h3 className="text-lg font-semibold">
                    Start a conversation
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Your conversation with the parcel sender will appear here.
                    Discuss pickup, delivery and other details.
                  </p>

                  <p className="mt-4 rounded-lg border border-white/10 bg-[#0d1527] px-4 py-2 text-xs text-slate-500">
                    Chat messaging integration is not connected yet.
                  </p>

                </div>

                {/* Message Input - UI Preview */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1527] p-2">

                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Messaging will be available soon..."
                      disabled
                      className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
                    />

                    <button
                      disabled
                      className="rounded-lg bg-[#bef264] p-3 text-[#0b1020] opacity-50"
                    >
                      <Send size={17} />
                    </button>

                  </div>
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
                  Select an accepted parcel from the left to open its conversation.
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
