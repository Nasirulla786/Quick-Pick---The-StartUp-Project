
import { Route, Routes } from 'react-router-dom'
import WelcomeScreen from '../pages/WelcomeScreen'

const RouterService = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
            </Routes>

        </>
    )

}

export default RouterService
