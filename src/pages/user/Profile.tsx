import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  ArrowLeft,
  Save,
  X,
  HeartHandshake,
  Globe,
  IdCard
} from "lucide-react";
import { getCurrentUser, updateCurrentUser, isValidEmail, isValidIndianPhone, type AuthUser } from "../../services/auth";

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current authenticated user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    dob: "",
    gender: "",
    avatarUrl: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelationship: "",
    preferredLanguage: "English",
    accessibilityNeeds: "",
  });

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state with authenticated user
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login?redirect=/user/profile", { replace: true });
      return;
    }
    setCurrentUser(user);
    initFormData(user);
  }, [navigate]);

  // Listen to external auth events
  useEffect(() => {
    const handleAuthChange = () => {
      const u = getCurrentUser();
      if (!u) {
        navigate("/login?redirect=/user/profile", { replace: true });
      } else {
        setCurrentUser(u);
      }
    };
    window.addEventListener("raildrishti_auth_changed", handleAuthChange);
    return () => window.removeEventListener("raildrishti_auth_changed", handleAuthChange);
  }, [navigate]);

  const initFormData = (user: AuthUser) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      alternatePhone: user.alternatePhone || "",
      dob: user.dob || "",
      gender: user.gender || "",
      avatarUrl: user.avatarUrl || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      emergencyContactName: user.emergencyContactName || "",
      emergencyContactPhone: user.emergencyContactPhone || "",
      emergencyRelationship: user.emergencyRelationship || "",
      preferredLanguage: user.preferredLanguage || "English",
      accessibilityNeeds: user.accessibilityNeeds || "",
    });
    setErrors({});
    setGlobalError(null);
  };

  const handleStartEdit = () => {
    if (currentUser) {
      initFormData(currentUser);
    }
    setSuccessMessage(null);
    setGlobalError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      initFormData(currentUser);
    }
    setIsEditing(false);
    setErrors({});
    setGlobalError(null);
  };

  // Image upload preview handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatarUrl: "Please select a valid image file (PNG, JPG, JPEG, WEBP)." }));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatarUrl: "Image file size should be less than 3MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.avatarUrl;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // Full Name
    if (!formData.name.trim()) {
      errs.name = "Full Name is required.";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Full Name must be at least 2 characters.";
    }

    // Email
    if (!formData.email.trim()) {
      errs.email = "Email Address is required.";
    } else if (!isValidEmail(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }

    // Mobile Phone
    if (formData.phone.trim() && !isValidIndianPhone(formData.phone)) {
      errs.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // Alternate Phone
    if (formData.alternatePhone.trim() && !isValidIndianPhone(formData.alternatePhone)) {
      errs.alternatePhone = "Please enter a valid 10-digit alternate mobile number.";
    }

    // Pincode (if entered)
    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = "Pincode must be a 6-digit numerical Indian postal code.";
    }

    // Emergency Contact Phone (if entered)
    if (formData.emergencyContactPhone.trim() && !isValidIndianPhone(formData.emergencyContactPhone)) {
      errs.emergencyContactPhone = "Please enter a valid 10-digit mobile number for emergency contact.";
    }

    // Date of Birth (if entered)
    if (formData.dob.trim()) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errs.dob = "Please provide a valid date of birth.";
      } else if (birthDate > today) {
        errs.dob = "Date of birth cannot be in the future.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setGlobalError(null);

    if (!validateForm()) {
      setGlobalError("Please fix the validation errors below before saving.");
      return;
    }

    if (!currentUser) return;

    setIsSaving(true);

    try {
      // Simulate small smooth processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser: AuthUser = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || currentUser.phone,
        alternatePhone: formData.alternatePhone.trim() || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        emergencyRelationship: formData.emergencyRelationship.trim() || undefined,
        preferredLanguage: formData.preferredLanguage || "English",
        accessibilityNeeds: formData.accessibilityNeeds.trim() || undefined,
      };

      // Persist to existing auth system
      updateCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");

      // Scroll to top of window
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setGlobalError("An unexpected error occurred while saving your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#F59E0B]/30 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-2">
                <ShieldCheck size={16} />
                <span>Verified Passenger Account</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                My Passenger Profile
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-200">
                Manage your personal details, travel preferences, and emergency contact information.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Dashboard</span>
              </Link>

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2 text-xs font-bold text-[#071A33] shadow-md transition hover:bg-amber-400 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-semibold text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-xs font-bold text-emerald-700 hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-semibold text-rose-900 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              className="text-xs font-bold text-rose-700 hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Top User Identity Header Bar */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-teal-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Photo Display / Picker */}
              <div className="relative shrink-0">
                {formData.avatarUrl || currentUser.avatarUrl ? (
                  <img
                    src={isEditing ? formData.avatarUrl : currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#071A33] to-[#0E5961] text-[#F59E0B] font-black text-3xl shadow-md border-4 border-white">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}

                {/* Edit Photo Icon Overlay */}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload photo"
                      className="p-2 rounded-xl bg-[#071A33] text-white hover:bg-[#0E5961] shadow-md transition cursor-pointer"
                    >
                      <Camera size={14} />
                    </button>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        title="Remove photo"
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
                    Passenger
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 size={11} />
                    {currentUser.status === "active" ? "Active Status" : currentUser.status}
                  </span>
                </div>
                <h2 className="mt-1 text-2xl sm:text-3xl font-black text-[#071A33]">
                  {currentUser.name || "Passenger"}
                </h2>
                <div className="mt-1 text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
                  <span>User ID: <strong className="font-mono text-slate-700">{currentUser.id}</strong></span>
                  <span>•</span>
                  <span>Registered: <strong className="text-slate-700">{new Date(currentUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                </div>
              </div>
            </div>

            {/* View Mode Action Button */}
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A33] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0E5961] transition cursor-pointer shrink-0"
              >
                <Edit3 size={15} className="text-[#F59E0B]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {errors.avatarUrl && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errors.avatarUrl}</span>
            </div>
          )}

          {/* Body Content: View Mode vs Edit Mode */}
          {isEditing ? (
            /* ========================================================= */
            /* 2. EDIT PROFILE FORM                                     */
            /* ========================================================= */
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                        errors.name
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                        errors.dob
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.dob && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.dob}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. user@example.com"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                        errors.email
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Primary Mobile Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit mobile number"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium font-mono ${
                        errors.phone
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Alternate Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Alternate Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value.replace(/\D/g, "") })}
                      placeholder="Optional 10-digit number"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium font-mono ${
                        errors.alternatePhone
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.alternatePhone && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.alternatePhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: ADDRESS DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Address Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {/* Street Address */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Residential / Postal Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House/Flat No., Street, Locality"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    />
                  </div>

                  {/* State */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      State / Union Territory
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="6-digit pincode"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium font-mono ${
                        errors.pincode
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: EMERGENCY CONTACT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HeartHandshake size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Emergency Contact
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit mobile number"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition font-medium font-mono ${
                        errors.emergencyContactPhone
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                      }`}
                    />
                    {errors.emergencyContactPhone && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.emergencyContactPhone}
                      </p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Relationship
                    </label>
                    <select
                      value={formData.emergencyRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PREFERENCES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Preferences & Accessibility
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Preferred Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Preferred Communication Language
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Bengali">বাংলা (Bengali)</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Marathi">मराठी (Marathi)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                      <option value="Malayalam">മലയാളം (Malayalam)</option>
                      <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
                      <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                  </div>

                  {/* Accessibility Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Special Assistance / Accessibility Needs (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.accessibilityNeeds}
                      onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                      placeholder="e.g. Wheelchair assistance, Senior citizen priority"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10"
                    />
                  </div>
                </div>
              </div>

              {/* READ-ONLY ACCOUNT INFORMATION SECTION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IdCard size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    System Information (Read-Only)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">User ID</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Account Role</span>
                    <span className="font-bold text-teal-700 capitalize">{currentUser.role} (Passenger)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Account Status</span>
                    <span className="font-bold text-emerald-700 uppercase">{currentUser.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Registered On</span>
                    <span className="font-bold text-slate-800">
                      {new Date(currentUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cancel and Save */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  <X size={15} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-8 py-3 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition cursor-pointer disabled:opacity-75"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} className="text-[#F59E0B]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* 1. NORMAL PROFILE VIEW MODE                               */
            /* ========================================================= */
            <div className="p-6 sm:p-8 space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#0E7C86]" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                      Personal Information
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Full Name</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.name || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Date of Birth</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.dob ? (
                        new Date(currentUser.dob).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="text-slate-400 italic">Not added</span>
                      )}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Gender</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.gender || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Email Address</span>
                    <span className="text-sm font-bold text-[#071A33] break-all">
                      {currentUser.email || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Primary Mobile</span>
                    <span className="text-sm font-bold font-mono text-[#071A33]">
                      {currentUser.phone ? `+91 ${currentUser.phone}` : <span className="text-slate-400 italic font-sans">Not added</span>}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Alternate Mobile</span>
                    <span className="text-sm font-bold font-mono text-[#071A33]">
                      {currentUser.alternatePhone ? (
                        `+91 ${currentUser.alternatePhone}`
                      ) : (
                        <span className="text-slate-400 italic font-sans">Not added</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ADDRESS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Address</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.address || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">City / State</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.city || currentUser.state ? (
                        `${currentUser.city || ""}${currentUser.city && currentUser.state ? ", " : ""}${currentUser.state || ""}`
                      ) : (
                        <span className="text-slate-400 italic">Not added</span>
                      )}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Pincode</span>
                    <span className="text-sm font-bold font-mono text-[#071A33]">
                      {currentUser.pincode || <span className="text-slate-400 italic font-sans">Not added</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: EMERGENCY CONTACT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HeartHandshake size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Emergency Contact
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Contact Person</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.emergencyContactName || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Contact Phone</span>
                    <span className="text-sm font-bold font-mono text-[#071A33]">
                      {currentUser.emergencyContactPhone ? (
                        `+91 ${currentUser.emergencyContactPhone}`
                      ) : (
                        <span className="text-slate-400 italic font-sans">Not added</span>
                      )}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Relationship</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.emergencyRelationship || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PREFERENCES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Preferred Language</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.preferredLanguage || "English"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Accessibility Requirements</span>
                    <span className="text-sm font-bold text-[#071A33]">
                      {currentUser.accessibilityNeeds || <span className="text-slate-400 italic">Not added</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 6: ACCOUNT INFORMATION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <IdCard size={18} className="text-[#0E7C86]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#071A33]">
                    Account Information (Read-Only)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">User ID</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Account Role</span>
                    <span className="font-bold text-teal-700 capitalize">{currentUser.role} (Passenger)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Account Status</span>
                    <span className="font-bold text-emerald-700 uppercase">{currentUser.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Registration Date</span>
                    <span className="font-bold text-slate-800">
                      {new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
