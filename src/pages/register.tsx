import { type FormEvent, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  TrainFront,
  User,
  UserRoundCheck,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

type Role = "user" | "employee" | "controller"

interface FormData {
  fullName: string
  email: string
  phone: string
  role: Role
  employeeId: string
  department: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  role?: string
  employeeId?: string
  department?: string
  password?: string
  confirmPassword?: string
  termsAccepted?: string
  general?: string
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  role: "user",
  employeeId: "",
  department: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
}

const departments = [
  "Operations",
  "Traffic Control",
  "Station Management",
  "Engineering",
  "Signal & Telecommunication",
  "Safety",
  "Other",
]

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "One special character",
    test: (password: string) =>
      /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`';]/.test(password),
  },
]

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }))
  }

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {}

    const fullName = formData.fullName.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const employeeId = formData.employeeId.trim()

    if (!fullName) {
      nextErrors.fullName = "Full name is required."
    } else if (fullName.length < 2) {
      nextErrors.fullName = "Enter a valid full name."
    } else if (fullName.length > 80) {
      nextErrors.fullName = "Full name must not exceed 80 characters."
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/.test(fullName)) {
      nextErrors.fullName = "Use letters, spaces, apostrophes or hyphens only."
    }

    if (!email) {
      nextErrors.email = "Email address is required."
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      nextErrors.email = "Enter a valid email address."
    } else if (email.length > 120) {
      nextErrors.email = "Email address is too long."
    }

    if (!phone) {
      nextErrors.phone = "Mobile number is required."
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number."
    }

    if (!["user", "employee", "controller"].includes(formData.role)) {
      nextErrors.role = "Select a valid account role."
    }

    if (formData.role !== "user") {
      if (!employeeId) {
        nextErrors.employeeId =
          formData.role === "controller"
            ? "Controller ID is required."
            : "Employee ID is required."
      } else if (!/^[A-Za-z0-9/-]{3,30}$/.test(employeeId)) {
        nextErrors.employeeId = "Enter a valid official ID."
      }
    }

    if (formData.role !== "user") {
      if (!formData.department) {
        nextErrors.department = "Select your department."
      }
    }

    if (!formData.password) {
      nextErrors.password = "Password is required."
    } else if (!passwordRules.every((rule) => rule.test(formData.password))) {
      nextErrors.password = "Password does not meet all security requirements."
    } else if (formData.password.length > 128) {
      nextErrors.password = "Password must not exceed 128 characters."
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password."
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match."
    }

    if (!formData.termsAccepted) {
      nextErrors.termsAccepted =
        "You must accept the terms before creating an account."
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 700))

      setRegistrationComplete(true)

      setTimeout(() => {
        navigate("/login")
      }, 1600)
    } catch {
      setErrors({
        general: "Registration could not be completed. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordStrength = passwordRules.filter((rule) =>
    rule.test(formData.password)
  ).length

  const getPasswordStrengthLabel = () => {
    if (!formData.password) return ""
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 4) return "Moderate"
    return "Strong"
  }

  if (registrationComplete) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#F4F7FA] px-5 py-10 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[#F59E0B]/40 bg-white p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F4F5]">
              <CheckCircle2
                size={34}
                className="text-[#0E7C86]"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#071A33]">
              Registration Submitted
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your RailDrishti account registration has been submitted
              successfully. You will be redirected to the login page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F4F7FA]">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1600px] lg:grid-cols-[minmax(520px,0.9fr)_minmax(520px,1.1fr)]">
        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-7">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E7C86]">
                Account Registration
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#071A33] sm:text-4xl">
                Create your RailDrishti account
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Register securely to access railway intelligence,
                predictive ETA and operational monitoring features.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <UserRoundCheck
                    size={21}
                    className="text-[#F59E0B]"
                  />

                  <div>
                    <h2 className="text-base font-bold text-white">
                      Registration Details
                    </h2>

                    <p className="mt-0.5 text-xs text-[#D7E5EC]">
                      All fields marked with * are required.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                {errors.general && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{errors.general}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#071A33]"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      maxLength={80}
                      value={formData.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Enter your full name"
                      className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                        errors.fullName
                          ? "border-red-400"
                          : "border-slate-300"
                      }`}
                    />
                  </div>

                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-[#071A33]"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={120}
                        value={formData.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="name@example.com"
                        className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                          errors.email
                            ? "border-red-400"
                            : "border-slate-300"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-[#071A33]"
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="10-digit mobile number"
                        className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                          errors.phone
                            ? "border-red-400"
                            : "border-slate-300"
                        }`}
                      />
                    </div>

                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#071A33]">
                    Account Role <span className="text-red-500">*</span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: "user" as Role,
                        label: "User",
                        description: "Public train information",
                      },
                      {
                        value: "employee" as Role,
                        label: "Employee",
                        description: "Railway employee access",
                      },
                      {
                        value: "controller" as Role,
                        label: "Controller",
                        description: "Operations control access",
                      },
                    ].map((role) => {
                      const selected = formData.role === role.value

                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateField("role", role.value)}
                          className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                            selected
                              ? "border-[#0E7C86] bg-[#E7F4F5] shadow-sm"
                              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#F59E0B]/50 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-bold ${
                                selected
                                  ? "text-[#0E5961]"
                                  : "text-[#071A33]"
                              }`}
                            >
                              {role.label}
                            </span>

                            <span
                              className={`h-4 w-4 rounded-full border-2 ${
                                selected
                                  ? "border-[#0E7C86] bg-[#0E7C86]"
                                  : "border-slate-300"
                              }`}
                            />
                          </div>

                          <p className="mt-1 text-[11px] leading-4 text-slate-500">
                            {role.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {errors.role && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.role}
                    </p>
                  )}
                </div>

                {formData.role !== "user" && (
                  <div className="grid gap-5 rounded-xl border border-[#F59E0B]/20 bg-[#FFF8EC] p-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="employeeId"
                        className="mb-2 block text-sm font-semibold text-[#071A33]"
                      >
                        {formData.role === "controller"
                          ? "Controller ID"
                          : "Employee ID"}{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="employeeId"
                        name="employeeId"
                        type="text"
                        autoComplete="off"
                        maxLength={30}
                        value={formData.employeeId}
                        onChange={(event) =>
                          updateField(
                            "employeeId",
                            event.target.value.toUpperCase()
                          )
                        }
                        placeholder={
                          formData.role === "controller"
                            ? "Enter controller ID"
                            : "Enter employee ID"
                        }
                        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                          errors.employeeId
                            ? "border-red-400"
                            : "border-slate-300"
                        }`}
                      />

                      {errors.employeeId && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.employeeId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="department"
                        className="mb-2 block text-sm font-semibold text-[#071A33]"
                      >
                        Department <span className="text-red-500">*</span>
                      </label>

                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={(event) =>
                          updateField("department", event.target.value)
                        }
                        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                          errors.department
                            ? "border-red-400"
                            : "border-slate-300"
                        }`}
                      >
                        <option value="">Select department</option>

                        {departments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>

                      {errors.department && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.department}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[#071A33]"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>

                    {formData.password && (
                      <span
                        className={`text-xs font-bold ${
                          passwordStrength <= 2
                            ? "text-red-600"
                            : passwordStrength <= 4
                            ? "text-[#F59E0B]"
                            : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthLabel()}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={128}
                      value={formData.password}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      placeholder="Create a strong password"
                      className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                        errors.password
                          ? "border-red-400"
                          : "border-slate-300"
                      }`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#0E5961]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(formData.password)

                      return (
                        <div
                          key={rule.label}
                          className={`flex items-center gap-2 text-xs ${
                            passed
                              ? "text-green-600"
                              : "text-slate-500"
                          }`}
                        >
                          <CheckCircle2
                            size={14}
                            className={passed ? "text-green-600" : "text-slate-300"}
                          />

                          <span>{rule.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#071A33]"
                  >
                    Confirm Password{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={128}
                      value={formData.confirmPassword}
                      onChange={(event) =>
                        updateField(
                          "confirmPassword",
                          event.target.value
                        )
                      }
                      placeholder="Re-enter your password"
                      className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-[#071A33] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-slate-300"
                      }`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#0E5961]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(event) =>
                        updateField(
                          "termsAccepted",
                          event.target.checked
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0E7C86] accent-[#0E7C86]"
                    />

                    <span className="text-xs leading-5 text-slate-600">
                      I confirm that the information provided is accurate
                      and I agree to the RailDrishti terms of use and
                      security policies.
                    </span>
                  </label>

                  {errors.termsAccepted && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_5px_14px_rgba(14,89,97,0.22)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Create Account
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#0E7C86] underline-offset-2 transition hover:text-[#071A33] hover:underline"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <img
            src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Vande_Bharat_Express_at_KSR_Bengaluru.jpg"
            alt="Indian railway train at a railway station"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#071A33]/95 via-[#071A33]/65 to-[#0E5961]/55" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/60 bg-[#071A33]/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B] backdrop-blur-md">
                <TrainFront size={15} />
                Railway Intelligence Platform
              </div>

              <h2 className="mt-7 text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                Intelligence for every journey.
              </h2>

              <p className="mt-4 max-w-lg text-base leading-7 text-[#D7E5EC]">
                RailDrishti combines live railway movement, predictive ETA,
                weather intelligence and operational insights into one
                unified platform.
              </p>
            </div>

            <div className="max-w-xl space-y-4">
              <div className="rounded-2xl border border-white/15 bg-[#071A33]/65 p-5 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B]/60 bg-[#F59E0B]/10">
                    <ShieldCheck
                      size={21}
                      className="text-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Secure Role-Based Access
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#D7E5EC]">
                      Access is structured according to your role, helping
                      protect operational and railway information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-[#071A33]/65 p-5 backdrop-blur-md">
                  <MapPin
                    size={22}
                    className="text-[#F59E0B]"
                  />

                  <h3 className="mt-3 font-bold text-white">
                    Live Network
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#D7E5EC]">
                    Monitor train movement and railway network conditions.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-[#071A33]/65 p-5 backdrop-blur-md">
                  <TrainFront
                    size={22}
                    className="text-[#F59E0B]"
                  />

                  <h3 className="mt-3 font-bold text-white">
                    Predictive ETA
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#D7E5EC]">
                    View intelligent arrival predictions based on network
                    conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs text-[#BFD1DA]">
                <LockKeyhole size={15} className="text-[#F59E0B]" />
                Registration information is protected by secure account
                controls.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register