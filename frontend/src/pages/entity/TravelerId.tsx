
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Package,
  Route,
  RefreshCw,
  AlertCircle,
  Plane,
  MapPin,
  Weight,
  IndianRupee,
  X,
  CheckCircle2,
  Send,
} from "lucide-react";

import api from "@/services/Axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/stores/store";
import { Button } from "@/components/ui/button";

// Types
type TripData = Record<string, any>;

type ParcelData = {
  _id: string;
  sender: string;
  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;
  status: string;
  requestStatus?: string;
};

const hiddenFields = [
  "__v",
  "traveller",
  "password",
  "token",
  "parcels",
];

const labelMap: Record<string, string> = {
  from: "Starting Point",
  source: "Starting Point",
  origin: "Starting Point",
  pickup: "Pickup Location",
  to: "Destination",
  destination: "Destination",
  drop: "Drop Location",
  departureDate: "Departure Date",
  date: "Travel Date",
  travelDate: "Travel Date",
  departureTime: "Departure Time",
  arrivalTime: "Arrival Time",
  status: "Trip Status",
  price: "Price",
  amount: "Amount",
  seats: "Available Seats",
  vehicle: "Vehicle",
  description: "Description",
};

const formatLabel = (key: string) => {
  return (
    labelMap[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
  );
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(formatValue).join(", ");
    }

    return Object.entries(value)
      .map(([key, val]) => `${formatLabel(key)}: ${formatValue(val)}`)
      .join(" • ");
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return String(value);
};

const TravellerTrips = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Redux
  const { parcelData } = useSelector(
    (state: RootState) => state.parcel
  );



  // States
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openSendModel, setOpenSendModel] = useState(false);
  const [selectedParcel, setSelectedParcel] =
    useState<ParcelData | null>(null);

  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState("");

  // Fetch Trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(
          `/trip/traveller-trip/${id}`
        );

        if (!res.data.success || !res.data.trip) {
          setTrip(null);
          return;
        }

        setTrip(res.data.trip);
      } catch (err: any) {
        console.error("Fetch Traveller Trip Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load trip details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id]);

  // Available parcels
  const availableParcels = parcelData || []



  // Send Parcel Request
  const handleSendRequest = async () => {
    if (!selectedParcel || !id) return;

    try {
      setSending(true);
      setRequestError("");




      const res = await api.post(
        `/trip/request-parcel/${id}`,
        {
          id: selectedParcel._id,
        }
      );



      alert(
        res.data.message || "Request sent successfully!"
      );

      setOpenSendModel(false);
      setSelectedParcel(null);

    } catch (err: any) {
      console.error("Send Parcel Request Error:", err);
      console.log(err.response?.data?.message );

      setRequestError(
        err.response?.data?.message ||
          "Request failed. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // Trip fields
  const fields = trip
    ? Object.entries(trip).filter(
        ([key, value]) =>
          !hiddenFields.includes(key) &&
          key !== "_id" &&
          value !== undefined &&
          value !== null
      )
    : [];

  const getValue = (...keys: string[]) => {
    if (!trip) return undefined;

    const key = keys.find(
      (item) =>
        trip[item] !== undefined &&
        trip[item] !== null
    );

    return key ? trip[key] : undefined;
  };

  const source = getValue(
    "source",
    "from",
    "origin",
    "pickup"
  );

  const destination = getValue(
    "destination",
    "to",
    "drop"
  );

  const travelDate = getValue(
    "departureDate",
    "travelDate",
    "date"
  );

  const status = getValue("status");

  return (
    <div className="min-h-screen bg-[#080d19] px-4 py-8 text-white md:px-10">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-400 transition hover:text-lime-400"
        >
          <ArrowLeft size={19} />
          Back
        </button>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-lime-400">
              Quick & Pick
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Traveller's{" "}
              <span className="text-lime-400">Trip</span>
            </h1>

            <p className="mt-2 text-gray-400">
              View complete journey information.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <Button
              onClick={() => {
                setRequestError("");
                setSelectedParcel(null);
                setOpenSendModel(true);
              }}
              className="bg-lime-400 font-semibold text-black hover:bg-lime-500"
            >
              <Send size={16} className="mr-2" />
              Send Request
            </Button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10">
              <Plane className="text-lime-400" size={27} />
            </div>

          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-[#111a2b] p-12 text-center">
            <RefreshCw
              className="mx-auto mb-4 animate-spin text-lime-400"
              size={30}
            />
            <p className="text-gray-400">
              Loading trip details...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <AlertCircle
              className="mx-auto mb-3 text-red-400"
              size={32}
            />

            <h2 className="text-lg font-semibold">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-400">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-lime-400 px-5 py-2 font-semibold text-black"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Trip */}
        {!loading && !error && !trip && (
          <div className="rounded-2xl border border-white/10 bg-[#111a2b] p-12 text-center">
            <Package
              className="mx-auto mb-4 text-gray-500"
              size={42}
            />

            <h2 className="text-xl font-semibold">
              No Trip Found
            </h2>

            <p className="mt-2 text-gray-400">
              This traveller has no trip information available.
            </p>
          </div>
        )}

        {/* Trip Details */}
        {!loading && !error && trip && (
          <div className="space-y-6">

            {/* Journey Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#17243a] to-[#101827] p-6 md:p-8">

              <div className="mb-8 flex items-center justify-between">

                <div className="flex items-center gap-2 text-lime-400">
                  <Route size={19} />
                  <span className="font-semibold">
                    Journey Overview
                  </span>
                </div>

                {status && (
                  <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
                    {formatValue(status)}
                  </span>
                )}

              </div>

              {source !== undefined ||
              destination !== undefined ? (
                <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">

                  <div>
                    <p className="mb-2 text-sm text-gray-400">
                      From
                    </p>

                    <h2 className="break-words text-2xl font-bold">
                      {formatValue(source)}
                    </h2>
                  </div>

                  <div className="hidden items-center justify-center md:flex">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10">
                      <Route
                        className="text-lime-400"
                        size={23}
                      />
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="mb-2 text-sm text-gray-400">
                      To
                    </p>

                    <h2 className="break-words text-2xl font-bold">
                      {formatValue(destination)}
                    </h2>
                  </div>

                </div>
              ) : (
                <p className="text-gray-400">
                  Journey locations are not available.
                </p>
              )}

              {travelDate && (
                <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">

                  <CalendarDays
                    className="text-lime-400"
                    size={20}
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Travel Date
                    </p>

                    <p className="font-medium">
                      {formatValue(travelDate)}
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Trip Information */}
            <div className="rounded-3xl border border-white/10 bg-[#111a2b] p-6 md:p-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10">
                  <Package
                    className="text-lime-400"
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Trip Information
                  </h2>

                  <p className="text-sm text-gray-400">
                    Complete available trip details
                  </p>
                </div>

              </div>

              {fields.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {fields.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-white/5 bg-[#0b1220] p-4"
                    >
                      <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                        {formatLabel(key)}
                      </p>

                      <p className="break-words font-medium text-gray-200">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-gray-400">
                  No additional information available.
                </p>
              )}

            </div>

            {/* Trip ID */}
            {trip._id && (
              <div className="break-all text-center text-xs text-gray-500">
                Trip ID: {trip._id}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Parcel Selection Modal */}
      {openSendModel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!sending) {
              setOpenSendModel(false);
            }
          }}
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111a2b] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>
                <h2 className="text-xl font-bold">
                  Select Your Parcel
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Choose a parcel to send with this traveller.
                </p>
              </div>

              <button
                disabled={sending}
                onClick={() => setOpenSendModel(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* Parcel List */}
            <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">

              {availableParcels.length > 0 ? (

                availableParcels.map((parcel) => {

                  const isSelected =
                    selectedParcel?._id === parcel._id;

                  return (
                    <button
                      key={parcel._id}
                      type="button"
                      disabled={sending}
                      onClick={() =>
                        setSelectedParcel(parcel)
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-lime-400 bg-lime-400/10"
                          : "border-white/10 bg-[#0b1220] hover:border-lime-400/50"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-400/10">
                            <Package
                              className="text-lime-400"
                              size={20}
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold text-white">
                              {parcel.title}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              Parcel ID: {parcel._id.slice(-8)}
                            </p>
                          </div>

                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-lime-400 bg-lime-400"
                              : "border-gray-500"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2
                              size={16}
                              className="text-black"
                            />
                          )}
                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin
                            size={15}
                            className="shrink-0 text-lime-400"
                          />

                          <span className="truncate">
                            {parcel.from}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Route
                            size={15}
                            className="shrink-0 text-lime-400"
                          />

                          <span className="truncate">
                            {parcel.to}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Weight
                            size={15}
                            className="shrink-0 text-lime-400"
                          />

                          {parcel.weight} kg
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <IndianRupee
                            size={15}
                            className="shrink-0 text-lime-400"
                          />

                          ₹{parcel.budget}
                        </div>

                      </div>

                    </button>
                  );
                })

              ) : (

                <div className="rounded-xl border border-dashed border-white/10 bg-[#0b1220] px-5 py-10 text-center">

                  <Package
                    className="mx-auto mb-3 text-gray-500"
                    size={38}
                  />

                  <h3 className="font-semibold text-white">
                    No Available Parcels
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    You have no parcels available for a new request.
                    Create a parcel first.
                  </p>

                </div>

              )}

            </div>

            {/* Request Error */}
            {requestError && (
              <div className="mx-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {requestError}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-white/10 p-5">

              <Button
                variant="outline"
                disabled={sending}
                onClick={() => {
                  setOpenSendModel(false);
                  setSelectedParcel(null);
                  setRequestError("");
                }}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                disabled={
                  !selectedParcel ||
                  sending
                }
                onClick={handleSendRequest}
                className="flex-1 bg-lime-400 font-semibold text-black hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Request
                  </>
                )}
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TravellerTrips;
