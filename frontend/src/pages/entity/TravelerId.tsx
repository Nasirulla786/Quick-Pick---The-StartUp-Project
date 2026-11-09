
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Package,
  Route,
  RefreshCw,
  AlertCircle,
  Plane,
} from "lucide-react";
import api from "@/services/Axios";

type TripData = Record<string, any>;

const hiddenFields = [
  "__v",
  "traveller",
  "password",
  "token",
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

  // Format ISO date strings
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
  console.log(id); //proeper trip ki id aree hai
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError("");

        // Update this URL if your route uses a different path.
        const res = await api.get(`/trip/traveller-trip/${id}`);
        console.log("this is res",res);

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

    if (id) fetchTrip();
  }, [id]);

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
      (item) => trip[item] !== undefined && trip[item] !== null
    );

    return key ? trip[key] : undefined;
  };

  const source = getValue("source", "from", "origin", "pickup");
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
    <div className="min-h-screen bg-[#080d19] text-white px-4 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-lime-400 transition mb-8"
        >
          <ArrowLeft size={19} />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-lime-400 text-sm font-semibold tracking-widest uppercase mb-2">
              Quick & Pick
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Traveller's <span className="text-lime-400">Trip</span>
            </h1>

            <p className="text-gray-400 mt-2">
              View complete journey information.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
            <Plane className="text-lime-400" size={27} />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-[#111a2b] border border-white/10 rounded-2xl p-12 text-center">
            <RefreshCw
              className="animate-spin text-lime-400 mx-auto mb-4"
              size={30}
            />
            <p className="text-gray-400">Loading trip details...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="text-red-400 mx-auto mb-3" size={32} />
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-gray-400 mt-2">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-2 rounded-lg bg-lime-400 text-black font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !trip && (
          <div className="bg-[#111a2b] border border-white/10 rounded-2xl p-12 text-center">
            <Package
              className="text-gray-500 mx-auto mb-4"
              size={42}
            />
            <h2 className="text-xl font-semibold">No Trip Found</h2>
            <p className="text-gray-400 mt-2">
              This traveller has no trip information available.
            </p>
          </div>
        )}

        {/* Trip Details */}
        {!loading && !error && trip && (
          <div className="space-y-6">

            {/* Journey Card */}
            <div className="bg-gradient-to-br from-[#17243a] to-[#101827] border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-lime-400">
                  <Route size={19} />
                  <span className="font-semibold">Journey Overview</span>
                </div>

                {status && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-lime-400/10 text-lime-400 border border-lime-400/20">
                    {formatValue(status)}
                  </span>
                )}
              </div>

              {source !== undefined || destination !== undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      From
                    </p>
                    <h2 className="text-2xl font-bold break-words">
                      {formatValue(source)}
                    </h2>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-lime-400/30 bg-lime-400/10 flex items-center justify-center">
                      <Route className="text-lime-400" size={23} />
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-gray-400 text-sm mb-2">
                      To
                    </p>
                    <h2 className="text-2xl font-bold break-words">
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
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
                  <CalendarDays className="text-lime-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-400">Travel Date</p>
                    <p className="font-medium">
                      {formatValue(travelDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* All Trip Information */}
            <div className="bg-[#111a2b] border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
                  <Package className="text-lime-400" size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Trip Information
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Complete available trip details
                  </p>
                </div>
              </div>

              {fields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#0b1220] border border-white/5 rounded-xl p-4"
                    >
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                        {formatLabel(key)}
                      </p>

                      <p className="text-gray-200 font-medium break-words">
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
              <div className="text-center text-gray-500 text-xs break-all">
                Trip ID: {trip._id}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default TravellerTrips;
