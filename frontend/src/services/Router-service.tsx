
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from 'react-router-dom'
import WelcomeScreen from '../pages/WelcomeScreen'
import RegisterPage from '../pages/auth/RegisterPage'
import LoginPage from '../pages/auth/LoginPage'
import SelectEntity from '../pages/SelectEntity'
import Home from '@/pages/Home'
import OTP from '@/pages/auth/OTP'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/stores/store'
import TravellerPage from '@/pages/entity/TravellerPage'
import TravelerId from '@/pages/entity/TravelerId'
import SeeRequest from '@/pages/SeeRequest'
import SenderChatpage from '@/pages/entity/SenderChatpage'
import TravellerChatPage from '@/pages/entity/TravellerChatPage'
import { SenderPage } from '@/pages/entity/SenderPage'
import HistoryPage from "@/pages/HistoryPage";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { userData } = useSelector((state: RootState) => state.auth);
    return userData ? children : <Navigate to="/login-user" replace />;
};

const RouterService = () => {
    const { userData } = useSelector((state: RootState) => state.auth);
    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/register-user" element={!userData ? <RegisterPage /> : <Navigate to={"/home"} />} />
                <Route path="/login-user" element={!userData ? <LoginPage /> : <Navigate to={"/home"} />} />
                <Route path="/select-entity" element={<ProtectedRoute><SelectEntity /></ProtectedRoute>} />
                <Route path="/otp" element={<OTP />} />
                <Route path="/traveller-page" element={<ProtectedRoute><TravellerPage /></ProtectedRoute>} />
                <Route path="/sender-page" element={<ProtectedRoute><SenderPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/traveller/:id" element={<ProtectedRoute><TravelerId /></ProtectedRoute>} />
                <Route path="/see-request" element={<ProtectedRoute><SeeRequest /></ProtectedRoute>} />
                <Route path="/sender-chat/:id" element={<ProtectedRoute><SenderChatpage /></ProtectedRoute>} />
                <Route path="/traveller-chat/:id" element={<ProtectedRoute><TravellerChatPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to={userData ? "/home" : "/login-user"} replace />} />
            </Routes>

        </>
    )

}

export default RouterService
