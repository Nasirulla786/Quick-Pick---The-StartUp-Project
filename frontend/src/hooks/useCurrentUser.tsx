import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "@/services/Axios";
import { clearUserData, setUserData } from "@/redux/slices/userSlice";

const useCurrentUser = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const fetchCurrentUser = async () => {
            try {
                const res = await api.get("/auth/user/current-user");
                dispatch(setUserData(res.data.user));
            } catch {
                dispatch(clearUserData());
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        fetchCurrentUser();

        return () => {
            isActive = false;
        };
    }, [dispatch]);

    return isLoading;
};

export default useCurrentUser;
