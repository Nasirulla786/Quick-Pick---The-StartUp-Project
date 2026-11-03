
import React, { useRef, useState } from "react";
import {
    Camera,
    UserRound,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Pencil,
    Save,
} from "lucide-react";
import api from "@/services/Axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/stores/store";
import { setUserData } from "@/redux/slices/userSlice";

const MyProfile = () => {


    const [isEditing, setIsEditing] = useState(false);

    const { userData } = useSelector((state: RootState) => state.auth);
    const [backendImage, setBackendImage] = useState<File | null>(null)
    const [frontendImage, setFrontendImage] = useState<string | null>(null)
    const imageRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        name: userData?.name || "",
        email: userData?.email || "",

    });





    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const dispatch = useDispatch();

    const handleSave = async () => {

        setIsEditing(false);

        const formData: any = new FormData();
        formData.append("name", profile.name)
        formData.append("email", profile.email)
        if (backendImage) {
            formData.append("image", backendImage);
        }

        const res = await api.post("/auth/user/update-profile", formData);
        console.log("this is  res", res.data.user);
        dispatch(setUserData(res.data.user))


    };

    const fields = [
        { label: "Full Name", name: "name", icon: UserRound },
        { label: "Email Address", name: "email", icon: Mail },]



    return (
        <div className="space-y-7">

            {/* Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage your personal information.
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (isEditing) {
                            handleSave();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-[#bef264] text-[#0b1020] px-5 py-3 rounded-xl font-semibold"
                >
                    {isEditing ? <Save size={18} /> : <Pencil size={18} />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-[#111a2e] border border-white/10 rounded-2xl p-6">

                <div className="flex flex-wrap items-center gap-5" onClick={() => {
                    if (isEditing == true) {

                        imageRef.current?.click();
                    }
                }}>
                    <div className="relative">



                        {
                            frontendImage ? <img src={frontendImage} alt="None" className="w-22 h-22 rounded-full object-cover" /> : <div className="w-24 h-24 rounded-full bg-[#26334a] flex items-center justify-center">
                                <UserRound size={42} className="text-[#bef264]" />
                            </div>
                        }

                        <input type="file" hidden ref={imageRef} accept="image/*" onChange={(e) => {
                            console.log(e.target);
                            const file = e.target.files?.[0];

                            if (file) {
                                setBackendImage(file)
                                setFrontendImage(URL.createObjectURL(file))
                            }


                        }} />


                        <button className="absolute bottom-0 right-0 bg-[#bef264] text-[#0b1020] p-2 rounded-full">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold">{profile.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Traveller Account
                        </p>

                        <div className="flex items-center gap-2 mt-3 text-yellow-400 text-sm">
                            <ShieldCheck size={17} />
                            Verification Pending
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-[#111a2e] border border-white/10 rounded-2xl p-6">

                <h3 className="text-lg font-semibold mb-6">
                    Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {fields.map((field) => {
                        const Icon = field.icon;

                        return (
                            <div key={field.name}>
                                <label className="text-sm text-gray-400 mb-2 block">
                                    {field.label}
                                </label>

                                <div className="flex items-center gap-3 bg-[#0b1020] border border-white/10 rounded-xl px-4">
                                    <Icon size={18} className="text-gray-500" />

                                    <input
                                        name={field.name}
                                        value={profile[field.name as keyof typeof profile]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="w-full bg-transparent py-3 outline-none text-white disabled:opacity-70"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#111a2e] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-5">
                    Account Information
                </h3>

                <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400 text-sm">Account Type</span>
                    <span className="text-[#bef264] text-sm font-medium">
                        Traveller
                    </span>
                </div>

                <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 text-sm">Account Status</span>
                    <span className="text-green-400 text-sm font-medium">
                        Active
                    </span>
                </div>
            </div>

        </div>
    );
};

export default MyProfile;
