import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plane, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, GoogleProvider } from "@/lib/firebase";
import api from "@/services/Axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/stores/store";
import { setUserData } from "@/redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v3";

const RegisterPage = () => {
  const [accountType, setAccountType] = useState<"sender" | "traveller" | null>(
    null,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  //Google register function
  async function handleGoogleLogin() {
    try {
      const res = await signInWithPopup(auth, GoogleProvider);
      const idToken = await res.user.getIdToken();

      const response = await api.post("/auth/google", { idToken });
      if (response.status == 200) {
        dispatch(setUserData(response.data.user));
        navigate("/select-entity");
      }
    } catch (error: any) {
      console.error("Google login error", error);
      toast.error(error.response.data.message);
    }
  }

  //Register with manual

  const registerSchema = z.object({
    name: z.string(),
    email: z.string().email("Please enter a valid email address"),
    confirmPassword: z.string(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter is required")
      .regex(/[a-z]/, "One lowercase letter is required")
      .regex(/[0-9]/, "One number is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: any) => {
    if (data.password != data.confirmPassword) {
      toast.error("password do not match");
      return;
    }
    try {
      const res = await api.post("/auth/register-user", {
        name: data.name,
        email: data.email,
        password: data.password,
        entity: accountType,
      });
      if (res.status == 201) {
        dispatch(setUserData(res.data.user));
      }
      navigate("/");
    } catch (error: any) {
      toast.error(error.response.data.message);

      console.error(error);
    }
  };

  return (
    <div className="min-h-screen grid lg:h-screen lg:overflow-hidden lg:grid-cols-2 bg-[#0b1020]">
      {/* Left Section - Registration Form */}
      <div className="flex items-center justify-center px-5 py-4 sm:px-6 lg:py-2">
        <Card className="w-full max-w-md border-white/10 bg-[#111a2e] text-white shadow-2xl">
          <CardHeader className="space-y-1 pb-3">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#bef264] text-[#0b1020]">
              <Package size={22} />
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight">
              Create your account
            </CardTitle>

            <CardDescription className="text-slate-400">
              Join Quick & Pick and make parcel delivery smarter.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={handleGoogleLogin}
            >
              <svg
                viewBox="0 0 48 48"
                className="mr-2 h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.47-4.13 7.16-10.2 7.16-17.59Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.86l-7.65-5.94c-2.12 1.42-4.84 2.26-8.26 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] text-slate-500">
                OR REGISTER WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-slate-200">I want to join as</Label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("sender")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    accountType === "sender"
                      ? "border-[#bef264] bg-[#bef264]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <Package
                    size={20}
                    className={`mb-2 ${
                      accountType === "sender"
                        ? "text-[#bef264]"
                        : "text-slate-400"
                    }`}
                  />

                  <p className="text-sm font-semibold text-white">Sender</p>

                  <p className="mt-1 text-xs text-slate-400">
                    I want to send parcels
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("traveller")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    accountType === "traveller"
                      ? "border-[#bef264] bg-[#bef264]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <Plane
                    size={20}
                    className={`mb-2 ${
                      accountType === "traveller"
                        ? "text-[#bef264]"
                        : "text-slate-400"
                    }`}
                  />

                  <p className="text-sm font-semibold text-white">Traveller</p>

                  <p className="mt-1 text-xs text-slate-400">
                    I can carry parcels
                  </p>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-slate-200">
                Full Name
              </Label>

              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-9 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-[#bef264]"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-red-500 text-sm m-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-200">
                Email Address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-9 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-[#bef264]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm m-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-slate-200">
                Password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="h-9 border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-[#bef264]"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-red-500 text-sm m-2">
                    {errors.password.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm text-slate-200"
              >
                Confirm Password
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-9 border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-[#bef264]"
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Create Account */}
            <Button
              type="button"
              disabled={!accountType}
              className="h-9 w-full bg-[#bef264] font-semibold text-[#0b1020] hover:bg-[#a3e635] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleSubmit(onSubmit)}
            >
              Create Account
              <ArrowRight size={17} className="ml-2" />
            </Button>

            {/* Login Link */}
            <p className="text-center text-xs text-slate-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-[#bef264] hover:underline"
              >
                Login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right Section - Branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#bef264] p-8 xl:p-10 text-[#0b1020] lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[50px] border-[#0b1020]/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1020] text-[#bef264]">
            <Package size={22} />
          </div>

          <span className="text-xl font-bold tracking-tight">Quick & Pick</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="mb-4 inline-block rounded-full bg-[#0b1020]/10 px-4 py-2 text-xs font-semibold">
            Smarter delivery. Better journeys.
          </span>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Your journey.
            <br />
            Someone's delivery.
            <br />
            One smart connection.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-[#0b1020]/70">
            Connect people who need to send parcels with travellers who have
            space to carry them. Simple, smart and convenient.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#0b1020]/10 bg-white/20 p-4">
              <Package size={22} />
              <p className="mt-2 text-sm font-bold">For Senders</p>
              <p className="mt-1 text-xs text-[#0b1020]/70">
                Find travellers for your deliveries.
              </p>
            </div>

            <div className="rounded-2xl border border-[#0b1020]/10 bg-white/20 p-4">
              <Plane size={22} />
              <p className="mt-2 text-sm font-bold">For Travellers</p>
              <p className="mt-1 text-xs text-[#0b1020]/70">
                Earn while travelling.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#0b1020]/50">
          © 2026 Quick & Pick. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
