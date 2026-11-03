
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


const RouterService = () => {
    const { userData } = useSelector((state: RootState) => state.auth);
    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/home" element={userData ? <Home /> : <Navigate to={"/login-user"} />} />
                <Route path="/register-user" element={!userData ? <RegisterPage /> : <Navigate to={"/home"} />} />
                <Route path="/login-user" element={!userData ? <LoginPage /> : <Navigate to={"/home"} />} />
                <Route path="/select-entity" element={<SelectEntity />} />
                <Route path="/otp" element={<OTP />} />
                <Route path="/traveller-page" element={<TravellerPage />} />

            </Routes>

        </>
    )

}

export default RouterService
