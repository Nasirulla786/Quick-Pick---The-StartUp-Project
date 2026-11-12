import { setMyTrips } from "@/redux/slices/tripSlice";
import api from "@/services/Axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const Overview = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getMyTrips = async () => {
      try {
        const res = await api.get("/trip/my-trips");

        dispatch(setMyTrips(res.data.trips));
      } catch (error: any) {}
    };

    getMyTrips();
  }, []);

  return (
    <div>
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome, Traveller!</h2>
          <p className="text-gray-400 mt-2">
            Manage your trips and deliver parcels with ease.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            ["Total Trips", "0"],
            ["Parcel Requests", "0"],
            ["Active Deliveries", "0"],
            ["Total Earnings", "₹0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-[#111a2e] border border-white/10 p-6 rounded-2xl"
            >
              <p className="text-gray-400 text-sm">{label}</p>
              <h3 className="text-3xl font-bold mt-3">{value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
