import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { clearUserData } from "@/redux/slices/userSlice";
import api from "@/services/Axios";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout-user");
      dispatch(clearUserData());
      navigate("/login-user", { replace: true });
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-wait disabled:opacity-60"
    >
      {isLoggingOut ? (
        <LoaderCircle size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      {isLoggingOut ? "Signing out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
