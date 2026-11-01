
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
import {
  Package,
  Plane,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { signInWithPopup } from "firebase/auth";
import { auth, GoogleProvider } from "@/lib/firebase";

import api from "@/services/Axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/stores/store";
import { setUserData } from "@/redux/slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Google Login
  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, GoogleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.post("/auth/google-login", {
        idToken,
      });

      if (response.status === 200) {
        dispatch(setUserData(response.data.user));
        navigate("/");
      }
    } catch (error: any) {
      console.error("Google login error:", error);

      toast.error(
        error.response?.data?.message || "Google login failed"
      );
    }
  }

  // Email Password Login
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post("/auth/login-user", {
        email: data.email,
        password: data.password,
      });

      if (response.status === 200) {
        dispatch(setUserData(response.data.user));
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0b1020]">

      {/* Login Form */}
      <div className="flex items-center justify-center px-5 py-10">

        <Card className="w-full max-w-md border-white/10 bg-[#111a2e] text-white shadow-2xl">

          <CardHeader className="space-y-2">

            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#bef264] text-[#0b1020]">
              <Package size={23} />
            </div>

            <CardTitle className="text-2xl font-bold">
              Welcome Back!
            </CardTitle>

            <CardDescription className="text-slate-400">
              Login to continue your Quick & Pick journey.
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-5">

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="h-11 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
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

              <span className="text-xs text-slate-500">
                OR LOGIN WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Email */}
            <div className="space-y-2">

              <Label className="text-slate-200">
                Email Address
              </Label>

              <Input
                type="email"
                placeholder="name@example.com"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Password */}
            <div className="space-y-2">

              <Label className="text-slate-200">
                Password
              </Label>

              <div className="relative">

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Login Button */}
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="h-11 w-full bg-[#bef264] font-semibold text-[#0b1020] hover:bg-[#a3e635]"
            >
              Login
              <ArrowRight size={17} className="ml-2" />
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register-user"
                className="font-semibold text-[#bef264] hover:underline"
              >
                Create Account
              </Link>
            </p>

          </CardContent>
        </Card>
      </div>

      {/* Branding Section */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#bef264] p-10 text-[#0b1020] lg:flex">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1020] text-[#bef264]">
            <Package size={23} />
          </div>

          <span className="text-xl font-bold">
            Quick & Pick
          </span>
        </div>

        <div className="max-w-lg">

          <span className="mb-4 inline-block rounded-full bg-[#0b1020]/10 px-4 py-2 text-xs font-semibold">
            Smarter delivery. Better journeys.
          </span>

          <h1 className="text-5xl font-bold leading-tight">
            Welcome back.
            <br />
            Your next journey
            <br />
            starts here.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-[#0b1020]/70">
            Connect people who need to send parcels
            with travellers who have space to carry them.
            Simple, smart and convenient.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-[#0b1020]/10 bg-white/20 p-4">
              <Package size={23} />
              <p className="mt-2 font-bold">For Senders</p>
              <p className="mt-1 text-xs text-[#0b1020]/70">
                Send parcels with ease.
              </p>
            </div>

            <div className="rounded-2xl border border-[#0b1020]/10 bg-white/20 p-4">
              <Plane size={23} />
              <p className="mt-2 font-bold">For Travellers</p>
              <p className="mt-1 text-xs text-[#0b1020]/70">
                Earn while travelling.
              </p>
            </div>

          </div>
        </div>

        <p className="text-xs text-[#0b1020]/50">
          © 2026 Quick & Pick. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
