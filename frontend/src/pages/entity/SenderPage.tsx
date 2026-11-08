
import React, { useEffect, useState } from "react";
import { Plus, Package, Eye } from "lucide-react";
import api from "@/services/Axios";

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
};

export const SenderPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [showParcelForm, setShowParcelForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    from: "",
    to: "",
    date: "",
    weight: "",
    budget: "",
  });

  // Get other travellers' available trips
  const getTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get("/trips/all");
      setTrips(res.data.data || []);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Unable to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTrips();
  }, []);

  // Send parcel
  const handleSendParcel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post("/parcels/create", {
        ...form,
        weight: Number(form.weight),
        budget: Number(form.budget),
      });

      setMessage("Parcel submitted successfully!");
      setForm({
        title: "",
        from: "",
        to: "",
        date: "",
        weight: "",
        budget: "",
      });
      setShowParcelForm(false);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Unable to send parcel");
    }
  };

  // Open trip details
  const openTrip = async (id: string) => {
    try {
      const res = await api.get(`/trips/triproute/${id}`);
      setSelectedTrip(res.data.data);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Unable to open trip");
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">

      <h1 className="text-2xl font-semibold">Sender Dashboard</h1>

      {message && (
        <p className="rounded-md bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}

      {/* Send Parcel */}
      <section className="rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Send a Parcel</h2>
            <p className="text-sm text-gray-500">
              Enter your parcel details.
            </p>
          </div>

          <button
            onClick={() => setShowParcelForm(!showParcelForm)}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            <Plus size={16} />
            Send Parcel
          </button>
        </div>

        {showParcelForm && (
          <form onSubmit={handleSendParcel} className="mt-5 space-y-3">
            <input
              required
              className={inputClass}
              placeholder="Parcel name"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                placeholder="Pickup location"
                value={form.from}
                onChange={(e) =>
                  setForm({ ...form, from: e.target.value })
                }
              />

              <input
                required
                className={inputClass}
                placeholder="Delivery location"
                value={form.to}
                onChange={(e) =>
                  setForm({ ...form, to: e.target.value })
                }
              />

              <input
                required
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Weight (kg)"
                className={inputClass}
                value={form.weight}
                onChange={(e) =>
                  setForm({ ...form, weight: e.target.value })
                }
              />
            </div>

            <input
              required
              type="number"
              min="0"
              className={inputClass}
              placeholder="Your budget (₹)"
              value={form.budget}
              onChange={(e) =>
                setForm({ ...form, budget: e.target.value })
              }
            />

            <button
              type="submit"
              className="rounded-md bg-black px-5 py-2 text-sm text-white"
            >
              Submit Parcel
            </button>
          </form>
        )}
      </section>

      {/* Available Trips */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Trips</h2>
          <p className="text-sm text-gray-500">
            Trips created by other travellers.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-gray-500">No trips available.</p>
        ) : (
          trips.map((trip) => (
            <div
              key={trip._id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-medium">
                  {trip.from} → {trip.to}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {new Date(trip.departureDate).toLocaleDateString("en-IN")}
                  {" · "}
                  {trip.departureTime}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {trip.transportMode} · {trip.availableCapacity} kg · ₹
                  {trip.pricePerKg}/kg
                </p>
              </div>

              <button
                onClick={() => openTrip(trip._id)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))
        )}
      </section>

      {/* Trip Details */}
      {selectedTrip && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-3 rounded-lg bg-white p-6">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Trip Details</h2>
              <button onClick={() => setSelectedTrip(null)}>✕</button>
            </div>

            <p>{selectedTrip.from} → {selectedTrip.to}</p>
            <p>Date: {new Date(selectedTrip.departureDate).toLocaleDateString("en-IN")}</p>
            <p>Time: {selectedTrip.departureTime}</p>
            <p>Transport: {selectedTrip.transportMode}</p>
            <p>Capacity: {selectedTrip.availableCapacity} kg</p>
            <p>Price: ₹{selectedTrip.pricePerKg}/kg</p>
            <p>Description: {selectedTrip.description || "No description"}</p>
          </div>
        </div>
      )}
    </div>
  );
};
