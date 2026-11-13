
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Package,
  RefreshCw,
  MapPin,
  CalendarDays,
  Clock3,
  Weight,
  IndianRupee,
  ArrowRight,
  Truck,
  UserRound,
  Send,
  Search,
  CircleCheck,
  Wallet,
  Plane,
  History as HistoryIcon,
} from "lucide-react";
import api from "@/services/Axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setParcelData } from "@/redux/slices/parcelSlice";
import LogoutButton from "@/components/LogoutButton";

type Trip = {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  availableCapacity: number;
  pricePerKg: number;
  description?: string;
  traveller: string;
  status?: string;
};

export type Parcel = {
  _id: string;
  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;
  status?: string;
};

const initialForm = {
  title: "",
  from: "",
  to: "",
  date: "",
  weight: "",
  budget: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/10";

const cardClass =
  "rounded-2xl border border-white/[0.08] bg-[#111a2e] shadow-xl shadow-black/10";

const normalizeLocation = (value: string) => value.trim().toLowerCase();

const routeMatchScore = (route: string, search: string) => {
  const normalizedRoute = normalizeLocation(route);
  const normalizedSearch = normalizeLocation(search);

  if (!normalizedSearch) return 0;
  if (normalizedRoute === normalizedSearch) return 4;
  if (
    normalizedRoute.includes(normalizedSearch) ||
    normalizedSearch.includes(normalizedRoute)
  ) {
    return 2;
  }
  return 0;
};

export const SenderPage = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);

  const [showParcelForm, setShowParcelForm] = useState(false);
  const [tripView, setTripView] = useState<"all" | "available">("all");
  const [tripSearch, setTripSearch] = useState({
    from: "",
    to: "",
    departureDate: "",
  });
  const [searchingTrips, setSearchingTrips] = useState(false);

  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [form, setForm] = useState(initialForm);

  const showMessage = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  // GET ALL TRIPS
  const getTrips = async () => {
    try {
      setLoadingTrips(true);

      const res = await api.get("/trip/all");

      const tripData = Array.isArray(res.data)
        ? res.data
        : res.data.trips || res.data.data || [];

      setTrips(tripData);
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to load trips",
        "error"
      );
    } finally {
      setLoadingTrips(false);
    }
  };

  const dispatch = useDispatch()
  // GET MY PARCELS
  const getMyParcels = async () => {
    try {
      setLoadingParcels(true);

      const res = await api.get("/parcels/my-parcels");

      const parcelData = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.parcels || [];




      dispatch(setParcelData(parcelData))
      setParcels(parcelData);


    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to load parcels",
        "error"
      );
    } finally {
      setLoadingParcels(false);
    }
  };

  useEffect(() => {
    getTrips();
    getMyParcels();
  }, []);

  // AVAILABLE TRIPS
  const availableTrips = useMemo(() => {
    return trips.filter((trip) => {
      const isFutureTrip =
        new Date(trip.departureDate).setHours(23, 59, 59, 999) >= Date.now();

      return (
        trip.availableCapacity > 0 &&
        isFutureTrip &&
        (!trip.status || trip.status === "available")
      );
    });
  }, [trips]);

  const displayedTrips =
    tripView === "available" ? availableTrips : trips;

  const nearestRouteFrom = tripSearch.from || parcels[0]?.from || "";
  const nearestRouteTo = tripSearch.to || parcels[0]?.to || "";
  const nearestTrips = useMemo(() => {
    if (!nearestRouteFrom.trim() && !nearestRouteTo.trim()) {
      return [...availableTrips]
        .sort(
          (first, second) =>
            new Date(first.departureDate).getTime() -
            new Date(second.departureDate).getTime(),
        )
        .slice(0, 3);
    }

    return availableTrips
      .map((trip) => ({
        trip,
        score:
          routeMatchScore(trip.from, nearestRouteFrom) +
          routeMatchScore(trip.to, nearestRouteTo),
      }))
      .filter(({ score }) => score > 0)
      .sort((first, second) => {
        if (second.score !== first.score) return second.score - first.score;
        return (
          new Date(first.trip.departureDate).getTime() -
          new Date(second.trip.departureDate).getTime()
        );
      })
      .slice(0, 3)
      .map(({ trip }) => trip);
  }, [availableTrips, nearestRouteFrom, nearestRouteTo]);

  const handleTripSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSearchingTrips(true);
      const params = new URLSearchParams();
      if (tripSearch.from.trim()) params.set("from", tripSearch.from.trim());
      if (tripSearch.to.trim()) params.set("to", tripSearch.to.trim());
      if (tripSearch.departureDate) {
        params.set("departureDate", tripSearch.departureDate);
      }

      const response = await api.get(`/trip/search?${params.toString()}`);
      setTrips(Array.isArray(response.data?.trips) ? response.data.trips : []);
      setTripView("available");
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to search trips",
        "error",
      );
    } finally {
      setSearchingTrips(false);
    }
  };

  const clearTripSearch = () => {
    setTripSearch({ from: "", to: "", departureDate: "" });
    setTripView("all");
    void getTrips();
  };

  // PARCEL FORM
  const openCreateForm = () => {
    setEditingParcel(null);
    setForm(initialForm);
    setShowParcelForm(true);
  };

  const openEditForm = (parcel: Parcel) => {
    setEditingParcel(parcel);

    setForm({
      title: parcel.title,
      from: parcel.from,
      to: parcel.to,
      date: parcel.date.slice(0, 10),
      weight: String(parcel.weight),
      budget: String(parcel.budget),
    });

    setShowParcelForm(true);
  };

  const closeParcelForm = () => {
    setShowParcelForm(false);
    setEditingParcel(null);
    setForm(initialForm);
  };

  // CREATE / UPDATE PARCEL
  const handleParcelSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) {
      showMessage("Pickup and delivery locations cannot be the same.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        from: form.from.trim(),
        to: form.to.trim(),
        weight: Number(form.weight),
        budget: Number(form.budget),
      };

      if (editingParcel) {
        await api.put(`/parcels/${editingParcel._id}`, payload);
        showMessage("Parcel updated successfully!");
      } else {
        await api.post("/parcels/create", payload);
        showMessage("Parcel created successfully!");
      }

      closeParcelForm();
      await getMyParcels();
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to save parcel",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE PARCEL
  const handleDeleteParcel = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this parcel?")) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(`/parcels/${id}`);

      setParcels((prev) => prev.filter((parcel) => parcel._id !== id));

      showMessage("Parcel deleted successfully!");
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to delete parcel",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // GET SINGLE TRIP
  const openTrip = async (id: string) => {
    try {
      const res = await api.get(`/trip/triproute/${id}`);

      setSelectedTrip(res.data.trip || res.data.data || res.data);
    } catch (error: any) {
      showMessage(
        error.response?.data?.message || "Unable to open trip",
        "error"
      );
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const totalWeight = parcels.reduce(
    (total, parcel) => total + Number(parcel.weight || 0),
    0
  );

  const totalBudget = parcels.reduce(
    (total, parcel) => total + Number(parcel.budget || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-lg font-black text-[#0b1020]">
                Q
              </div>
              <span className="text-sm font-bold tracking-tight">
                Quick<span className="text-lime-400">&</span>Pick
              </span>
              <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-lime-300">
                Sender panel
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sender <span className="text-lime-400">Dashboard.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Send smarter. Find travellers. Deliver with confidence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111a2e] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-lime-400/30 hover:text-lime-300"
            >
              <HistoryIcon size={17} />
              History
            </button>
            <LogoutButton />
            <button
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-[#0b1020] shadow-lg shadow-lime-400/10 transition hover:bg-lime-300"
            >
              <Plus size={18} />
              Create a parcel
            </button>
          </div>
        </header>

        {/* MESSAGE */}
        {message && (
          <div
            className={`flex items-center justify-between rounded-xl border p-4 text-sm ${messageType === "success"
              ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
              }`}
          >
            {message}
            <button onClick={() => setMessage("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* OVERVIEW STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">My parcels</span>
              <Package className="text-lime-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{parcels.length}</p>
            <p className="mt-1 text-xs text-slate-500">Total created parcels</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Available trips</span>
              <Truck className="text-lime-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{availableTrips.length}</p>
            <p className="mt-1 text-xs text-slate-500">Trips with free capacity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total parcel weight</span>
              <Weight className="text-lime-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">
              {totalWeight.toFixed(1)}
              <span className="ml-1 text-base text-slate-400">kg</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Across your parcels</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Combined budget</span>
              <Wallet className="text-lime-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">
              ₹{totalBudget.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">Your parcel budgets</p>
          </motion.div>
        </section>

        {/* QUICK ACTIONS */}
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="mb-5">
            <h2 className="text-lg font-bold">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Everything you need to manage your deliveries.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={openCreateForm}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d1527] p-4 text-left transition hover:border-lime-400/40 hover:bg-[#151f32]"
            >
              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">Create parcel</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a new delivery
                </p>
              </div>
              <ArrowRight className="ml-auto text-slate-500 transition group-hover:translate-x-1 group-hover:text-lime-400" size={17} />
            </button>

            <button
              onClick={() => {
                setTripView("available");
                document.getElementById("trips-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d1527] p-4 text-left transition hover:border-lime-400/40 hover:bg-[#151f32]"
            >
              <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
                <Search size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">Find a traveller</p>
                <p className="mt-1 text-xs text-slate-500">
                  Explore available trips
                </p>
              </div>
              <ArrowRight className="ml-auto text-slate-500 transition group-hover:translate-x-1 group-hover:text-lime-400" size={17} />
            </button>

            <button

              className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d1527] p-4 text-left transition hover:border-lime-400/40 hover:bg-[#151f32] cursor-pointer"
              onClick={()=>navigate("/see-request")}
            >


             <Plane /> See Request

            </button>
          </div>
        </section>

        {/* CREATE / EDIT PARCEL FORM */}
        <AnimatePresence>
        {showParcelForm && (
          <motion.section
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            className={`${cardClass} overflow-hidden p-5 sm:p-7`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
                  Parcel details
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {editingParcel ? "Update your parcel" : "Create a new parcel"}
                </h2>
              </div>

              <button
                onClick={closeParcelForm}
                className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleParcelSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Parcel name
                </label>
                <input
                  required
                  className={inputClass}
                  placeholder="e.g. Documents, Electronics, Clothes"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Pickup location
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="From city"
                    value={form.from}
                    onChange={(e) =>
                      setForm({ ...form, from: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Delivery location
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="To city"
                    value={form.to}
                    onChange={(e) =>
                      setForm({ ...form, to: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Delivery date
                  </label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    className={inputClass}
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Parcel weight (kg)
                  </label>
                  <input
                    required
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    className={inputClass}
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Your budget (₹)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter your budget"
                  className={inputClass}
                  value={form.budget}
                  onChange={(e) =>
                    setForm({ ...form, budget: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-[#0b1020] transition hover:bg-lime-300 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting
                    ? "Saving..."
                    : editingParcel
                      ? "Update parcel"
                      : "Create parcel"}
                </button>

                <button
                  type="button"
                  onClick={closeParcelForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.section>
        )}
        </AnimatePresence>

        {/* MY PARCELS */}
        <section id="my-parcels" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
                Your activity
              </p>
              <h2 className="mt-1 text-2xl font-bold">My parcels</h2>
              <p className="mt-1 text-sm text-slate-400">
                Track and manage the parcels you have created.
              </p>
            </div>

            <button
              onClick={getMyParcels}
              disabled={loadingParcels}
              className="rounded-xl border border-white/10 bg-[#111a2e] p-3 text-slate-300 transition hover:border-lime-400/30 hover:text-lime-400"
              title="Refresh parcels"
            >
              <RefreshCw
                size={17}
                className={loadingParcels ? "animate-spin" : ""}
              />
            </button>
          </div>

          {loadingParcels ? (
            <div className={`${cardClass} p-10 text-center text-sm text-slate-400`}>
              Loading your parcels...
            </div>
          ) : parcels.length === 0 ? (
            <div className={`${cardClass} px-5 py-12 text-center`}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
                <Package size={27} />
              </div>
              <h3 className="font-semibold">No parcels yet</h3>
              <p className="mt-2 text-sm text-slate-400">
                Create your first parcel and start exploring travellers.
              </p>
              <button
                onClick={openCreateForm}
                className="mt-5 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold text-[#0b1020] transition hover:bg-lime-300"
              >
                Create your first parcel
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {parcels.map((parcel, index) => (
                <motion.article
                  key={parcel._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 6) * 0.035 }}
                  className={`${cardClass} p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-400/20`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-lime-400/10 p-3 text-lime-400">
                        <Package size={21} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{parcel.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Created parcel
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize text-slate-300">
                      {(parcel.status || "pending").replace("_", " ")}
                    </span>
                  </div>

                  <div className="my-5 flex items-center gap-3 rounded-xl bg-[#0d1527] p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Pickup
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        {parcel.from}
                      </p>
                    </div>

                    <ArrowRight className="shrink-0 text-lime-400" size={18} />

                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Delivery
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        {parcel.to}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <CalendarDays size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Date</p>
                      <p className="mt-1 text-xs font-medium">
                        {formatDate(parcel.date)}
                      </p>
                    </div>
                    <div>
                      <Weight size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Weight</p>
                      <p className="mt-1 text-xs font-medium">
                        {parcel.weight} kg
                      </p>
                    </div>
                    <div>
                      <IndianRupee size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Budget</p>
                      <p className="mt-1 text-xs font-medium">
                        ₹{parcel.budget}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-white/[0.07] pt-4">
                    <button
                      onClick={() => openEditForm(parcel)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteParcel(parcel._id)}
                      disabled={deletingId === parcel._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-400/20 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === parcel._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ALL TRIPS + AVAILABLE TRIPS */}
        <section id="trips-section" className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
                Discover travellers
              </p>
              <h2 className="mt-1 text-2xl font-bold">Explore trips</h2>
              <p className="mt-1 text-sm text-slate-400">
                Find travellers heading towards your delivery destination.
              </p>
            </div>

            <button
              onClick={getTrips}
              disabled={loadingTrips}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111a2e] px-4 py-2.5 text-sm text-slate-300 transition hover:border-lime-400/30 hover:text-lime-400"
            >
              <RefreshCw
                size={15}
                className={loadingTrips ? "animate-spin" : ""}
              />
              Refresh trips
            </button>
          </div>

          {/* TRIP TABS */}
          <div className="flex w-fit gap-1 rounded-xl border border-white/[0.08] bg-[#111a2e] p-1">
            <button
              onClick={() => setTripView("all")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${tripView === "all"
                ? "bg-lime-400 text-[#0b1020]"
                : "text-slate-400 hover:text-white"
                }`}
            >
              All trips ({trips.length})
            </button>

            <button
              onClick={() => setTripView("available")}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${tripView === "available"
                ? "bg-lime-400 text-[#0b1020]"
                : "text-slate-400 hover:text-white"
                }`}
            >
              Available ({availableTrips.length})
            </button>
          </div>

          <form
            onSubmit={handleTripSearch}
            className={`${cardClass} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_auto_auto]`}
          >
            <label className="sr-only" htmlFor="sender-trip-from">
              Pickup city
            </label>
            <input
              id="sender-trip-from"
              value={tripSearch.from}
              onChange={(event) =>
                setTripSearch({ ...tripSearch, from: event.target.value })
              }
              placeholder="Pickup city"
              className={inputClass}
            />
            <label className="sr-only" htmlFor="sender-trip-to">
              Delivery city
            </label>
            <input
              id="sender-trip-to"
              value={tripSearch.to}
              onChange={(event) =>
                setTripSearch({ ...tripSearch, to: event.target.value })
              }
              placeholder="Delivery city"
              className={inputClass}
            />
            <label className="sr-only" htmlFor="sender-trip-date">
              Departure date
            </label>
            <input
              id="sender-trip-date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={tripSearch.departureDate}
              onChange={(event) =>
                setTripSearch({
                  ...tripSearch,
                  departureDate: event.target.value,
                })
              }
              className={inputClass}
            />
            <button
              type="submit"
              disabled={searchingTrips}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-[#0b1020] transition hover:bg-lime-300 disabled:opacity-50"
            >
              <Search size={16} />
              {searchingTrips ? "Searching..." : "Search trips"}
            </button>
            <button
              type="button"
              onClick={clearTripSearch}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Clear
            </button>
          </form>

          {loadingTrips ? (
            <div className={`${cardClass} p-10 text-center text-sm text-slate-400`}>
              Finding trips for you...
            </div>
          ) : displayedTrips.length === 0 ? (
            <div className={`${cardClass} px-5 py-12 text-center`}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
                <Truck size={27} />
              </div>
              <h3 className="font-semibold">No trips found</h3>
              <p className="mt-2 text-sm text-slate-400">
                {tripView === "available"
                  ? "There are no upcoming trips with available capacity right now."
                  : "Traveller trips will appear here when they are created."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {displayedTrips.map((trip, index) => (
                <motion.article
                  key={trip._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 6) * 0.035 }}
                  className={`${cardClass} p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-400/20`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-xs font-medium text-lime-400">
                      <span className="h-2 w-2 rounded-full bg-lime-400" />
                      {trip.availableCapacity > 0
                        ? "Capacity available"
                        : "Full"}
                    </span>

                    <span className="rounded-lg bg-[#0d1527] px-3 py-1.5 text-xs capitalize text-slate-300">
                      {trip.transportMode}
                    </span>
                  </div>

                  <div className="my-6 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">FROM</p>
                      <h3 className="mt-1 truncate text-lg font-bold">
                        {trip.from}
                      </h3>
                    </div>

                    <div className="flex shrink-0 flex-col items-center text-lime-400">
                      <div className="h-px w-12 bg-lime-400/40" />
                      <Truck size={19} className="my-1" />
                      <div className="h-px w-12 bg-lime-400/40" />
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-xs text-slate-500">TO</p>
                      <h3 className="mt-1 truncate text-lg font-bold">
                        {trip.to}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#0d1527] p-3">
                    <div>
                      <CalendarDays size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Departure</p>
                      <p className="mt-1 text-xs font-medium">
                        {formatDate(trip.departureDate)}
                      </p>
                    </div>

                    <div>
                      <Clock3 size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Time</p>
                      <p className="mt-1 text-xs font-medium">
                        {trip.departureTime}
                      </p>
                    </div>

                    <div>
                      <Weight size={15} className="mb-2 text-lime-400" />
                      <p className="text-[11px] text-slate-500">Capacity</p>
                      <p className="mt-1 text-xs font-medium">
                        {trip.availableCapacity} kg
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">Traveller price</p>
                      <p className="mt-1 text-xl font-bold text-lime-400">
                        ₹{trip.pricePerKg}
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          / kg
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/traveller/${trip._id}`)}
                        className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                        title="View traveller profile"
                      >
                        <UserRound size={16} />
                      </button>

                      <button
                        onClick={() => openTrip(trip._id)}
                        className="flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2.5 text-xs font-bold text-[#0b1020] transition hover:bg-lime-300"
                      >
                        <Eye size={15} />
                        Details
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ROUTE MATCHES */}
        <section className={`${cardClass} p-6 sm:p-8`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-lime-400">
                <MapPin size={17} />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Route suggestions
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold">Closest route matches</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {nearestRouteFrom || nearestRouteTo
                  ? `Suggested for ${nearestRouteFrom || "any pickup"} → ${nearestRouteTo || "any destination"}.`
                  : "Upcoming trips with available capacity, ordered by departure date."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTripView("available");
                document.getElementById("trips-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-lime-400/30 hover:text-lime-300"
            >
              Browse all trips
            </button>
          </div>

          {nearestTrips.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {nearestTrips.map((trip, index) => (
                <motion.article
                  key={trip._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-white/[0.07] bg-[#0d1527] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-lime-300">
                      {trip.availableCapacity} kg free
                    </span>
                    <span className="text-xs capitalize text-slate-500">
                      {trip.transportMode}
                    </span>
                  </div>
                  <p className="mt-4 truncate text-sm font-semibold">
                    {trip.from}
                    <span className="mx-2 text-lime-300">→</span>
                    {trip.to}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(trip.departureDate)} · ₹{trip.pricePerKg}/kg
                  </p>
                  <button
                    type="button"
                    onClick={() => openTrip(trip._id)}
                    className="mt-4 text-xs font-semibold text-lime-300 transition hover:text-lime-200"
                  >
                    View trip details
                  </button>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-white/10 bg-[#0d1527] p-8 text-center text-sm text-slate-500">
              No upcoming trips match this route yet. Try another pickup or
              destination.
            </div>
          )}
        </section>

        {/* TRUST / SELLER REMINDER */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#111a2e] p-4">
            <CircleCheck className="mt-0.5 shrink-0 text-lime-400" size={19} />
            <div>
              <p className="text-sm font-semibold">Clear parcel details</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Keep your pickup, delivery and weight information accurate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#111a2e] p-4">
            <UserRound className="mt-0.5 shrink-0 text-lime-400" size={19} />
            <div>
              <p className="text-sm font-semibold">Check traveller profiles</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review traveller information before making arrangements.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#111a2e] p-4">
            <Wallet className="mt-0.5 shrink-0 text-lime-400" size={19} />
            <div>
              <p className="text-sm font-semibold">Set a clear budget</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Decide your delivery budget before selecting a trip.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.07] pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Quick & Pick. Send smarter, travel together.
        </footer>
      </div>

      {/* TRIP DETAILS MODAL */}
      <AnimatePresence>
      {selectedTrip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTrip(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-5 rounded-2xl border border-white/10 bg-[#111a2e] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
                  Traveller information
                </p>
                <h2 className="mt-1 text-xl font-bold">Trip details</h2>
              </div>

              <button
                onClick={() => setSelectedTrip(null)}
                className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#0d1527] p-5 text-center">
              <p className="text-xl font-bold">
                {selectedTrip.from}
                <span className="mx-3 text-lime-400">→</span>
                {selectedTrip.to}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#0d1527] p-4">
                <CalendarDays className="mb-3 text-lime-400" size={18} />
                <p className="text-xs text-slate-500">Departure date</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(selectedTrip.departureDate)}
                </p>
              </div>

              <div className="rounded-xl bg-[#0d1527] p-4">
                <Clock3 className="mb-3 text-lime-400" size={18} />
                <p className="text-xs text-slate-500">Departure time</p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedTrip.departureTime}
                </p>
              </div>

              <div className="rounded-xl bg-[#0d1527] p-4">
                <Truck className="mb-3 text-lime-400" size={18} />
                <p className="text-xs text-slate-500">Transport</p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {selectedTrip.transportMode}
                </p>
              </div>

              <div className="rounded-xl bg-[#0d1527] p-4">
                <Weight className="mb-3 text-lime-400" size={18} />
                <p className="text-xs text-slate-500">Available capacity</p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedTrip.availableCapacity} kg
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-lime-400/20 bg-lime-400/[0.06] p-4">
              <p className="text-xs text-slate-400">Traveller price</p>
              <p className="mt-1 text-2xl font-bold text-lime-400">
                ₹{selectedTrip.pricePerKg}
                <span className="ml-1 text-sm font-normal text-slate-400">
                  / kg
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedTrip.description || "No description provided."}
              </p>
            </div>

            <button
              onClick={() => setSelectedTrip(null)}
              className="w-full rounded-xl bg-lime-400 py-3 text-sm font-bold text-[#0b1020] transition hover:bg-lime-300"
            >
              Close details
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
