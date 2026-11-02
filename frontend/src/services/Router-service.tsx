
import { Route, Routes } from 'react-router-dom'
import WelcomeScreen from '../pages/WelcomeScreen'
import RegisterPage from '../pages/auth/RegisterPage'
import LoginPage from '../pages/auth/LoginPage'
import SelectEntity from '../pages/SelectEntity'
import Home from '@/pages/Home'
import OTP from '@/pages/auth/OTP'


const RouterService = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register-user" element={<RegisterPage />} />
                <Route path="/login-user" element={<LoginPage />} />
                <Route path="/select-entity" element={<SelectEntity />} />
                <Route path="/otp" element={<OTP/>} />

            </Routes>

        </>
    )

}

export default RouterService
