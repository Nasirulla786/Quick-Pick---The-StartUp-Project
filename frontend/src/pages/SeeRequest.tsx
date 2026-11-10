import { useEffect, useState } from "react";
import api from "@/services/Axios";

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

            const res = await api.get("/parcels/find-traveller");
            setParcels(res.data.travellers || []);
        } catch (error: any) {
            setError(
                error.response?.data?.message || "Failed to fetch requests"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAcceptedRequests();
    }, []);

    if (loading) return <p>Loading requests...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-5">
                Accepted Parcel Requests ({parcels.length})
            </h1>

            {parcels.length === 0 ? (
                <p>No accepted requests found.</p>
            ) : (
                <div className="grid gap-4">
                    {parcels.map((parcel) => (
                        <div
                            key={parcel._id}
                            className="border rounded-xl p-5"
                        >
                            <h2 className="font-semibold text-lg">
                                {parcel.title}
                            </h2>

                            <p>{parcel.from} → {parcel.to}</p>
                            <p>Weight: {parcel.weight} kg</p>
                            <p>Budget: ₹{parcel.budget}</p>
                            <p>Status: {parcel.requestStatus}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeeRequest;
