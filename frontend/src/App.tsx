
import "./App.css";
import useCurrentUser from "./hooks/useCurrentUser";
import RouterService from "./services/Router-service";
import { Toaster } from "sonner";

function App() {
  useCurrentUser()
  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterService />
    </>
  );
}

export default App;
