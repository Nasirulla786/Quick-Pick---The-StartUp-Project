import React, { useState } from "react";
import { Package, Plane, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/stores/store";
import api from "@/services/Axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SelectEntity = () => {
    const [entity, setEntity] = useState<"sender" | "traveller" | null>(null);
    const { userData } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const handleContinue = async () => {
        try {
            if (!entity) return;
            const res = await api.post(`/auth/update-entity/${userData?._id}`, {
                entity,
            });
            if (res.status == 200) {
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center px-5 py-10 text-white">
            <div className="w-full max-w-3xl">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        Choose your <span className="text-[#bef264]">role</span>
                    </h1>

                    <p className="text-gray-400 mt-3">
                        How would you like to use Quick & Pick?
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 gap-5">
                    {/* Sender */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEntity("sender")}
                        className={`relative cursor-pointer rounded-2xl border p-7 transition-all duration-300 ${entity === "sender"
                                ? "border-[#bef264] bg-[#bef264]/10"
                                : "border-white/10 bg-[#111a2e] hover:border-white/30"
                            }`}
                    >
                        {entity === "sender" && (
                            <Check className="absolute top-5 right-5 text-[#bef264]" />
                        )}

                        <div className="w-14 h-14 rounded-xl bg-[#bef264]/10 flex items-center justify-center mb-6">
                            <Package size={28} className="text-[#bef264]" />
                        </div>

                        <h2 className="text-2xl font-semibold">Sender</h2>

                        <p className="text-gray-400 text-sm mt-2 leading-6">
                            I want to send parcels to someone using trusted travellers.
                        </p>
                    </motion.div>

                    {/* Traveller */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEntity("traveller")}
                        className={`relative cursor-pointer rounded-2xl border p-7 transition-all duration-300 ${entity === "traveller"
                                ? "border-[#bef264] bg-[#bef264]/10"
                                : "border-white/10 bg-[#111a2e] hover:border-white/30"
                            }`}
                    >
                        {entity === "traveller" && (
                            <Check className="absolute top-5 right-5 text-[#bef264]" />
                        )}

                        <div className="w-14 h-14 rounded-xl bg-[#bef264]/10 flex items-center justify-center mb-6">
                            <Plane size={28} className="text-[#bef264]" />
                        </div>

                        <h2 className="text-2xl font-semibold">Traveller</h2>

                        <p className="text-gray-400 text-sm mt-2 leading-6">
                            I travel frequently and want to earn by delivering parcels.
                        </p>
                    </motion.div>
                </div>

                {/* Continue */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleContinue}
                    disabled={!entity}
                    className="w-full mt-8 flex items-center justify-center gap-3 rounded-xl bg-[#bef264] py-4 font-semibold text-[#0b1020] transition hover:bg-[#d4ff8b] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Continue
                    <ArrowRight size={19} />
                </motion.button>

                <p className="text-center text-xs text-gray-500 mt-5">
                    You can get started with your selected role.
                </p>
            </div>
        </div>
    );
};

export default SelectEntity;
