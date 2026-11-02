
import { setUserData } from "@/redux/slices/userSlice";
import type { RootState } from "@/redux/stores/store";
import api from "@/services/Axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ArrowRight, Mail } from "lucide-react";

const OTP = () => {
  const [OTP, setOTP] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData } = useSelector((state: RootState) => state.auth);
  const email = userData?.email;

  const handleOTP = async () => {
    if (!email || OTP.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        email,
        otp: OTP,
      });

      dispatch(setUserData(res.data.user));

      toast.success(res.data.message);
      navigate("/home");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b1020] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#bef264]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />

      {/* OTP Card */}
      <div className="relative w-full max-w-md bg-[#111a2e] border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-[#bef264]" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Verify Your Email
          </h1>

          <p className="text-gray-400 text-sm mt-3 leading-6">
            We've sent a 6-digit verification code to
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 text-[#bef264] text-sm font-medium break-all">
            <Mail size={16} className="shrink-0" />
            {email || "Your email address"}
          </div>
        </div>

        {/* OTP Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Enter verification code
          </label>

          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={OTP}
            onChange={(e) =>
              setOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleOTP();
              }
            }}
            className="h-14 text-center text-2xl tracking-[0.8em] font-bold text-white bg-[#0b1020] border border-white/10 rounded-xl placeholder:text-gray-600 focus-visible:ring-[#bef264] focus-visible:border-[#bef264]"
          />

          <p className="text-xs text-gray-500 text-center">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleOTP}
          disabled={loading || OTP.length !== 6}
          className="w-full h-12 mt-7 bg-[#bef264] hover:bg-[#a3e635] text-[#0b1020] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-7">
          Your account security matters to us.
        </p>

      </div>
    </div>
  );
};

export default OTP;
