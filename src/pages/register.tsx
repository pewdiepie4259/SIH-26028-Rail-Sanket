import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  BadgeAlert,
  Info,
  Layers,
} from "lucide-react";
import {
  registerUser,
  registerEmployee,
  handleGoogleSignIn,
  isPasswordStrong,
  isValidEmail,
  isValidIndianPhone,
  PASSWORD_RULES,
  getRoleRedirectPath,
  type PublicRegistrationRole,
} from "../services/auth";

const BACKGROUND_SLIDES = [
  "/images/register-platform.jpg",
  "/images/register-coach.jpg",
  "/images/register-blue-coach.jpg",
];

const DEPARTMENTS = [
  "Operations & Traffic Control",
  "Signal & Telecommunication (S&T)",
  "Civil & Track Engineering",
  "Mechanical & Rolling Stock",
  "Electrical & Traction (OHE)",
  "Commercial & Passenger Amenities",
  "Safety & Disaster Management",
];

export default function Register() {
  const navigate = useNavigate();

  // 2-second continuous background slide rotation
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_SLIDES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Selected tab: 'user' or 'employee' (Admin and Controller have NO public registration)
  const [activeTab, setActiveTab] = useState<PublicRegistrationRole>("user");

  // User Registration State
  const [userFullName, setUserFullName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [userTermsAccepted, setUserTermsAccepted] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);

  // Employee Registration State
  const [empFullName, setEmpFullName] = useState("");
  const [empId, setEmpId] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empDepartment, setEmpDepartment] = useState(DEPARTMENTS[0]);
  const [empRequestedRole, setEmpRequestedRole] = useState<"employee" | "controller">("employee");

  // Flow & Notification States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEmployeeSubmitted, setIsEmployeeSubmitted] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  const resetFormFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 1. USER REGISTRATION HANDLER
  const handleUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFormFeedback();

    if (!userFullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!isValidIndianPhone(userPhone)) {
      setErrorMessage("Please enter a valid 10-digit mobile number (e.g. 9876543210).");
      return;
    }

    if (!isValidEmail(userEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isPasswordStrong(userPassword)) {
      setErrorMessage("Password does not meet the security requirements listed below.");
      return;
    }

    if (userPassword !== userConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and re-type.");
      return;
    }

    if (!userTermsAccepted) {
      setErrorMessage("Please accept the Terms & Conditions before proceeding.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        fullName: userFullName,
        phoneNumber: userPhone,
        email: userEmail,
        password: userPassword,
        termsAccepted: userTermsAccepted,
      });

      if (res.success) {
        setIsUserRegistered(true);
        setSuccessMessage(res.message || "Account created successfully! You can now proceed to login.");
      } else {
        setErrorMessage(res.message || "Registration failed. Please try again.");
      }
    } catch {
      setErrorMessage("A network error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EMPLOYEE REGISTRATION HANDLER
  const handleEmployeeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFormFeedback();

    if (!empFullName.trim()) {
      setErrorMessage("Please provide your full legal name as per Indian Railways records.");
      return;
    }

    if (!empId.trim()) {
      setErrorMessage("Please enter your official Indian Railways Employee ID / Token.");
      return;
    }

    if (!isValidEmail(empEmail)) {
      setErrorMessage("Please enter a valid official railway email ID (e.g. @raildrishti.gov.in or official address).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerEmployee({
        fullName: empFullName,
        employeeId: empId,
        officialEmail: empEmail,
        department: empDepartment,
        requestedRole: empRequestedRole,
      });

      if (res.success) {
        setIsEmployeeSubmitted(true);
        setSuccessMessage(
          res.message ||
            "Your employee account registration has been submitted and is under review. Please check your official email for further updates."
        );
      } else {
        setErrorMessage(res.message || "Submission failed. Please try again.");
      }
    } catch {
      setErrorMessage("A network error occurred while submitting your application.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In (For public users only)
  const onGoogleRegister = async () => {
    setIsGoogleLoading(true);
    resetFormFeedback();
    try {
      const res = await handleGoogleSignIn();
      if (res.success && res.user) {
        setSuccessMessage(`Google registration verified. Welcome, ${res.user.name}!`);
        setTimeout(() => {
          navigate(getRoleRedirectPath(res.user!.role));
        }, 1000);
      } else {
        setErrorMessage(res.message || "Google Sign-In could not be completed.");
      }
    } catch {
      setErrorMessage("Google OAuth error. Please register using the standard form.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 overflow-hidden">
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

      {/* Centered Registration Card Container with Glassmorphism */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8">
        <div className="w-full overflow-hidden rounded-3xl border border-[#F59E0B] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FFF4E1] shadow-[0_12px_40px_rgba(7,26,51,0.35)]">
          {/* Header Title inside Card */}
          <div className="bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1] px-6 pt-7 pb-5 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              Registration Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#071A33]">
              Rail<span className="text-[#F59E0B]">Drishti</span>
            </h1>
          </div>

          {/* Public Registration Tab Selector with Glassmorphic Container */}
          <div className="border-b border-[#F59E0B]/20 bg-gradient-to-r from-[#FFF4E1] via-white to-[#FFF4E1] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#465B6B] mb-2 px-1">
              Select Registration Type
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("user");
                  resetFormFeedback();
                  setIsUserRegistered(false);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "user"
                    ? "border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white shadow-[0_5px_16px_rgba(7,26,51,0.28)] ring-2 ring-[#F59E0B]/20"
                    : "border border-slate-200 bg-white/90 text-[#071A33] shadow-sm hover:border-[#F59E0B]/50 hover:bg-[#FFF8EC]"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    activeTab === "user" ? "text-[#F59E0B]" : "text-[#6B7C8C]"
                  }`}
                />
                <span>Create User Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("employee");
                  resetFormFeedback();
                  setIsEmployeeSubmitted(false);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "employee"
                    ? "border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white shadow-[0_5px_16px_rgba(7,26,51,0.28)] ring-2 ring-[#F59E0B]/20"
                    : "border border-slate-200 bg-white/90 text-[#071A33] shadow-sm hover:border-[#F59E0B]/50 hover:bg-[#FFF8EC]"
                }`}
              >
                <Briefcase
                  className={`w-4 h-4 ${
                    activeTab === "employee" ? "text-[#F59E0B]" : "text-[#6B7C8C]"
                  }`}
                />
                <span>Employee Registration</span>
              </button>
            </div>
          </div>

          <div className="p-6">
                {/* Security Restriction Notice */}
                <div className="mb-4 rounded-xl border border-[#0E7C86]/20 bg-[#EAF4F5]/90 p-3 text-xs text-[#071A33] flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0E5961]" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-semibold text-[#071A33]">Admin & Controller Notice: </span>
                    Admin accounts have <strong>no public registration</strong>. Section Controller
                    roles require verified departmental authorization.
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50/90 backdrop-blur-md p-3 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/90 backdrop-blur-md p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{successMessage}</span>
                  </div>
                )}

                {/* ======================================================= */}
                {/* 1. USER REGISTRATION FORM                               */}
                {/* ======================================================= */}
                {activeTab === "user" && (
                  <>
                    {isUserRegistered ? (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-[#071A33]">
                          Account Created Successfully!
                        </h3>
                        <p className="text-xs text-[#465B6B] max-w-sm mx-auto">
                          Your passenger account is active and ready. You can now sign in using your
                          mobile number, email, or OTP.
                        </p>
                        <div className="pt-2">
                          <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-[1.02] transition-all"
                          >
                            <span>Proceed to Login</span>
                            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUserSubmit} className="space-y-3">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={userFullName}
                              onChange={(e) => setUserFullName(e.target.value)}
                              placeholder="e.g. Ramesh Sharma"
                              className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* Phone Number & Email ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Phone Number
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Phone className="w-4 h-4" />
                              </div>
                              <input
                                type="tel"
                                required
                                maxLength={10}
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ""))}
                                placeholder="9876543210"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Email ID
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                required
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="passenger@example.com"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Password
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showUserPassword ? "text" : "password"}
                                required
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-9 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowUserPassword(!showUserPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#0E5961] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                              >
                                {showUserPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showUserConfirmPassword ? "text" : "password"}
                                required
                                value={userConfirmPassword}
                                onChange={(e) => setUserConfirmPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-9 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowUserConfirmPassword(!showUserConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#0E5961] hover:text-[#465B6B] focus:outline-none cursor-pointer"
                              >
                                {showUserConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password Strength Indicator Checklist */}
                        {userPassword && (
                          <div className="rounded-xl border border-[#0E5961]/15 bg-[#F4FAFA]/95 p-2.5 text-xs space-y-1">
                            <div className="font-semibold text-[#071A33] mb-1 text-[11px]">
                              Password Strength Indicator:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                              {PASSWORD_RULES.map((rule) => {
                                const isValid = rule.test(userPassword);
                                return (
                                  <div
                                    key={rule.id}
                                    className={`flex items-center gap-1.5 ${
                                      isValid ? "font-medium text-emerald-600" : "text-[#6B7C8C]"
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`w-3 h-3 ${
                                        isValid ? "text-emerald-600" : "text-slate-300"
                                      }`}
                                    />
                                    <span>{rule.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Terms & Conditions Checkbox */}
                        <div className="pt-0.5">
                          <label className="flex items-start gap-2 cursor-pointer text-xs text-[#465B6B] leading-tight">
                            <input
                              type="checkbox"
                              checked={userTermsAccepted}
                              onChange={(e) => setUserTermsAccepted(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 rounded border-[#B8C9D2] text-[#071A33] focus:ring-[#0E7C86]"
                            />
                            <span className="text-[11px]">
                              I accept the RailDrishti Platform Terms & Conditions, Privacy Policy,
                              and Operational Guidelines.
                            </span>
                          </label>
                        </div>

                        {/* Register Button */}
                        <button
                          type="submit"
                          disabled={isLoading || isGoogleLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(14,89,97,0.35)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <span>Register User Account</span>
                              <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Google Sign-in for User Registration */}
                    {!isUserRegistered && (
                      <div className="mt-4">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#0E5961]/20" />
                          </div>
                          <span className="relative rounded-md bg-white px-3 text-xs uppercase tracking-wider text-[#0E5961]">
                            Or register with
                          </span>
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={onGoogleRegister}
                            disabled={isLoading || isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#B8C9D2] bg-white/80 hover:bg-white backdrop-blur-md py-2 px-4 text-sm font-medium text-[#071A33] transition-all shadow-xs disabled:opacity-60 cursor-pointer"
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
                  </>
                )}

                {/* ======================================================= */}
                {/* 2. EMPLOYEE REGISTRATION FORM                           */}
                {/* ======================================================= */}
                {activeTab === "employee" && (
                  <>
                    {isEmployeeSubmitted ? (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-[#EAF4F5] text-[#0E5961] mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-[#071A33]">
                          Application Submitted for Review
                        </h3>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-[#6B4A12] flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            Your employee account registration has been submitted and is under
                            review. Please check your official email for further updates.
                          </div>
                        </div>
                        <div className="pt-2">
                          <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] border border-[#F59E0B] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-[1.02] transition-all"
                          >
                            <span>Back to Login</span>
                            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleEmployeeSubmit} className="space-y-3.5">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={empFullName}
                              onChange={(e) => setEmpFullName(e.target.value)}
                              placeholder="e.g. Ramesh Sharma"
                              className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* Employee ID & Official Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Employee ID
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <BadgeAlert className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                required
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                placeholder="e.g. IR-2024-8841"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 uppercase transition-colors placeholder:text-[#0E5961] placeholder:normal-case focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Official Email ID
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                required
                                value={empEmail}
                                onChange={(e) => setEmpEmail(e.target.value)}
                                placeholder="name@raildrishti.gov.in"
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-[#0E5961] focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 shadow-xs"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Department & Role Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Department
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Building className="w-4 h-4" />
                              </div>
                              <select
                                value={empDepartment}
                                onChange={(e) => setEmpDepartment(e.target.value)}
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 cursor-pointer shadow-xs"
                                disabled={isLoading}
                              >
                                {DEPARTMENTS.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#071A33] mb-1">
                              Role
                            </label>
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#0E5961]">
                                <Layers className="w-4 h-4" />
                              </div>
                              <select
                                value={empRequestedRole}
                                onChange={(e) =>
                                  setEmpRequestedRole(e.target.value as "employee" | "controller")
                                }
                                className="w-full rounded-xl border border-[#B8C9D2] bg-white/90 backdrop-blur-md py-2 pl-10 pr-3 text-sm text-slate-900 transition-colors focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 cursor-pointer font-medium shadow-xs"
                                disabled={isLoading}
                              >
                                <option value="employee">Employee</option>
                                <option value="controller">Controller (Under Approval)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Explanatory Notice for Controller Application */}
                        {empRequestedRole === "controller" && (
                          <div className="rounded-xl border border-[#F59E0B]/30 bg-[#FFF8EC] backdrop-blur-md p-2.5 text-[11px] text-[#7A5515] flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                            <span>
                              Controller accounts are strictly regulated and will require divisional
                              verification prior to activation.
                            </span>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(14,89,97,0.35)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <span>Submit Employee Registration</span>
                              <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </>
                )}

                {/* Footer Navigation Link */}
                <div className="mt-4 pt-3 border-t border-[#0E5961]/20 text-center text-xs text-[#465B6B]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#0E5961] hover:text-[#071A33] hover:underline"
                  >
                    Sign in to your account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}