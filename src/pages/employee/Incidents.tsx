import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  TrainFront,
  AlertTriangle,
  CheckSquare,
  FileWarning,
  Flame,
  Bell,
  History,
  User,
  LogOut,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertOctagon,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Siren,
  HelpCircle,
  ShieldCheck,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/auth";
import {
  getRoleConfig,
  DEFAULT_OPERATIONAL_ROLE,
  type OperationalRoleId,
} from "../../config/employeeRoles";
import { logEmployeeActivity } from "../../services/employeeHistoryService";
import {
  demoRecentIncidents,
  type IncidentType,
  type IncidentSeverity,
  type IncidentOperationalStatus,
  type IncidentReportItem,
  type EmployeeNavItem,
} from "../../services/employee";
import { caseService } from "../../services/caseService";
import EmployeeSidebar from "../../components/employee/EmployeeSidebar";
import LanguageAndA11yControls from "../../components/LanguageAndA11yControls";

export default function EmployeeIncidents() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const rawRole = (currentUser?.operationalRole as OperationalRoleId) || DEFAULT_OPERATIONAL_ROLE;
  const roleConfig = getRoleConfig(rawRole) || getRoleConfig(DEFAULT_OPERATIONAL_ROLE);

  // State Setup
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [incidentType, setIncidentType] = useState<IncidentType | "">("");
  const [location, setLocation] = useState<string>("KSR Bengaluru – Platform 3");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [severity, setSeverity] = useState<IncidentSeverity>("CRITICAL"); // Default CRITICAL for emergency
  const [incidentDateTime, setIncidentDateTime] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [description, setDescription] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<IncidentOperationalStatus>("BLOCKED");

  // Image State
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Submission & Workflow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<IncidentReportItem | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<IncidentReportItem[]>(demoRecentIncidents);

  // Timeline Modal State
  const [selectedTimelineIncident, setSelectedTimelineIncident] = useState<IncidentReportItem | null>(null);

  // Fetch live incidents from central backend
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await caseService.getCases({
          role: "employee",
          employeeId: currentUser?.employeeId,
          caseType: "INCIDENT",
        });
        if (res.success && res.data && res.data.length > 0) {
          const mapped: IncidentReportItem[] = res.data.map((c) => ({
            id: c.id,
            incidentType: (c.category as IncidentType) || "Safety",
            location: c.location,
            severity: c.severity as IncidentSeverity,
            description: c.description,
            currentStatus: (c.operationalImpact as IncidentOperationalStatus) || "BLOCKED",
            status: c.status as any,
            assignedTo: c.assignedTeam || c.department || "Emergency Triage Cell",
            createdAt: new Date(c.createdAt).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setRecentIncidents(mapped);
        }
      } catch (err) {
        console.error("Failed to load incidents", err);
      }
    };
    fetchIncidents();
  }, [currentUser?.employeeId]);


  // IST Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const formatIST = (date: Date, use24: boolean) => {
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: !use24,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/employee/login", { replace: true });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Only image files (PNG, JPG, JPEG, WEBP) are supported.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB.");
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setAttachedImage(file);
    setImagePreviewUrl(preview);
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setAttachedImage(null);
    setImagePreviewUrl(null);
    setImageError(null);
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!incidentType) {
      errors.incidentType = "Please select an incident type.";
    }

    const effectiveLocation = location === "Other" ? customLocation.trim() : location.trim();
    if (!effectiveLocation) {
      errors.location = "Please select or provide an incident location.";
    }

    if (!severity) {
      errors.severity = "Please select the incident severity level.";
    }

    if (!description.trim()) {
      errors.description = "Please describe the incident and immediate impact.";
    } else if (description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters long.";
    }

    if (!currentStatus) {
      errors.currentStatus = "Please select the current operational condition.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Trigger Pre-Submission Confirmation Modal
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      showToast("Please fill all required incident fields before proceeding.");
      return;
    }

    setShowConfirmModal(true);
  };

  // Final Confirmed Submission
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const effectiveLocation = location === "Other" ? customLocation.trim() : location.trim();
      const res = await caseService.createCase({
        caseType: "INCIDENT",
        reporterId: currentUser?.employeeId || "EMP-7701",
        reporterName: currentUser?.name || "Railway Staff",
        reporterRole: rawRole,
        category: incidentType as string,
        location: effectiveLocation,
        severity: severity || "CRITICAL",
        description: description.trim(),
        operationalImpact: currentStatus || "BLOCKED",
      });

      if (res.success && res.data) {
        const generatedCase = res.data;
        const newIncident: IncidentReportItem = {
          id: generatedCase.id,
          incidentType: incidentType as IncidentType,
          location: effectiveLocation,
          severity: severity as IncidentSeverity,
          description: description.trim(),
          currentStatus: currentStatus as IncidentOperationalStatus,
          status: generatedCase.status as any,
          assignedTo: generatedCase.assignedTeam || "Section Controller & Emergency Cell",
          imageUrl: imagePreviewUrl || undefined,
          imageFileName: attachedImage?.name,
          createdAt: "Just now",
        };

        logEmployeeActivity(
          {
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
            time: formatIST(new Date(), is24Hour),
            action: `Reported ${incidentType} (${severity})`,
            category: "INCIDENT",
            status: "Reported",
            details: description.trim(),
            location: effectiveLocation,
            referenceId: generatedCase.id,
          },
          currentUser?.employeeId
        );

        setSubmittedIncident(newIncident);
        setRecentIncidents((prev) => [newIncident, ...prev.filter((p) => p.id !== newIncident.id)]);
        showToast(`Emergency Incident ${generatedCase.id} logged and dispatched to Central Control!`);
      } else {
        showToast(res.error || "Failed to log emergency incident.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to dispatch incident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form for another incident report
  const handleResetForm = () => {
    setSubmittedIncident(null);
    setIncidentType("");
    setLocation("KSR Bengaluru – Platform 3");
    setCustomLocation("");
    setSeverity("CRITICAL");
    setDescription("");
    setCurrentStatus("BLOCKED");
    handleRemoveImage();
    setValidationErrors({});
    setShowConfirmModal(false);
  };

  // Role-Specific Emergency Incident Suggestions
  const roleIncidentSuggestions = useMemo(() => {
    switch (rawRole) {
      case "loco_pilot":
      case "assistant_loco_pilot":
        return [
          { label: "Track Obstruction / Boulder", type: "Track Obstruction" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Large boulder fallen across Up track at cutting. Immediate section block required.", loc: "Section Approach Cutting Km 48/20" },
          { label: "Automatic Signal Blackout", type: "Signal Failure" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Complete aspect signal blackout across consecutive automatic signals.", loc: "Section S-42 Dadri Approach" },
          { label: "Traction Transformer Fire", type: "Fire" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Dense smoke and burning smell detected from machine room main transformer.", loc: "Loco Cab / Machine Room" },
        ];
      case "track_maintainer":
      case "section_engineer":
      case "bridge_structure_inspector":
        return [
          { label: "Rail Fracture Under Traffic", type: "Track Obstruction" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Rail web completely severed through 60mm transverse crack. Track impassable.", loc: "Down Main Line Km 48/12" },
          { label: "Track Landslide / Soil Slip", type: "Track Obstruction" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Heavy rain triggered 15-meter embankment soil slip under sleepers.", loc: "Cuttings Approach Km 45/10" },
          { label: "Bridge Pier Scour Displacement", type: "Equipment Failure" as IncidentType, severity: "HIGH" as IncidentSeverity, status: "RESTRICTED" as IncidentOperationalStatus, desc: "High water current displaced 3.2m masonry pier base protection stones.", loc: "Yamuna Bridge Pier #4" },
        ];
      case "signal_maintainer":
      case "telecom_technician":
        return [
          { label: "Electronic Interlocking Relay Crash", type: "Signal Failure" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Interlocking CPU standby failover aborted; all yard routes locked red.", loc: "West Yard Central Interlocking Cabin" },
          { label: "OHE Wire Dropped on Point Machine", type: "Equipment Failure" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Live wire dropped across turnout tie rod. Severe sparking observed.", loc: "Turnout Point 104" },
        ];
      case "rpf_escort_constable":
      case "station_security_officer":
        return [
          { label: "Suspicious Package / IED Threat", type: "Security Incident" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Unattended ticking metallic cylinder located under Concourse Pillar 7. BDDS cordon required.", loc: "Main Concourse Pillar 7" },
          { label: "Armed Conflict / Violence on Board", type: "Security Incident" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "RESTRICTED" as IncidentOperationalStatus, desc: "Armed altercation reported between passengers in Coach S3. Immediate escort reinforcements needed.", loc: "Train 12424 Coach S3" },
          { label: "Passenger Platform Fire Alarm", type: "Fire" as IncidentType, severity: "HIGH" as IncidentSeverity, status: "RESTRICTED" as IncidentOperationalStatus, desc: "Electrical conduit burning behind refreshment stall on Platform 2.", loc: "Platform 2 Concourse" },
        ];
      case "railway_medical_officer":
      case "emergency_medical_responder":
        return [
          { label: "Passenger Cardiac Arrest on Platform", type: "Medical Emergency" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "OPERATIONAL" as IncidentOperationalStatus, desc: "Unresponsive adult passenger collapsed on Platform 3. CPR and AED active.", loc: "Platform 3 Bay" },
          { label: "Passenger Fall from Moving Train", type: "Accident" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "RESTRICTED" as IncidentOperationalStatus, desc: "Passenger slipped between coach and platform apron at train start. Trauma evacuation underway.", loc: "Platform 1 Departure Apron" },
        ];
      case "station_master":
      case "station_superintendent":
      case "train_manager":
      default:
        return [
          { label: "Collision Threat / Overshoot", type: "Accident" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Train overshot starter signal aspect; approaching fouling mark of line 2.", loc: "Platform 2 Starter Signal" },
          { label: "Coach Vestibule Fire Alarm", type: "Fire" as IncidentType, severity: "CRITICAL" as IncidentSeverity, status: "BLOCKED" as IncidentOperationalStatus, desc: "Smoke detector activated in pantry car / AC coach vestibule. Fire extinguishers deployed.", loc: "Pantry Car Rake" },
          { label: "Onboard Severe Medical Crisis", type: "Medical Emergency" as IncidentType, severity: "HIGH" as IncidentSeverity, status: "OPERATIONAL" as IncidentOperationalStatus, desc: "Emergency doctor requested for critical passenger at approaching station halt.", loc: "Coach B1 Seat 8" },
        ];
    }
  }, [rawRole]);

  const handleApplyIncidentSuggestion = (sug: { label: string; type: IncidentType; severity: IncidentSeverity; status: IncidentOperationalStatus; desc: string; loc?: string }) => {
    setIncidentType(sug.type);
    setSeverity(sug.severity);
    setCurrentStatus(sug.status);
    setDescription(sug.desc);
    if (sug.loc) {
      setLocation("Other");
      setCustomLocation(sug.loc);
    }
    setValidationErrors({});
    showToast(`Loaded incident template: ${sug.label}`);
  };



  // Incident Type Options
  const incidentTypes: { value: IncidentType; label: string }[] = [
    { value: "Accident", label: "Accident" },
    { value: "Medical Emergency", label: "Medical Emergency" },
    { value: "Fire", label: "Fire" },
    { value: "Security Incident", label: "Security Incident" },
    { value: "Track Obstruction", label: "Track Obstruction" },
    { value: "Signal Failure", label: "Signal Failure" },
    { value: "Equipment Failure", label: "Equipment Failure" },
    { value: "Other Emergency", label: "Other Emergency" },
  ];

  // Demo Location Options
  const demoLocationOptions = [
    "KSR Bengaluru – Platform 1",
    "KSR Bengaluru – Platform 2",
    "KSR Bengaluru – Platform 3",
    "KSR Bengaluru – Platform 4",
    "Kengeri",
    "Ramanagara",
    "Assigned Section",
    "Other",
  ];

  // Severity Options with Heavy Critical Emphasis
  const severityOptions: {
    value: IncidentSeverity;
    label: string;
    description: string;
    badgeStyle: string;
    cardStyle: string;
  }[] = [
    {
      value: "CRITICAL",
      label: "CRITICAL",
      description: "Severe hazard, track blockage, casualty, or direct safety threat",
      badgeStyle: "bg-red-500/20 text-red-400 border-red-500/60 font-black",
      cardStyle: "border-red-500 bg-red-950/40 ring-2 ring-red-500/50 shadow-lg shadow-red-950/50",
    },
    {
      value: "HIGH",
      label: "HIGH",
      description: "Major system disruption or immediate risk of train delay cascade",
      badgeStyle: "bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold",
      cardStyle: "border-orange-500 bg-orange-950/30 ring-2 ring-orange-500/40",
    },
    {
      value: "MEDIUM",
      label: "MEDIUM",
      description: "Moderate operational impact with active mitigations possible",
      badgeStyle: "bg-amber-500/20 text-amber-400 border-amber-500/40 font-semibold",
      cardStyle: "border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/40",
    },
    {
      value: "LOW",
      label: "LOW",
      description: "Minor incident with no immediate movement disruption",
      badgeStyle: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold",
      cardStyle: "border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/40",
    },
  ];

  // Current Operational Status Options
  const operationalStatusOptions: {
    value: IncidentOperationalStatus;
    label: string;
    definition: string;
    colorClasses: string;
  }[] = [
    {
      value: "BLOCKED",
      label: "BLOCKED",
      definition: "Normal operation is currently blocked or line is suspended.",
      colorClasses: "border-red-500/40 bg-red-950/40 text-red-300",
    },
    {
      value: "RESTRICTED",
      label: "RESTRICTED",
      definition: "Operations are possible with speed or routing restrictions.",
      colorClasses: "border-amber-500/40 bg-amber-950/40 text-amber-300",
    },
    {
      value: "OPERATIONAL",
      label: "OPERATIONAL",
      definition: "Normal operations can continue despite the incident.",
      colorClasses: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
    },
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-red-400/50 animate-bounce">
          <Siren size={18} className="text-red-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-4 sm:px-6 shadow-lg">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500 bg-[#0A2036] text-white transition hover:bg-red-950/50 lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-red-500/40 bg-[#071A33] shadow-md ring-2 ring-red-500/20">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailSanket"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span translate="no" className="notranslate text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Rail<span className="text-[#F59E0B]">Sanket</span>
                </span>
                <span className="rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 text-[10px] font-bold text-red-300 flex items-center gap-1">
                  <Flame size={11} className="text-red-400" />
                  INCIDENT DESK
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Emergency & Safety Incident Reporting
              </h1>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live IST Clock Capsule */}
          <div className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-3 text-xs text-white shadow-sm transition-all duration-300">
            <Clock size={15} className="text-[#F59E0B]" />
            <div className="font-mono font-bold tracking-wider text-white">
              {formatIST(currentTime, is24Hour)} <span className="text-[#F59E0B] text-[10px] font-bold">IST</span>
            </div>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white hover:bg-[#F59E0B] hover:text-[#071A33] transition cursor-pointer border border-white/20"
              title="Toggle 12H / 24H clock"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

          {/* Language Selector & Accessibility Tools */}
          <LanguageAndA11yControls buttonHeightClass="h-9" />

          {/* Security */}
          <div className="hidden items-center gap-2 border-l border-[#16364A] pl-3 sm:flex">
            <ShieldCheck size={18} className="text-[#0E7C86]" />

            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white">
                {currentUser?.name || "Authorized Employee"}
              </div>
              <div className="text-[10px] text-[#71899C]">
                {roleConfig.displayName}
              </div>
            </div>

            <UserCircle size={24} className="text-[#AFC0D4]" />
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <EmployeeSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeTab="incident"
          departmentName={roleConfig.department}
          roleDisplayTitle={roleConfig.displayName}
          onShowToast={showToast}
        />

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#031426] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#16364A] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-red-400 font-mono uppercase tracking-wider mb-1">
                  <Flame size={15} />
                  <span>Safety & Emergency Escalation Desk</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
                  <AlertOctagon className="text-red-500 shrink-0" size={30} />
                  <span>EMERGENCY / INCIDENT</span>
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Report serious operational or safety incidents requiring immediate attention.
                </p>
              </div>

              {/* Status Flow Indicator */}
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2 text-xs text-red-300 font-medium shadow-md">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Priority Protocol: <span className="text-white font-bold">Immediate Section Controller Dispatch</span></span>
              </div>
            </div>

            {/* PROMINENT WARNING & SCOPE PANEL */}
            <div className="rounded-2xl border-2 border-red-500/50 bg-gradient-to-r from-red-950/60 via-[#071A33] to-[#0A2036] p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500 text-red-400">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                        IMPORTANT NOTICE
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                      Use this form <strong className="text-red-300 font-bold">only for serious incidents, accidents, or emergency situations</strong>.
                      For routine maintenance or normal operational issues, please use the standard reporting module.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-[#16364A] pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/report")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-[#0E7C86] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#0E5961]"
                  >
                    <span>Report a Normal Issue</span>
                    <ArrowRight size={14} />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Route: /employee/report
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Errors Global Banner */}
            {Object.keys(validationErrors).length > 0 && !submittedIncident && (
              <div className="rounded-xl border border-red-500 bg-red-950/50 p-4 text-red-200 text-sm flex items-start gap-3 shadow-lg">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Please correct the following required fields:</h4>
                  <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-xs text-red-300">
                    {Object.values(validationErrors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TWO COLUMN WORKSPACE GRID */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* PRIMARY COLUMN: FORM OR SUCCESS STATE (8 Cols on desktop) */}
              <div className="lg:col-span-8 space-y-6">
                {/* SUCCESS STATE CARD */}
                {submittedIncident ? (
                  <div className="rounded-2xl border-2 border-red-500/60 bg-[#071A33] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    {/* Glowing highlight ribbon */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 animate-pulse" />

                    <div className="flex items-center gap-3 text-red-400 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/50 shadow-inner">
                        <AlertOctagon size={28} className="text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white tracking-wide">
                          ⚠ INCIDENT REPORTED
                        </h2>
                        <p className="text-xs text-red-300 font-medium">
                          Emergency report logged and priority-routed to Section Controller
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-[#16364A] bg-[#0A2036] p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Reference ID
                          </span>
                          <span className="text-xl font-mono font-black text-red-400">
                            {submittedIncident.id}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Status
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 border border-red-500/50 px-2.5 py-1 text-xs font-black text-red-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                            {submittedIncident.status}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Priority / Severity
                          </span>
                          <span className="inline-block px-2.5 py-0.5 text-xs font-black rounded border bg-red-500/30 text-red-200 border-red-500 mt-0.5">
                            {submittedIncident.severity}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Assigned To
                          </span>
                          <div className="text-sm font-semibold text-slate-200">
                            {submittedIncident.assignedTo}
                            <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                              (Demo Assignment)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#16364A] pt-3">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1">
                          Incident Category & Location
                        </span>
                        <div className="text-xs text-slate-200 font-semibold mb-1 flex items-center gap-2">
                          <span className="text-red-400">{submittedIncident.incidentType}</span>
                          <span className="text-slate-500">•</span>
                          <div className="flex items-center gap-1 text-slate-300 font-normal">
                            <MapPin size={13} className="text-red-400" />
                            <span>{submittedIncident.location}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic bg-[#071A33] p-3 rounded-lg border border-[#16364A]">
                          "{submittedIncident.description}"
                        </p>
                      </div>

                      {submittedIncident.imageUrl && (
                        <div className="border-t border-[#16364A] pt-3">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1.5">
                            Attached Photo Evidence
                          </span>
                          <div className="h-28 w-44 rounded-lg overflow-hidden border border-red-500/30 bg-black/40">
                            <img
                              src={submittedIncident.imageUrl}
                              alt="Attached evidence"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/employee/cases/${submittedIncident.id}`)}
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-xl hover:from-red-500 hover:to-amber-500 transition"
                      >
                        <ExternalLink size={17} />
                        <span>Open Live Incident Case ({submittedIncident.id})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTimelineIncident(submittedIncident)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0E7C86] px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-[#0E5961]"
                      >
                        <Eye size={17} />
                        <span>Timeline View</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#294665] bg-[#0A2036] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-[#16364A] hover:text-white"
                      >
                        <RotateCcw size={16} />
                        <span>Report Another Incident</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INCIDENT REPORT FORM */
                  <div className="rounded-2xl border border-red-500/30 bg-[#071A33] p-5 sm:p-7 shadow-xl relative">
                    <form onSubmit={handleInitiateSubmit} className="space-y-6">
                      {/* Role-Specific Emergency Quick Suggestions */}
                      {roleIncidentSuggestions.length > 0 && (
                        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                              <Sparkles size={15} className="text-amber-400" />
                              <span>Role Emergency Presets:</span>
                              <span className="rounded bg-red-500/20 border border-red-500/50 px-2 py-0.5 text-[10px] text-red-200 font-mono">
                                {roleConfig.displayName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Click preset to load emergency parameters
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roleIncidentSuggestions.map((sug: any, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplyIncidentSuggestion(sug)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-[#071A33] px-3 py-1.5 text-xs text-slate-200 transition hover:border-red-500 hover:bg-red-500/20 hover:text-white group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
                                <span className="font-semibold">{sug.label}</span>
                                <span className="rounded bg-red-500/20 px-1 py-0.2 text-[9px] text-red-300 font-mono">
                                  {sug.type}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 1: Incident Type, Location, & Date/Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Incident Type */}
                        <div>
                          <label
                            htmlFor="incidentTypeSelect"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                          >
                            1. Incident Type <span className="text-red-400">*</span>
                          </label>
                          <select
                            id="incidentTypeSelect"
                            value={incidentType}
                            onChange={(e) => {
                              setIncidentType(e.target.value as IncidentType);
                              if (validationErrors.incidentType) {
                                setValidationErrors((prev) => ({ ...prev, incidentType: "" }));
                              }
                            }}
                            className={`w-full rounded-xl border bg-[#0A2036] px-3.5 py-2.5 text-sm text-white transition focus:outline-none focus:ring-2 ${
                              validationErrors.incidentType
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#16364A] focus:border-red-500 focus:ring-red-500/30"
                            }`}
                          >
                            <option value="" disabled>
                              Select incident type
                            </option>
                            {incidentTypes.map((t) => (
                              <option key={t.value} value={t.value} className="bg-[#071A33] text-white">
                                {t.label}
                              </option>
                            ))}
                          </select>
                          {validationErrors.incidentType && (
                            <p className="mt-1 text-xs text-red-400">{validationErrors.incidentType}</p>
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="locationSelect"
                              className="text-xs font-bold uppercase tracking-wider text-slate-200"
                            >
                              2. Location <span className="text-red-400">*</span>
                            </label>
                            <span className="rounded bg-[#0A2036] border border-[#294665] px-1.5 py-0.5 text-[10px] font-mono text-red-300">
                              Demo Location (No GPS)
                            </span>
                          </div>

                          <select
                            id="locationSelect"
                            value={location}
                            onChange={(e) => {
                              setLocation(e.target.value);
                              if (validationErrors.location) {
                                setValidationErrors((prev) => ({ ...prev, location: "" }));
                              }
                            }}
                            className={`w-full rounded-xl border bg-[#0A2036] px-3.5 py-2.5 text-sm text-white transition focus:outline-none focus:ring-2 ${
                              validationErrors.location
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#16364A] focus:border-red-500 focus:ring-red-500/30"
                            }`}
                          >
                            {demoLocationOptions.map((loc) => (
                              <option key={loc} value={loc} className="bg-[#071A33] text-white">
                                {loc}
                              </option>
                            ))}
                          </select>

                          {location === "Other" && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Enter specific location, platform, yard, or block KM..."
                                value={customLocation}
                                onChange={(e) => setCustomLocation(e.target.value)}
                                className="w-full rounded-lg border border-[#294665] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                              />
                            </div>
                          )}
                          {validationErrors.location && (
                            <p className="mt-1 text-xs text-red-400">{validationErrors.location}</p>
                          )}
                        </div>

                        {/* Date & Time of Incident */}
                        <div>
                          <label
                            htmlFor="incidentDateTime"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                          >
                            3. Incident Date / Time <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="incidentDateTime"
                            value={incidentDateTime}
                            onChange={(e) => setIncidentDateTime(e.target.value)}
                            className="w-full rounded-xl border border-[#16364A] bg-[#0A2036] px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 font-mono"
                          />
                          <p className="mt-1 text-[11px] text-slate-400">
                            Recorded in Indian Standard Time (IST)
                          </p>
                        </div>
                      </div>

                      {/* Section 2: Severity (CRITICAL emphasized) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            3. Severity <span className="text-red-400">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400 italic">
                            Select based on immediate operational or safety impact
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {severityOptions.map((opt) => {
                            const isSelected = severity === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setSeverity(opt.value);
                                  if (validationErrors.severity) {
                                    setValidationErrors((prev) => ({ ...prev, severity: "" }));
                                  }
                                }}
                                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                                  isSelected
                                    ? opt.cardStyle
                                    : "border-[#16364A] bg-[#0A2036]/60 hover:bg-[#0A2036] hover:border-[#294665]"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`px-2 py-0.5 text-[11px] rounded border ${opt.badgeStyle}`}
                                  >
                                    {opt.label}
                                  </span>
                                  {opt.value === "CRITICAL" ? (
                                    <AlertOctagon size={16} className="text-red-400" />
                                  ) : (
                                    <AlertTriangle
                                      size={14}
                                      className={
                                        opt.value === "HIGH"
                                          ? "text-orange-400"
                                          : opt.value === "MEDIUM"
                                          ? "text-amber-400"
                                          : "text-emerald-400"
                                      }
                                    />
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 leading-tight mt-1">
                                  {opt.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {validationErrors.severity && (
                          <p className="mt-1.5 text-xs text-red-400">{validationErrors.severity}</p>
                        )}
                      </div>

                      {/* Section 3: Description with Character Counter */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="descriptionInput"
                            className="text-xs font-bold uppercase tracking-wider text-slate-200"
                          >
                            4. Description <span className="text-red-400">*</span>
                          </label>
                          <span
                            className={`text-xs font-mono ${
                              description.length > 450
                                ? "text-amber-400 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            {description.length} / 500
                          </span>
                        </div>
                        <textarea
                          id="descriptionInput"
                          rows={4}
                          maxLength={500}
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (validationErrors.description) {
                              setValidationErrors((prev) => ({ ...prev, description: "" }));
                            }
                          }}
                          placeholder="Describe what happened, where it happened, and any immediate safety or operational impact..."
                          className={`w-full rounded-xl border bg-[#0A2036] p-3.5 text-sm text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
                            validationErrors.description
                              ? "border-red-500 focus:ring-red-400"
                              : "border-[#16364A] focus:border-red-500 focus:ring-red-500/30"
                          }`}
                        />
                        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                          <span>Example: "Passenger requires medical assistance on Platform 3."</span>
                        </div>
                        {validationErrors.description && (
                          <p className="mt-1 text-xs text-red-400">{validationErrors.description}</p>
                        )}
                      </div>

                      {/* Section 4: Attach Image / Evidence (Optional) */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                          5. Attach Image / Evidence <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>

                        {!imagePreviewUrl ? (
                          <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#294665] bg-[#0A2036]/40 p-5 hover:border-red-500/60 transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              aria-label="Upload incident photo evidence"
                            />
                            <div className="flex flex-col items-center gap-1.5 text-center pointer-events-none">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071A33] border border-red-500/30 text-red-400">
                                <Upload size={18} />
                              </div>
                              <span className="text-xs font-medium text-slate-200">
                                Click or drag to attach incident photo evidence
                              </span>
                              <span className="text-[10px] text-slate-400">
                                PNG, JPG, WEBP up to 5MB (Local preview only, no remote upload)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4 rounded-xl border border-red-500/30 bg-[#0A2036] p-3">
                            <div className="relative h-20 w-28 rounded-lg overflow-hidden border border-[#16364A] bg-black/40 shrink-0">
                              <img
                                src={imagePreviewUrl}
                                alt="Evidence Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200 truncate">
                                  <ImageIcon size={14} className="text-red-400 shrink-0" />
                                  <span className="truncate">{attachedImage?.name || "Evidence file"}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                  {attachedImage ? `${(attachedImage.size / 1024).toFixed(1)} KB` : "Image preview"}
                                </span>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition"
                                >
                                  <Trash2 size={13} />
                                  <span>Remove Evidence</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {imageError && (
                          <p className="mt-1 text-xs text-red-400">{imageError}</p>
                        )}
                      </div>

                      {/* Section 5: Current Operational Status */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                          6. Current Operational Status <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {operationalStatusOptions.map((opt) => {
                            const isSelected = currentStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setCurrentStatus(opt.value);
                                  if (validationErrors.currentStatus) {
                                    setValidationErrors((prev) => ({ ...prev, currentStatus: "" }));
                                  }
                                }}
                                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                                  isSelected
                                    ? "border-red-500 bg-red-950/40 ring-2 ring-red-500/40"
                                    : "border-[#16364A] bg-[#0A2036]/60 hover:bg-[#0A2036] hover:border-[#294665]"
                                }`}
                              >
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-black rounded border mb-1.5 w-fit ${
                                    opt.value === "BLOCKED"
                                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                                      : opt.value === "RESTRICTED"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <span className="text-xs text-slate-300 leading-snug">
                                  {opt.definition}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {validationErrors.currentStatus && (
                          <p className="mt-1.5 text-xs text-red-400">{validationErrors.currentStatus}</p>
                        )}
                      </div>

                      {/* Submit Action Controls */}
                      <div className="border-t border-[#16364A] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="w-full sm:w-auto text-xs text-slate-400 hover:text-slate-200 transition py-2 px-3"
                        >
                          Clear Form
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-red-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-red-950/60 transition hover:bg-red-700 focus:ring-2 focus:ring-red-400 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Submitting Incident...</span>
                            </>
                          ) : (
                            <>
                              <Siren size={18} className="text-red-200" />
                              <span>SUBMIT INCIDENT</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* SECONDARY COLUMN: WHEN TO USE & RECENT INCIDENTS (4 Cols on desktop) */}
              <div className="lg:col-span-4 space-y-6">
                {/* When to use this form Card */}
                <div className="rounded-2xl border border-red-500/30 bg-[#071A33] p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
                    <HelpCircle size={16} />
                    <span>WHEN TO USE THIS FORM</span>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Flame size={13} className="text-red-400" />
                        <span>Serious or Emergency Situations:</span>
                      </h4>
                      <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300 text-[11px]">
                        <li>Accidents & collisions</li>
                        <li>Passenger medical emergencies</li>
                        <li>Fire or smoke hazards</li>
                        <li>Security & RPF incidents</li>
                        <li>Track obstructions & landslides</li>
                        <li>Complete signal or power failures</li>
                      </ul>
                    </div>

                    <div className="border-t border-[#16364A] pt-3">
                      <h4 className="font-semibold text-slate-200 text-xs">For Routine Operational Problems:</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Use the standard Report Issue module for non-emergency platform, coach, or routine track concerns.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/employee/report")}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#294665] bg-[#0A2036] py-2 text-xs font-medium text-cyan-300 transition hover:bg-[#16364A]"
                      >
                        <FileWarning size={13} />
                        <span>Go to Report Issue</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Incidents Card (Demo Incident History) */}
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <History size={15} className="text-red-400" />
                      <span>RECENT INCIDENTS</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-300 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded">
                      Demo History
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {recentIncidents.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#16364A] bg-[#0A2036] p-3 transition hover:border-red-500/40"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-black text-red-400">
                            {item.id}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              item.status === "RESOLVED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : item.status === "RESPONSE_IN_PROGRESS"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : item.status === "ACTION_ASSIGNED"
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : item.status === "UNDER_REVIEW"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {item.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-200 mb-0.5">
                          {item.incidentType} • <span className="font-normal text-slate-400">{item.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-[#16364A]">
                          <span
                            className={`font-black ${
                              item.severity === "CRITICAL"
                                ? "text-red-400"
                                : item.severity === "HIGH"
                                ? "text-orange-400"
                                : "text-amber-400"
                            }`}
                          >
                            {item.severity}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/employee/cases/${item.id}`)}
                              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-bold"
                            >
                              <span>Case File</span>
                              <ExternalLink size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTimelineIncident(item)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-medium"
                            >
                              <span>Timeline</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PRE-SUBMISSION CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border-2 border-red-500 bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500 text-red-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">CONFIRM INCIDENT REPORT</h3>
                <p className="text-xs text-red-300 font-medium mt-0.5">
                  You are about to submit a serious operational incident.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-[#0A2036] p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Incident Type:</span>
                <span className="font-bold text-white">{incidentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-200">
                  {location === "Other" ? customLocation : location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className="font-black text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40">
                  {severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold text-amber-300">{currentStatus}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Please verify that this report is accurate. The Section Controller will receive immediate priority notification.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-[#294665] bg-[#0A2036] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#16364A] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-950/60 hover:bg-red-700 transition"
              >
                Confirm & Submit Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TIMELINE MODAL */}
      {selectedTimelineIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-red-400 tracking-wider block mb-1">
                  INCIDENT STATUS (DEMO UI)
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Reference:</span>
                  <span className="font-mono text-red-400">{selectedTimelineIncident.id}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTimelineIncident(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Incident Quick Details */}
            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Incident:</span>
                <span className="font-bold text-white">{selectedTimelineIncident.incidentType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedTimelineIncident.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Severity:</span>
                <span className="font-black text-red-400">{selectedTimelineIncident.severity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Team:</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedTimelineIncident.assignedTo}</span>
              </div>
            </div>

            {/* 5-Step Incident Status Timeline */}
            <div className="space-y-4 px-2">
              {/* Step 1: Submitted */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md">
                    ✓
                  </div>
                  <div className="w-0.5 h-10 bg-emerald-500/50" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Submitted</h4>
                    <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Incident report received
                  </p>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineIncident.status === "UNDER_REVIEW" ||
                      selectedTimelineIncident.status === "ACTION_ASSIGNED" ||
                      selectedTimelineIncident.status === "RESPONSE_IN_PROGRESS" ||
                      selectedTimelineIncident.status === "RESOLVED"
                        ? "bg-cyan-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineIncident.status === "RESOLVED" ? "✓" : "2"}
                  </div>
                  <div className="w-0.5 h-10 bg-[#16364A]" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineIncident.status === "UNDER_REVIEW" ? "text-cyan-300" : "text-slate-300"
                    }`}
                  >
                    Under Review
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Incident awaiting operational review
                  </p>
                </div>
              </div>

              {/* Step 3: Action Assigned */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineIncident.status === "ACTION_ASSIGNED" ||
                      selectedTimelineIncident.status === "RESPONSE_IN_PROGRESS" ||
                      selectedTimelineIncident.status === "RESOLVED"
                        ? "bg-amber-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineIncident.status === "RESOLVED" ? "✓" : "3"}
                  </div>
                  <div className="w-0.5 h-10 bg-[#16364A]" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineIncident.status === "ACTION_ASSIGNED" ? "text-amber-300" : "text-slate-300"
                    }`}
                  >
                    Action Assigned
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Responsible team assigned
                  </p>
                </div>
              </div>

              {/* Step 4: Response In Progress */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineIncident.status === "RESPONSE_IN_PROGRESS" ||
                      selectedTimelineIncident.status === "RESOLVED"
                        ? "bg-orange-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineIncident.status === "RESOLVED" ? "✓" : "4"}
                  </div>
                  <div className="w-0.5 h-10 bg-[#16364A]" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineIncident.status === "RESPONSE_IN_PROGRESS" ? "text-orange-300" : "text-slate-300"
                    }`}
                  >
                    Response In Progress
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operational response underway
                  </p>
                </div>
              </div>

              {/* Step 5: Resolved */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineIncident.status === "RESOLVED"
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineIncident.status === "RESOLVED" ? "✓" : "5"}
                  </div>
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineIncident.status === "RESOLVED" ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    Resolved
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Incident resolved
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="rounded-xl border border-[#16364A] bg-[#0A2036] p-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Status:</span>
              <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white font-mono">
                {selectedTimelineIncident.status}
              </span>
            </div>

            {/* Modal Close Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTimelineIncident(null)}
                className="rounded-xl bg-[#0A2036] border border-[#294665] px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#16364A] hover:text-white transition"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
