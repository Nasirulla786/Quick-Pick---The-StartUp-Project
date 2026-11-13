import {
  LayoutDashboard,
  UserRound,
  Map,
  Package,
  Truck,
  Wallet,
  Settings,
  Menu,
  Bell,
  MessageCircleCheckIcon,
  History as HistoryIcon,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import Overview from "../components/TravellerPage/Overview";
import MyProfile from "../components/TravellerPage/MyProfile";
import MyTrips from "../components/TravellerPage/MyTrips";
import ParcelRequest from "../components/TravellerPage/ParcelRequest";
import ActiveDeliveries from "../components/TravellerPage/ActiveDeliveries";
import Earnings from "../components/TravellerPage/Earnings";
import Message from "../components/TravellerPage/message";


const menuItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My Profile", icon: UserRound },
  { name: "My Trips", icon: Map },
  { name: "Parcel Requests", icon: Package },
  { name: "Active Deliveries", icon: Truck },
  { name: "Earnings", icon: Wallet },
  { name: "Message", icon: MessageCircleCheckIcon },
  { name: "Settings", icon: Settings },
  { name: "History", icon: HistoryIcon },
];

const TravellerPage = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111a2e] border-r border-white/10 p-5 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

        <h1 className="text-2xl font-bold mb-10">
          Quick <span className="text-[#bef264]">&</span> Pick
        </h1>

        <p className="text-xs text-gray-500 uppercase mb-4">
          Traveller Menu
        </p>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === "History") {
                    navigate("/history");
                    setSidebarOpen(false);
                    return;
                  }
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  activeTab === item.name
                    ? "bg-[#bef264] text-[#0b1020] font-semibold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <LogoutButton />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-5 md:p-8">

        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu />
            </button>

            <div>

              <p className="text-white text-2xl  font-bold">
                Manage your traveller account
              </p>
            </div>
          </div>

          <button className="p-3 rounded-xl bg-[#111a2e]">
            <Bell size={20} />
          </button>
        </header>

        {activeTab === "Overview" && (
            <Overview />
        )}
        {activeTab === "My Profile" && (
            <MyProfile />
        )}
        {activeTab === "My Trips" && (
            <MyTrips />
        )}
        {activeTab === "Parcel Requests" && (
            <ParcelRequest/>
        )}
        {activeTab === "Active Deliveries" && (
            <ActiveDeliveries/>
        )}
        {activeTab === "Earnings" && (
            <Earnings/>
        )}
        {activeTab === "Message" && (
            <Message/>
        )}
        {activeTab === "Settings" && (
            <Settings/>
        )}



      </main>
    </div>
  );
};

export default TravellerPage;
