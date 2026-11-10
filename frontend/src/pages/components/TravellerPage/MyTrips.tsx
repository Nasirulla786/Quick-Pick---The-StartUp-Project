
import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  CalendarDays,
  Clock,
  Car,
  Pencil,
  Trash2,
  Search,
  X,
  Package,
  Eye,
  RefreshCw,
} from "lucide-react";

import api from "@/services/Axios";
import { useDispatch } from "react-redux";
import { setMyTrips } from "@/redux/slices/tripSlice";


interface Trip {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  availableCapacity: number;
  pricePerKg: number;
  description?: string;
  status: string;
}

interface TripForm {
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  availableCapacity: string;
  pricePerKg: string;
  description: string;
}

const initialForm: TripForm = {
  from: "",
  to: "",
  departureDate: "",
  departureTime: "",
  transportMode: "car",
  availableCapacity: "",
  pricePerKg: "",
  description: "",
};

const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [form, setForm] = useState<TripForm>(initialForm);

  const [search, setSearch] = useState({
    from: "",
    to: "",
    departureDate: "",
  });

  const [message, setMessage] = useState("");

  // GET MY TRIPS
  const dispatch = useDispatch();
  const getMyTrips = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/trip/my-trips");

      setTrips(res.data.trips || []);

      dispatch(setMyTrips(res.data.trips))
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Failed to fetch your trips"
      );
    } finally {
      setLoading(false);
    }
  };



  // GET ALL TRIPS
  const getAllTrips = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/trip/all");

      setTrips(res.data.trips || []);


      // dispatch(setMyTrips(res.data.trips || []))

    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Failed to fetch trips"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "mine") {
      getMyTrips();
    } else {
      getAllTrips();
    }
  }, [activeTab]);

  console.log(trips);

  // HANDLE FORM INPUTS
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // RESET FORM
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // CREATE / UPDATE TRIP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        ...form,
        availableCapacity: Number(form.availableCapacity),
        pricePerKg: Number(form.pricePerKg),
      };

      if (editingId) {
        await api.put(`/trip/triproute/${editingId}`, payload);
        setMessage("Trip updated successfully");
      } else {
        const res = await api.post("/trip/create", payload);


        setMessage("Trip created successfully");
      }

      resetForm();
      await getMyTrips();
      setActiveTab("mine");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // SEARCH TRIPS
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams();

      if (search.from) params.append("from", search.from);
      if (search.to) params.append("to", search.to);
      if (search.departureDate) {
        params.append("departureDate", search.departureDate);
      }

      const res = await api.get(
        `/trip/search?${params.toString()}`
      );

      setTrips(res.data.trips || []);
      setActiveTab("all");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Search failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // GET SINGLE TRIP
  const handleViewTrip = async (id: string) => {
    try {
      const res = await api.get(`/trip/triproute/${id}`);
      setSelectedTrip(res.data.trip);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Failed to fetch trip details"
      );
    }
  };

  // OPEN EDIT FORM
  const handleEdit = (trip: Trip) => {
    setEditingId(trip._id);

    setForm({
      from: trip.from,
      to: trip.to,
      departureDate: trip.departureDate.slice(0, 10),
      departureTime: trip.departureTime,
      transportMode: trip.transportMode,
      availableCapacity: String(trip.availableCapacity),
      pricePerKg: String(trip.pricePerKg),
      description: trip.description || "",
    });

    setShowForm(true);
  };

  // DELETE TRIP
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    try {
      await api.get(`/trip/delete/${id}`);

      setMessage("Trip deleted successfully");
      await getMyTrips();
    } catch (error: any) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Failed to delete trip"
      );
    }
  };

  const closeDetails = () => setSelectedTrip(null);

  return (
    <div className="space-y-7 text-white">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your journeys and available luggage space.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#bef264] px-5 py-3 font-semibold text-[#0b1020] hover:bg-lime-300"
        >
          <Plus size={19} />
          Create Trip
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111a2e] p-4 text-sm">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-2xl border border-white/10 bg-[#111a2e] p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Search size={18} className="text-[#bef264]" />
          Find Trips
        </h2>

        <form
          onSubmit={handleSearch}
          className="grid gap-4 md:grid-cols-4"
        >
          <input
            placeholder="From location"
            value={search.from}
            onChange={(e) =>
              setSearch({ ...search, from: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
          />

          <input
            placeholder="To location"
            value={search.to}
            onChange={(e) =>
              setSearch({ ...search, to: e.target.value })
            }
            className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
          />

          <input
            type="date"
            value={search.departureDate}
            onChange={(e) =>
              setSearch({
                ...search,
                departureDate: e.target.value,
              })
            }
            className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#bef264] px-4 py-3 font-semibold text-[#0b1020]"
          >
            <Search size={18} />
            Search
          </button>
        </form>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-xl bg-[#111a2e] p-1">
          <button
            onClick={() => setActiveTab("mine")}
            className={`rounded-lg px-5 py-2 text-sm font-medium ${activeTab === "mine"
                ? "bg-[#bef264] text-[#0b1020]"
                : "text-gray-400"
              }`}
          >
            My Trips
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-5 py-2 text-sm font-medium ${activeTab === "all"
                ? "bg-[#bef264] text-[#0b1020]"
                : "text-gray-400"
              }`}
          >
            All Trips
          </button>
        </div>

        <button
          onClick={() =>
            activeTab === "mine" ? getMyTrips() : getAllTrips()
          }
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#bef264]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* TRIP LIST */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          Loading trips...
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111a2e] py-16 text-center">
          <Package
            size={42}
            className="mx-auto mb-4 text-gray-500"
          />
          <h3 className="text-lg font-semibold">No trips found</h3>
          <p className="mt-2 text-sm text-gray-400">
            Create a trip or try searching for another route.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="rounded-2xl border border-white/10 bg-[#111a2e] p-5 transition hover:border-[#bef264]/40"
            >
              {/* CARD HEADER */}
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Car size={17} className="text-[#bef264]" />
                  {trip.transportMode}
                </span>

                <span className="rounded-full bg-[#bef264]/10 px-3 py-1 text-xs font-medium capitalize text-[#bef264]">
                  {trip.status}
                </span>
              </div>

              {/* ROUTE */}
              <div className="mb-6 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-gray-500">FROM</p>
                  <h3 className="truncate text-lg font-semibold">
                    {trip.from}
                  </h3>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-px w-12 bg-[#bef264]" />
                  <MapPin size={18} className="my-1 text-[#bef264]" />
                  <div className="h-px w-12 bg-[#bef264]" />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <p className="mb-1 text-xs text-gray-500">TO</p>
                  <h3 className="truncate text-lg font-semibold">
                    {trip.to}
                  </h3>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    className="text-[#bef264]"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm">
                      {new Date(trip.departureDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={17} className="text-[#bef264]" />
                  <div>
                    <p className="text-xs text-gray-500">Departure</p>
                    <p className="text-sm">{trip.departureTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm font-medium">
                    {trip.availableCapacity} KG
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Price / KG</p>
                  <p className="text-sm font-medium text-[#bef264]">
                    ₹{trip.pricePerKg}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewTrip(trip._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
                >
                  <Eye size={16} />
                  View
                </button>

                {activeTab === "mine" && (
                  <>
                    <button
                      onClick={() => handleEdit(trip)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111a2e] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Update Trip" : "Create New Trip"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Enter your journey details.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    From
                  </label>
                  <input
                    name="from"
                    value={form.from}
                    onChange={handleChange}
                    required
                    placeholder="Delhi"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    To
                  </label>
                  <input
                    name="to"
                    value={form.to}
                    onChange={handleChange}
                    required
                    placeholder="Haridwar"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    value={form.departureDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={form.departureTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Transport Mode
                  </label>
                  <select
                    name="transportMode"
                    value={form.transportMode}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="flight">Flight</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Available Capacity (KG)
                  </label>
                  <input
                    type="number"
                    name="availableCapacity"
                    value={form.availableCapacity}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    required
                    placeholder="10"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Price Per KG (₹)
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={form.pricePerKg}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="50"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add details about your journey..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 outline-none focus:border-[#bef264]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#bef264] px-6 py-3 font-semibold text-[#0b1020] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Trip"
                      : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIP DETAILS MODAL */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111a2e] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Trip Details</h2>

              <button
                onClick={closeDetails}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Route</span>
                <span className="font-semibold">
                  {selectedTrip.from} → {selectedTrip.to}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Date</span>
                <span>
                  {new Date(
                    selectedTrip.departureDate
                  ).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Departure</span>
                <span>{selectedTrip.departureTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Transport</span>
                <span className="capitalize">
                  {selectedTrip.transportMode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Capacity</span>
                <span>{selectedTrip.availableCapacity} KG</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Price per KG</span>
                <span className="text-[#bef264]">
                  ₹{selectedTrip.pricePerKg}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className="capitalize text-[#bef264]">
                  {selectedTrip.status}
                </span>
              </div>

              {selectedTrip.description && (
                <div className="border-t border-white/10 pt-4">
                  <p className="mb-2 text-sm text-gray-400">
                    Description
                  </p>
                  <p className="text-sm">
                    {selectedTrip.description}
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

export default MyTrips;
