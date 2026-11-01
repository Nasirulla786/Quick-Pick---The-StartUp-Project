
import "./App.css";
import RouterService from "./services/Router-service";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterService />
    </>
  );
}

export default App;
