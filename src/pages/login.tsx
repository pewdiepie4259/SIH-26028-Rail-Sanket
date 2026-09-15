import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Sliders,
  UserCheck,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import {
  login,
  requestOTP,
  handleGoogleSignIn,
  getRoleRedirectPath,
  DEMO_TEAM_CREDENTIALS,
  type UserRole,
  type LoginMethod,
  type DemoAccount,
} from "../services/auth";

const BACKGROUND_SLIDES = [
  "/images/register-platform.jpg",
  "/images/register-coach.jpg",
  "/images/register-blue-coach.jpg",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 2-second continuous background slide rotation
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Role & Method state - Auto-select role based on route
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (location.pathname.includes("employee")) return "employee";
    if (location.pathname.includes("controller")) return "controller";
    if (location.pathname.includes("admin")) return "admin";
    return "user";
  });

  useEffect(() => {
    if (location.pathname.includes("employee")) {
      setSelectedRole("employee");
    } else if (location.pathname.includes("controller")) {
      setSelectedRole("controller");
    } else if (location.pathname.includes("admin")) {
      setSelectedRole("admin");
    }
  }, [location.pathname]);

  const [userLoginMethod, setUserLoginMethod] = useState<LoginMethod>("password");

  // Input states
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [controllerId, setControllerId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const roleConfig: Record<
    UserRole,
    { label: string; icon: typeof UserCheck; isRestricted: boolean; idLabel: string; placeholder: string }
  > = {
    user: {
      label: "Passenger",
      icon: UserCheck,
      isRestricted: false,
      idLabel: "Mobile No. or Email",
      placeholder: "e.g. 9876543210 or passenger@example.com",
    },
    employee: {
      label: "IR Employee",
      icon: Briefcase,
      isRestricted: false,
      idLabel: "Employee ID",
      placeholder: "e.g. IR-2024-8841",
    },
    controller: {
      label: "Controller",
      icon: Sliders,
      isRestricted: true,
      idLabel: "Controller ID",
      placeholder: "e.g. CTRL-SBC-01",
    },
    admin: {
      label: "Admin",
      icon: ShieldCheck,
      isRestricted: true,
      idLabel: "Admin ID",
      placeholder: "e.g. ADM-9001",
    },
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setOtpCode("");
    setOtpSent(false);
  };

  const handleQuickFill = (acc: DemoAccount) => {
    setSelectedRole(acc.role);
    setErrorMessage(null);
    setOtpSent(false);
    setOtpCode("");

    if (acc.role === "admin") {
      setAdminId(acc.identifier);
      setEmailOrPhone("");
      setControllerId("");
      setEmployeeId("");
    } else if (acc.role === "controller") {
      setControllerId(acc.identifier);
      setEmailOrPhone("");
      setAdminId("");
      setEmployeeId("");
    } else if (acc.role === "employee") {
      setEmployeeId(acc.identifier);
      setEmailOrPhone("");
      setAdminId("");
      setControllerId("");
    } else {
      setEmailOrPhone(acc.identifier);
      setUserLoginMethod("password");
      setAdminId("");
      setControllerId("");
      setEmployeeId("");
    }
    setPassword(acc.password);
    setSuccessMessage(`Loaded ${acc.name} (${acc.badge || acc.role.toUpperCase()}) credentials.`);
  };

  // Trigger Send / Resend OTP
  const handleSendOTP = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrPhone.trim()) {
      setErrorMessage("Please enter your mobile number or email to receive the OTP.");
      return;
    }

    setIsSendingOTP(true);
    const isEmail = emailOrPhone.includes("@");
    const res = await requestOTP(emailOrPhone, isEmail ? "email" : "phone");
    setIsSendingOTP(false);

    if (res.success) {
      setOtpSent(true);
      setOtpTimer(res.cooldownSeconds || 30);
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setIsLoading(true);
    try {
      const res = await login({
        role: selectedRole,
        method: userLoginMethod,
        emailOrPhone,
        password,
        otp: otpCode,
        employeeId,
        controllerId,
        adminId,
      });

      if (res.success && res.user) {
        window.dispatchEvent(new Event("raildrishti_auth_changed"));
        setSuccessMessage(`Authentication successful! Welcome, ${res.user.name}.`);
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get("redirect");
        setTimeout(() => {
          if (redirectParam) {
            navigate(redirectParam);
          } else {
            navigate(getRoleRedirectPath(res.user!.role));
          }
        }, 800);
      } else {
        setErrorMessage(res.message || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await handleGoogleSignIn();
      if (res.success && res.user) {
        window.dispatchEvent(new Event("raildrishti_auth_changed"));
        setSuccessMessage(`Google verified. Welcome, ${res.user.name}!`);
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get("redirect");
        setTimeout(() => {
          if (redirectParam) {
            navigate(redirectParam);
          } else {
            navigate(getRoleRedirectPath(res.user!.role));
          }
        }, 800);
      } else {
        setErrorMessage(res.message || "Google authentication could not be completed.");
      }
    } catch {
      setErrorMessage("Google OAuth error. Please use email/password sign-in.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;

    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotIdentifier("");
      setSuccessMessage("Password reset instructions have been dispatched to your registered address.");
    }, 1500);
  };

  const currentRoleConfig = roleConfig[selectedRole];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image Slideshow (2-second rotation) */}
      {BACKGROUND_SLIDES.map((slide, idx) => (
        <div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center lg:bg-[center_top] bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            currentSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}

      {/* Atmospheric Contrast Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#031426]/75 via-[#06283B]/60 to-[#031426]/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#031426]/90 via-transparent to-[#031426]/50 pointer-events-none" />

      {/* Centered Authentication Card Container with Glassmorphism */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="w-full overflow-hidden rounded-3xl border border-[#F59E0B] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FFF4E1] shadow-[0_12px_40px_rgba(7,26,51,0.35)]">
          {/* Header Title inside Card */}
          <div className="bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1] px-6 pt-7 pb-5 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              Welcome to
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#071A33]">
              Rail<span className="text-[#F59E0B]">Drishti</span>
            </h1>
          </div>

          {/* 4-Role Tabs Selector with Glassmorphic Container */}
          <div className="border-b border-[#F59E0B]/20 bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1] p-3">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#071A33]">
              Select Access Role
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(roleConfig) as UserRole[]).map((r) => {
                const isSelected = selectedRole === r;
                const IconComponent = roleConfig[r].icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`flex flex-col items-center justify-center rounded-xl border px-1 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] font-semibold text-white shadow-[0_5px_16px_rgba(7,26,51,0.28)] ring-2 ring-[#F59E0B]/20"
                        : "border-slate-200 bg-white/90 text-[#071A33] shadow-sm hover:border-[#F59E0B]/50 hover:bg-[#FFF8EC]"
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 mb-1 ${
                        isSelected ? "text-[#F59E0B]" : "text-[#6B7C8C]"
                      }`}
                    />
                    <span className="truncate capitalize text-[11px]">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Restricted Role Notices */}
            {currentRoleConfig.isRestricted && (
              <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/85 backdrop-blur-md p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">
                    {selectedRole === "admin" ? "System Admin Gateway" : "Section Controller Gateway"}
                  </div>
                  <div className="mt-0.5 text-amber-800 leading-relaxed text-[11px]">
                    {selectedRole === "admin"
                      ? "Admin accounts are provisioned exclusively by system directors."
                      : "Section Controller accounts are provisioned exclusively by authorized railway administrators."}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Methods for USER role: Password vs OTP */}
            {selectedRole === "user" && (
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-[#0E5961]/15 bg-gradient-to-r from-[#EAF4F5] via-white to-[#EAF4F5] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserLoginMethod("password");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer ${
                    userLoginMethod === "password"
                      ? "bg-white text-[#0E5961] font-semibold shadow-sm ring-1 ring-[#F59E0B]/20"
                      : "text-[#071A33] hover:text-[#0E7C86]"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserLoginMethod("otp");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all cursor-pointer ${
                    userLoginMethod === "otp"
                      ? "bg-white text-[#0E5961] font-semibold shadow-sm ring-1 ring-[#F59E0B]/20"
                      : "text-[#071A33] hover:text-[#0E7C86]"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>OTP Login</span>
                </button>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50/90 backdrop-blur-md p-3 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/90 backdrop-blur-md p-3 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}


            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* USER ROLE LOGIN FIELDS */}
              {selectedRole === "user" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Mobile Number or Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        {emailOrPhone.includes("@") ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="e.g. 9876543210 or name@example.com"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#78909C] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Sub-mode */}
                  {userLoginMethod === "password" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33]">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs font-medium text-[#0E7C86] hover:text-[#0E5961] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-[#78909C] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#78909C] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OTP Sub-mode */}
                  {userLoginMethod === "otp" && (
                    <div className="space-y-2.5 pt-1">
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isSendingOTP || !emailOrPhone.trim()}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-[0_6px_16px_rgba(14,89,97,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSendingOTP ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>Send 6-Digit OTP</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33]">
                              Enter OTP Code
                            </label>
                            {otpTimer > 0 ? (
                              <span className="text-[11px] text-[#6B7C8C] font-medium">
                                Resend in {otpTimer}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={isSendingOTP}
                                className="text-[11px] font-semibold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Resend OTP</span>
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="123456"
                            className="w-full tracking-widest text-center font-mono text-base font-bold rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 text-slate-900 focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* EMPLOYEE ROLE LOGIN FIELDS */}
              {selectedRole === "employee" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Employee ID
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. IR-2024-8841"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-3 text-sm text-slate-900 uppercase transition-colors placeholder:text-[#78909C] placeholder:normal-case focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-[#78909C] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#78909C] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* CONTROLLER ROLE LOGIN FIELDS */}
              {selectedRole === "controller" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Section Controller ID
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={controllerId}
                        onChange={(e) => setControllerId(e.target.value)}
                        placeholder="e.g. CTRL-SBC-01"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-3 text-sm text-slate-900 uppercase transition-colors placeholder:text-[#78909C] placeholder:normal-case focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Authorization Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-[#78909C] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#78909C] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ADMIN ROLE LOGIN FIELDS */}
              {selectedRole === "admin" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Unique Admin ID
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        placeholder="e.g. ADM-9001"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-3 text-sm text-slate-900 uppercase transition-colors placeholder:text-[#78909C] placeholder:normal-case focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                      Master Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-[#78909C] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#78909C] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Keep signed in */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#465B6B]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#B8C9D2] text-[#0E7C86] focus:ring-[#0E7C86]"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || (selectedRole === "user" && userLoginMethod === "otp" && !otpSent)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(14,89,97,0.35)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>
                      {selectedRole === "admin"
                        ? "Sign In as Administrator"
                        : selectedRole === "controller"
                        ? "Authorize Section Controller"
                        : selectedRole === "employee"
                        ? "Sign In with Employee ID"
                        : userLoginMethod === "otp"
                        ? "Verify OTP & Sign In"
                        : "Sign In to RailDrishti"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                  </>
                )}
              </button>
            </form>

            {/* Google Sign-In for Public Role */}
            {selectedRole === "user" && (
              <div className="mt-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#0E5961]/20" />
                  </div>
                  <span className="relative rounded-md bg-white px-3 text-xs uppercase tracking-wider text-[#0E5961]">
                    Or continue with
                  </span>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#B8C9D2]/80 bg-white/80 hover:bg-white backdrop-blur-md py-2 px-4 text-sm font-medium text-[#071A33] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Team Member Credentials Helper for Frontend Teammates */}
            <div className="mt-5 pt-3 border-t border-[#F59E0B]/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#071A33] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Team Quick-Login Fill
                </span>
                <span className="text-[10px] text-[#0E5961] font-semibold bg-[#0E5961]/10 px-2 py-0.5 rounded-full">
                  1-Click Test
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                {DEMO_TEAM_CREDENTIALS.map((acc) => (
                  <button
                    key={acc.name}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className="flex items-center justify-between p-2 text-left rounded-xl border border-slate-200 bg-white/90 hover:bg-amber-50 hover:border-[#F59E0B] transition-all text-xs cursor-pointer shadow-2xs group"
                    title={`Click to auto-fill: ${acc.identifier} / ${acc.password}`}
                  >
                    <div className="truncate mr-1">
                      <div className="font-semibold text-[11px] text-[#071A33] group-hover:text-[#0E5961] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {acc.identifier}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        acc.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : acc.role === "controller"
                          ? "bg-blue-100 text-blue-800"
                          : acc.role === "employee"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {acc.badge || acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation Link */}
            <div className="mt-4 pt-3 border-t border-[#0E5961]/20 text-center text-xs text-[#465B6B]">
              {selectedRole === "user" ? (
                <div>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#0E5961] hover:text-[#071A33] hover:underline"
                  >
                    Create User Account
                  </Link>
                </div>
              ) : selectedRole === "employee" ? (
                <div>
                  New Indian Railways staff?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#0E5961] hover:text-[#071A33] hover:underline"
                  >
                    Employee Registration
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#F59E0B] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FFF4E1] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#071A33]">Password Assistance</h3>
            <p className="text-xs text-[#465B6B] mt-1">
              Enter your registered RailDrishti identifier to receive verification instructions.
            </p>

            <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#071A33] mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                  className="w-full rounded-xl border border-[#B8C9D2] bg-white px-3 py-2 text-sm text-[#071A33] focus:border-[#0E7C86] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20"
                />
              </div>

              {forgotSent && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Processing reset request...</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-[#465B6B] hover:bg-[#FFF4E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="cursor-pointer rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 py-2 text-xs font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
