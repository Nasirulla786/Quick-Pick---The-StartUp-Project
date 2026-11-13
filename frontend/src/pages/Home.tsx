import type { RootState } from "@/redux/stores/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate("/login-user", { replace: true });
    } else if (userData.emailVerified === false) {
      navigate("/otp", { replace: true });
    } else if (!userData.entity) {
      navigate("/select-entity", { replace: true });
    } else if (userData.entity === "sender") {
      navigate("/sender-page", { replace: true });
    } else if (userData.entity === "traveller") {
      navigate("/traveller-page", { replace: true });
    }
  }, [navigate, userData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-sm text-slate-400">
      Loading your dashboard...
    </div>
  );
};

export default Home;
