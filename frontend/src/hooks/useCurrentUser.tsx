import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "@/services/Axios";
import { setUserData } from "@/redux/slices/userSlice";

const useCurrentUser = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get("/auth/user/current-user");
                console.log("current user",res);
                dispatch(setUserData(res.data.user));
            } catch (error: any) {
                console.log(
                    error.response?.data?.message || "User not authenticated"
                );
            }
        };

        fetchCurrentUser();
    }, [dispatch]);
};

export default useCurrentUser;
