import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  History,
  Package,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import type { RootState } from "@/redux/stores/store";
import api from "@/services/Axios";
import LogoutButton from "@/components/LogoutButton";

interface HistoryParcel {
  _id: string;
  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;
  status?: string;
  requestStatus?: string;
  trip?: string | { _id: string } | null;
}

interface HistoryTrip {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  status: string;
  parcels?: Array<HistoryParcel | string | null>;
}

type ActivityFilter = "all" | "active" | "completed";

const isCompleted = (status = "") =>
  ["completed", "delivered", "cancelled", "rejected"].includes(
    status.toLowerCase(),
  );

const matchesFilter = (status: string | undefined, filter: ActivityFilter) => {
  if (filter === "all") return true;
  const completed = isCompleted(status);
  return filter === "completed" ? completed : !completed;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.auth);
  const [trips, setTrips] = useState<HistoryTrip[]>([]);
  const [parcels, setParcels] = useState<HistoryParcel[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      if (!userData?.entity) {
        setError("Choose your account type to view activity history.");
        return;
      }

      if (userData.entity === "sender") {
        const response = await api.get("/parcels/my-parcels");
        const parcelData: HistoryParcel[] = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.parcels)
            ? response.data.parcels
            : [];
        const tripIds = Array.from(
          new Set(
            parcelData
              .filter((parcel) => parcel.requestStatus === "accepted" && parcel.trip)
              .map((parcel) =>
                typeof parcel.trip === "string" ? parcel.trip : parcel.trip?._id,
              )
              .filter((tripId): tripId is string => Boolean(tripId)),
          ),
        );
        const tripResults = await Promise.allSettled(
          tripIds.map(async (tripId) => {
            const tripResponse = await api.get<{ trip: HistoryTrip }>(
              `/trip/triproute/${tripId}`,
            );
            return tripResponse.data.trip;
          }),
        );
        const tripData = tripResults.flatMap((result) =>
          result.status === "fulfilled" && result.value ? [result.value] : [],
        );
        if (tripResults.some((result) => result.status === "rejected")) {
          setError("Some linked trip details could not be loaded.");
        } else {
          setError("");
        }
        setParcels(parcelData);
        setTrips(tripData);
      } else {
        const response = await api.get("/trip/my-trips");
        const tripData: HistoryTrip[] = Array.isArray(response.data?.trips)
          ? response.data.trips
          : [];
        const parcelData = tripData
          .flatMap((trip) => trip.parcels || [])
          .filter(
            (parcel): parcel is HistoryParcel =>
              parcel !== null &&
              typeof parcel === "object" &&
              "_id" in parcel,
          );
        setTrips(tripData);
        setParcels(
          Array.from(new Map(parcelData.map((parcel) => [parcel._id, parcel])).values()),
        );
        setError("");
      }
    } catch (requestError) {
      console.error("Load activity history error:", requestError);
      setError("We couldn't load your activity history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const refreshHistory = useCallback(() => {
    setLoading(true);
    setError("");
    void loadHistory();
  }, [loadHistory]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTrips = useMemo(
    () =>
      trips.filter(
        (trip) =>
          matchesFilter(trip.status, filter) &&
          `${trip.from} ${trip.to} ${trip.transportMode} ${trip.status}`
            .toLowerCase()
            .includes(normalizedSearch),
      ),
    [filter, normalizedSearch, trips],
  );
  const filteredParcels = useMemo(
    () =>
      parcels.filter(
        (parcel) =>
          matchesFilter(parcel.status || parcel.requestStatus, filter) &&
          `${parcel.title} ${parcel.from} ${parcel.to} ${parcel.status || ""}`
            .toLowerCase()
            .includes(normalizedSearch),
      ),
    [filter, normalizedSearch, parcels],
  );

  const backPath =
    userData?.entity === "sender" ? "/sender-page" : "/traveller-page";

  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-lime-300"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300">
                <History size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">
                  Your activity
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                  Trips & parcels
                </h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Review your past and current deliveries in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshHistory}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111a2e] px-4 py-2.5 text-sm text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <LogoutButton />
          </div>
        </header>

        <section className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#111a2e] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by route or parcel"
              className="w-full rounded-xl border border-white/10 bg-[#0b1020] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-lime-300/50"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-[#0b1020] p-1">
            {(["all", "active", "completed"] as ActivityFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                  filter === value
                    ? "bg-lime-300 text-[#0b1020]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {value === "active" ? "In progress" : value}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">
            {error}
            <button
              type="button"
              onClick={refreshHistory}
              className="font-semibold text-red-100 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#111a2e] p-12 text-center text-sm text-slate-400">
            Loading your history...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filter}-${normalizedSearch}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-8"
            >
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Trips</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {filteredTrips.length} trip{filteredTrips.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {filteredTrips.length ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {filteredTrips.map((trip, index) => (
                      <motion.article
                        key={trip._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 5) * 0.04 }}
                        className="rounded-2xl border border-white/[0.08] bg-[#111a2e] p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm text-slate-300">
                            <Truck size={17} className="text-lime-300" />
                            <span className="capitalize">{trip.transportMode}</span>
                          </span>
                          <span className="rounded-full bg-lime-300/10 px-3 py-1 text-xs capitalize text-lime-200">
                            {trip.status}
                          </span>
                        </div>
                        <div className="my-5 flex items-center gap-3">
                          <p className="min-w-0 flex-1 truncate font-semibold">
                            {trip.from}
                          </p>
                          <ArrowRight size={17} className="shrink-0 text-lime-300" />
                          <p className="min-w-0 flex-1 truncate text-right font-semibold">
                            {trip.to}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.07] pt-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} className="text-lime-300" />
                            {formatDate(trip.departureDate)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock3 size={14} className="text-lime-300" />
                            {trip.departureTime}
                          </span>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#111a2e]/60 p-8 text-center text-sm text-slate-500">
                    No trips match this filter.
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Parcels</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredParcels.length} parcel{filteredParcels.length === 1 ? "" : "s"}
                  </p>
                </div>
                {filteredParcels.length ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {filteredParcels.map((parcel, index) => (
                      <motion.article
                        key={parcel._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 5) * 0.04 }}
                        className="rounded-2xl border border-white/[0.08] bg-[#111a2e] p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="rounded-xl bg-lime-300/10 p-3 text-lime-300">
                              <Package size={19} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold">{parcel.title}</h3>
                              <p className="mt-1 text-xs text-slate-500">
                                {parcel.weight} kg · ₹{parcel.budget}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1 text-xs capitalize text-slate-300">
                            {(parcel.status || parcel.requestStatus || "pending").replace("_", " ")}
                          </span>
                        </div>
                        <div className="my-5 flex items-center gap-3 rounded-xl bg-[#0b1020] p-4">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium">
                            {parcel.from}
                          </p>
                          <ArrowRight size={15} className="shrink-0 text-lime-300" />
                          <p className="min-w-0 flex-1 truncate text-right text-sm font-medium">
                            {parcel.to}
                          </p>
                        </div>
                        <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                          <CalendarDays size={14} className="text-lime-300" />
                          {formatDate(parcel.date)}
                        </p>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#111a2e]/60 p-8 text-center text-sm text-slate-500">
                    No parcels match this filter.
                  </div>
                )}
              </section>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;
