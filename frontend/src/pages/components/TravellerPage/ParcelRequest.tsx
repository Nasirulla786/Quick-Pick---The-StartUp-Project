
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, CalendarDays, Package, Eye, Check, X, MessageCircle } from "lucide-react";

import type { RootState } from "@/redux/stores/store";
import {

  type ITrip,
  type IParcelRequest,
  setMyTrips,
} from "@/redux/slices/tripSlice";


import api from "@/services/Axios";


const ParcelRequest = () => {
  const dispatch = useDispatch();

  const { myTrips } = useSelector(
    (state: RootState) => state.trips
  );

  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);
  const [selectedParcel, setSelectedParcel] =
    useState<IParcelRequest | null>(null);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Remove duplicate parcel IDs from a trip
  const getUniqueParcels = (parcels: IParcelRequest[]) => {
    return Array.from(
      new Map(parcels.map((parcel) => [parcel._id, parcel])).values()
    );
  };


  const handleRequest = async (
    parcel: IParcelRequest,
    payload: {
      requestStatus: "accepted" | "rejected";
      traveller?: string;
      trip?: string;
    }
  ) => {
    try {
      setLoadingId(parcel._id);

      const res = await api.post(
        `/parcels/parcel-request-change/${parcel._id}`,
        payload
      );


   
      // Update selected parcel
      setSelectedParcel(res.data.parcel);

      // Update Redux trips
      const updatedTrips = myTrips.map((item) => ({
        ...item,
        parcels: item.parcels.map((p) =>
          p._id === parcel._id ? res.data.parcel : p
        ),
      }));

      dispatch(setMyTrips(updatedTrips));
      setMessage(res.data.message);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoadingId(null);
    }
  };

  // Accept or reject parcel request
  const handleRejectRequest = async () => {


    if (!selectedParcel) return;

    await handleRequest(selectedParcel, {
      requestStatus: "rejected",
    });




  }


  const handleAcceptRequest = async () => {

    if (!selectedParcel || !selectedTrip) return;

    await handleRequest(selectedParcel, {
      traveller: selectedTrip.traveller,
      trip: selectedTrip._id,
      requestStatus: "accepted",
    });

  }
  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Parcel Requests</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage parcel requests received on your trips.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-white/10 bg-[#111a2e] p-3 text-sm">
          {message}
        </div>
      )}

      {/* TRIPS */}
      <div className="space-y-4">
        {myTrips.length === 0 ? (
          <div className="rounded-xl bg-[#111a2e] p-10 text-center text-gray-400">
            No trips found.
          </div>
        ) : (
          myTrips.map((trip) => {
            const parcels = getUniqueParcels(trip.parcels || []);

            const pendingCount = parcels.filter(
              (parcel) => parcel.requestStatus === "pending"
            ).length;

            return (
              <div
                key={trip._id}
                className="rounded-2xl border border-white/10 bg-[#111a2e] p-5"
              >
                {/* TRIP INFORMATION */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="text-lime-400" size={19} />
                      {trip.from} → {trip.to}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {new Date(trip.departureDate).toLocaleDateString()}
                      </span>

                      <span>{trip.departureTime}</span>
                      <span className="capitalize">{trip.transportMode}</span>
                      <span>{trip.availableCapacity} KG capacity</span>
                    </div>
                  </div>

                  {/* REQUEST BUTTON */}
                  <button
                    onClick={() => {
                      setSelectedTrip(
                        selectedTrip?._id === trip._id ? null : trip
                      );
                      setSelectedParcel(null);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-semibold text-black hover:bg-lime-200"
                  >
                    <Package size={17} />
                    Parcel Requests ({pendingCount})
                  </button>
                </div>

                {/* REQUEST LIST */}
                {selectedTrip?._id === trip._id && (
                  <div className="mt-5 space-y-3 border-t border-white/10 pt-5">

                    <h3 className="font-semibold">
                      Requests for this trip
                    </h3>

                    {parcels.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No parcel requests for this trip.
                      </p>
                    ) : (
                      parcels.map((parcel) => (
                        <div
                          key={parcel._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0b1020] p-4"
                        >
                          <div>
                            <p className="font-medium">{parcel.title}</p>
                            <p className="mt-1 text-sm text-gray-400">
                              {parcel.from} → {parcel.to}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs capitalize ${parcel.requestStatus === "accepted"
                                ? "bg-green-500/10 text-green-400"
                                : parcel.requestStatus === "rejected"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                                }`}
                            >
                              {parcel.requestStatus}
                            </span>

                            <button
                              onClick={() => setSelectedParcel(parcel)}
                              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PARCEL DETAILS */}
      {selectedParcel && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111a2e] p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Parcel Details</h2>

              <button
                onClick={() => setSelectedParcel(null)}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-400">Parcel Title</p>
                <p className="font-semibold">{selectedParcel.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Pickup Location</p>
                <p>{selectedParcel.from}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Delivery Location</p>
                <p>{selectedParcel.to}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Weight</p>
                  <p>{selectedParcel.weight} KG</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Sender Budget</p>
                  <p>₹{selectedParcel.budget}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Parcel Date</p>
                <p>
                  {new Date(selectedParcel.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Request Status</p>
                <p className="capitalize">{selectedParcel.requestStatus}</p>
              </div>

              {/* ACCEPT / REJECT */}
              {selectedParcel.requestStatus === "pending" && (
                <div className="flex gap-3 border-t border-white/10 pt-5">
                  <button
                    disabled={loadingId === selectedParcel._id}
                    onClick={() =>
                      handleRejectRequest(

                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <X size={17} />
                    Reject
                  </button>

                  <button
                    disabled={loadingId === selectedParcel._id}
                    onClick={() =>
                      handleAcceptRequest(

                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lime-300 py-3 font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
                  >
                    <Check size={17} />
                    Accept
                  </button>
                </div>
              )}

              {/* CHAT SECTION */}
              {selectedParcel.requestStatus === "accepted" && (
                <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-lime-300">
                    <MessageCircle size={19} />
                    Chat with Sender
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
                    This parcel is accepted. You can start a conversation
                    with the sender here once chat is connected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelRequest;
