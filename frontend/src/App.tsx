
import "./App.css";
import useCurrentUser from "./hooks/useCurrentUser";
import RouterService from "./services/Router-service";
import { Toaster } from "sonner";

function App() {
  const isCheckingSession = useCurrentUser();

  return (
    <>
      <Toaster position="top-right" richColors />
      {isCheckingSession ? (
        <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-sm text-slate-400">
          Checking your session...
        </div>
      ) : (
        <RouterService />
      )}
    </>
  );
}

export default App;
