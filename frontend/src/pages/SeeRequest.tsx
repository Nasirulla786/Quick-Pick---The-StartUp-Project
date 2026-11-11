
import { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  ArrowRight,
  Weight,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import api from "@/services/Axios";
import { useNavigate } from "react-router-dom";

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

const SeeRequest = () => {
  const [parcels, setParcels] = useState<IParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAcceptedRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/parcels/find-traveller");
      setParcels(res.data.travellers || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAcceptedRequests();
  }, []);


  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0b1020] px-4 py-6 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#bef264]">
              <Package size={17} />
              Parcel Management
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Accepted Requests
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track and manage your accepted parcel requests.
            </p>
          </div>

          <button
            onClick={getAcceptedRequests}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111a2e] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#bef264]/40 hover:text-[#bef264] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#111a2e] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Accepted Parcels</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {parcels.length}
                </h2>
              </div>

              <div className="rounded-xl bg-[#bef264]/10 p-3 text-[#bef264]">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111a2e] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Weight</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {parcels.reduce((total, p) => total + p.weight, 0)}
                  <span className="ml-1 text-base font-medium text-slate-400">
                    kg
                  </span>
                </h2>
              </div>

              <div className="rounded-xl bg-[#bef264]/10 p-3 text-[#bef264]">
                <Weight size={24} />
              </div>
            </div>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#111a2e]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={getAcceptedRequests}
              className="mt-3 text-sm font-semibold text-[#bef264]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && parcels.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111a2e] px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#bef264]/10 text-[#bef264]">
              <Package size={30} />
            </div>

            <h2 className="text-lg font-bold">
              No accepted parcels yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Accepted parcel requests will appear here.
            </p>
          </div>
        )}

        {/* Parcel Cards */}
        {!loading && !error && parcels.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {parcels.map((parcel) => (
              <div
                key={parcel._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e] transition duration-300 hover:-translate-y-1 hover:border-[#bef264]/40 hover:shadow-xl hover:shadow-black/20"
                onClick={()=>navigate("/sender-chat/"+ parcel?.traveller)}
              >

                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-white/10 p-5">

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-[#bef264]/10 p-3 text-[#bef264]">
                      <Package size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">
                        {parcel.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {parcel._id.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#bef264]/20 bg-[#bef264]/10 px-2.5 py-1 text-xs font-semibold text-[#bef264]">
                    <CheckCircle2 size={13} />
                    Accepted
                  </span>

                </div>

                {/* Route */}
                <div className="p-5">

                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Parcel Route
                  </p>

                  <div className="flex items-center gap-3">

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={14} />
                        <span className="text-xs">From</span>
                      </div>
                      <p className="mt-1 truncate font-semibold text-white">
                        {parcel.from}
                      </p>
                    </div>

                    <ArrowRight className="shrink-0 text-[#bef264]" size={20} />

                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-500">
                        <MapPin size={14} />
                        <span className="text-xs">To</span>
                      </div>
                      <p className="mt-1 truncate font-semibold text-white">
                        {parcel.to}
                      </p>
                    </div>

                  </div>

                  {/* Details */}
                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-white/5 bg-[#0d1527] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Weight size={15} />
                        <span className="text-xs">Weight</span>
                      </div>
                      <p className="mt-2 font-bold text-white">
                        {parcel.weight} kg
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-[#0d1527] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <IndianRupee size={15} />
                        <span className="text-xs">Budget</span>
                      </div>
                      <p className="mt-2 font-bold text-white">
                        ₹{parcel.budget}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Footer */}
                <div className="border-t border-white/10 bg-[#0d1527] px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Delivery Status
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-[#bef264]">
                    {parcel.status.replace("_", " ")}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default SeeRequest;
