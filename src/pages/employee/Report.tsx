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
  CheckCircle2,
  AlertOctagon,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  RotateCcw,
  Send,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
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
  demoRecentReports,
  type IssueType,
  type IssueSeverity,
  type OperationalImpactStatus,
  type IssueReportItem,
  type EmployeeNavItem,
} from "../../services/employee";

export default function EmployeeReport() {
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
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [location, setLocation] = useState<string>("KSR Bengaluru Junction");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [severity, setSeverity] = useState<IssueSeverity | "">("");
  const [description, setDescription] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<OperationalImpactStatus | "">("");
  
  // Image State
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Submission & Workflow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submittedReport, setSubmittedReport] = useState<IssueReportItem | null>(null);
  const [recentReports, setRecentReports] = useState<IssueReportItem[]>(demoRecentReports);
  
  // Timeline Modal State
  const [selectedTimelineReport, setSelectedTimelineReport] = useState<IssueReportItem | null>(null);

  // Dynamic reference counter seed
  const [nextRefNumber, setNextRefNumber] = useState(142);


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

    if (!issueType) {
      errors.issueType = "Please select an issue type.";
    }

    const effectiveLocation = location === "Other" ? customLocation.trim() : location.trim();
    if (!effectiveLocation) {
      errors.location = "Please provide an operational location.";
    }

    if (!severity) {
      errors.severity = "Please select a severity.";
    }

    if (!description.trim()) {
      errors.description = "Please enter a description.";
    } else if (description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters long.";
    }

    if (!currentStatus) {
      errors.currentStatus = "Please select the current operational status.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      showToast("Please fill all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Simulate short network delay for professional UX (no actual backend call)
    setTimeout(() => {
      const generatedId = `RD-2026-${String(nextRefNumber).padStart(5, "0")}`;
      setNextRefNumber((prev) => prev + 1);

      const effectiveLocation = location === "Other" ? customLocation.trim() : location.trim();

      const getAssignedTeam = (type: IssueType) => {
        switch (type) {
          case "Signal":
            return "S&T Signal Maintenance Desk";
          case "Track":
            return "P-Way Engineering Gang";
          case "Platform":
            return "Station Operations & Commercial";
          case "Train":
            return "Rolling Stock & TXR Depot";
          case "Electrical":
            return "Traction (OHE) Control";
          case "Telecom":
            return "Telecom Operations Cell";
          case "Safety":
            return "Divisional Safety Directorate";
          case "Security":
            return "RPF Security Post";
          case "Medical":
            return "Railway Medical Unit";
          case "Other":
          default:
            return "Section Controller";
        }
      };

      const assignedTo = getAssignedTeam(issueType as IssueType);

      const newReport: IssueReportItem = {
        id: generatedId,
        issueType: issueType as IssueType,
        location: effectiveLocation,
        severity: severity as IssueSeverity,
        description: description.trim(),
        currentStatus: currentStatus as OperationalImpactStatus,
        status: "SUBMITTED",
        assignedTo,
        imageUrl: imagePreviewUrl || undefined,
        imageFileName: attachedImage?.name,
        createdAt: "Just now",
      };

      // Persist to centralized employee activity history
      logEmployeeActivity(
        {
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          time: formatIST(new Date(), is24Hour),
          action: `Reported ${issueType} Issue`,
          category: "ISSUE",
          status: "Reported",
          details: description.trim(),
          location: effectiveLocation,
          referenceId: generatedId,
        },
        currentUser?.employeeId
      );

      setSubmittedReport(newReport);
      setRecentReports((prev) => [newReport, ...prev]);
      setIsSubmitting(false);
      showToast(`Issue ${generatedId} reported successfully!`);
    }, 600);
  };

  // Reset Form for another submission
  const handleResetForm = () => {
    setSubmittedReport(null);
    setIssueType(roleSuggestions.primaryType || "");
    setLocation("KSR Bengaluru Junction");
    setCustomLocation("");
    setSeverity("");
    setDescription("");
    setCurrentStatus("");
    handleRemoveImage();
    setValidationErrors({});
  };

  // Sidebar navigation menu items
  const navItems: EmployeeNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard", active: true },
    { id: "duty", label: "My Duty", icon: CalendarCheck, path: "/employee/duty", active: true },
    { id: "assignment", label: "My Train / My Section", icon: TrainFront, path: "/employee/assignment", active: true },
    { id: "alerts", label: "Operational Alerts", icon: AlertTriangle, path: "/employee/alerts", active: true },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/employee/tasks", active: true },
    { id: "report_issue", label: "Report Issue", icon: FileWarning, path: "/employee/report", active: true },
    { id: "incident", label: "Incident Reporting", icon: Flame, path: "/employee/incidents", active: true },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/employee/notifications", active: true },
    { id: "history", label: "Activity / History", icon: History, path: "/employee/history", active: true },
    { id: "profile", label: "Profile", icon: User, path: "/employee/profile", active: true },
  ];

  // Role-Specific Issue Suggestions Mapping
  const roleSuggestions = useMemo(() => {
    switch (rawRole) {
      case "track_maintainer":
      case "section_engineer":
      case "bridge_structure_inspector":
        return {
          primaryType: "Track" as IssueType,
          suggestions: [
            { label: "Rail Weld Micro-Defect", type: "Track" as IssueType, text: "USFD flaw detected on rail joint. Emergency clamp and fishplate reinforcement required.", loc: "Section A Down Line Km 48/12" },
            { label: "Ballast Cushion Deficiency", type: "Track" as IssueType, text: "Ballast shoulder cushion measured below 250mm standard on turnout crossover.", loc: "Crossover #21 Km 51/20" },
            { label: "Loose Fishplate Bolts", type: "Track" as IssueType, text: "Fishplate bolts loosened on bridge approach sleepers. Standard torque wrench tightening needed.", loc: "Bridge Approach Km 46/00" },
            { label: "High Rail Temperature (58°C)", type: "Track" as IssueType, text: "Rail temperature reading 58°C (above TD+20). Immediate hot weather patrolling underway.", loc: "CWR Stretch Km 44–50" },
          ],
        };
      case "signal_maintainer":
        return {
          primaryType: "Signal" as IssueType,
          suggestions: [
            { label: "Point Machine 104 Stall", type: "Signal" as IssueType, text: "Point machine operating current spiked to 4.8A during reverse stroke. Point lock slide requires adjustment.", loc: "West Yard Points 104A" },
            { label: "Track Circuit TC-44 False Drop", type: "Signal" as IssueType, text: "High voltage impulse track circuit TC-44 showing intermittent false drop indications.", loc: "Signal Post S-14 / TC-44" },
            { label: "Signal S-14 Lamp Glitch", type: "Signal" as IssueType, text: "Red aspect main filament burned out on Home Signal; auxiliary filament active.", loc: "Home Signal Post S-14" },
            { label: "Station IPS Battery Discharge", type: "Signal" as IssueType, text: "110V DC station integrated power supply battery bank discharge test anomaly.", loc: "Relay Room IPS Bank" },
          ],
        };
      case "telecom_technician":
        return {
          primaryType: "Telecom" as IssueType,
          suggestions: [
            { label: "VHF Repeater RF Drop", type: "Telecom" as IssueType, text: "2W Simplex VHF driver-guard radio repeater dropped RF carrier power at tower.", loc: "Repeater Hut Km 52" },
            { label: "Station PIS Audio Codec Loss", type: "Telecom" as IssueType, text: "Platform 4 & 5 passenger audio announcement encoder buffer underrun.", loc: "PIS Server Room" },
            { label: "OFC Trunk Cable Trough Damage", type: "Telecom" as IssueType, text: "24-core OFC trunk line cable trough uncovered near bridge culvert.", loc: "OFC Trough Km 52" },
          ],
        };
      case "loco_pilot":
      case "assistant_loco_pilot":
        return {
          primaryType: "Train" as IssueType,
          suggestions: [
            { label: "Auxiliary Headlight Dimness", type: "Train" as IssueType, text: "Auxiliary headlamp lux output below visibility standard on front nose of locomotive.", loc: "Loco WAP-7 #30455 Cab 1" },
            { label: "VCD Audio Cycle Discrepancy", type: "Train" as IssueType, text: "Vigilance Control Device warning buzzer response interval irregular under cab noise.", loc: "Loco Cab 1" },
            { label: "Wiper Motor Intermittent", type: "Train" as IssueType, text: "Assistant pilot front windshield wiper motor stalling under rain load.", loc: "Cab 1 Windshield" },
            { label: "Brake Pipe Pressure Continuity Drop", type: "Train" as IssueType, text: "Feed pipe pressure slow to build up to 5.0 kg/cm² during stationary test.", loc: "WAP-7 #30455" },
          ],
        };
      case "train_manager":
        return {
          primaryType: "Train" as IssueType,
          suggestions: [
            { label: "Brake Pipe Pressure Fluctuation", type: "Train" as IssueType, text: "Rear guard van air brake pressure gauge fluctuating between 4.4 and 4.8 kg/cm².", loc: "Guard Van BVZC-901" },
            { label: "Vestibule Door Latch Jammed", type: "Train" as IssueType, text: "Inter-coach vestibule sliding door latch stuck between coaches C5 and C6.", loc: "Coach C5-C6 Vestibule" },
            { label: "Tail Lamp Flasher Battery Weak", type: "Train" as IssueType, text: "Portable LED flashing tail lamp battery indicator blinking yellow.", loc: "Rear Guard Van" },
          ],
        };
      case "tte":
        return {
          primaryType: "Train" as IssueType,
          suggestions: [
            { label: "Coach AC Duct Cooling Discomfort", type: "Train" as IssueType, text: "Coach B4 ambient temperature elevated (27°C). Passengers complaining of inadequate cooling.", loc: "Coach B4 Bay" },
            { label: "Berth Mobile Charging Socket Dead", type: "Train" as IssueType, text: "Mobile charging points inactive across berths 17 to 24 in Coach B2.", loc: "Coach B2 Berths 17-24" },
            { label: "Bio-Toilet Flush Valve Failure", type: "Train" as IssueType, text: "Lavatory flush solenoid valve not responding in Coach B3 west end.", loc: "Coach B3 Lavatory 2" },
          ],
        };
      case "station_master":
      case "station_superintendent":
        return {
          primaryType: "Platform" as IssueType,
          suggestions: [
            { label: "Platform LED Display Glitch", type: "Platform" as IssueType, text: "Platform 4 electronic train indicator LED matrix board not updating train schedule.", loc: "Platform 4 Main FOB" },
            { label: "Coach Watering Hydrant Leak", type: "Platform" as IssueType, text: "Hydrant pipe pressure drop at washing siding impacting outbound train watering.", loc: "Washing Siding Line 4" },
            { label: "FOB Escalator Safety Stoppage", type: "Platform" as IssueType, text: "Platform 2-3 Foot Overbridge escalator tripped on safety emergency stop.", loc: "Platform 2-3 FOB" },
            { label: "Platform Edge Tactile Paving Damaged", type: "Platform" as IssueType, text: "Tactile warning tiles chipped near coach position S4 causing passenger tripping hazard.", loc: "Platform 2 Bay" },
          ],
        };
      case "electrical_traction_technician":
        return {
          primaryType: "Electrical" as IssueType,
          suggestions: [
            { label: "OHE Contact Wire Tension Drop", type: "Electrical" as IssueType, text: "Auto-tensioning device weights resting on ground stop at Mast 42/18.", loc: "Mast 42/18 Down Line" },
            { label: "Section Insulator Thermal Hotspot", type: "Electrical" as IssueType, text: "12°C temperature elevation measured at 25kV crossover insulator assembly.", loc: "OHE Sector 1 Crossover" },
            { label: "Track Structure Bonding Cable Snapped", type: "Electrical" as IssueType, text: "Structure bonding continuity wire snapped near track crossing.", loc: "Mast 44/02 Up Line" },
          ],
        };
      case "rpf_escort_constable":
      case "station_security_officer":
        return {
          primaryType: "Security" as IssueType,
          suggestions: [
            { label: "Unauthorized Hawkers on Coach S3", type: "Security" as IssueType, text: "Unauthorized vendors boarding unreserved coaches without railway vendor badges.", loc: "Platform 4 Coach S3" },
            { label: "Unattended Luggage Package", type: "Security" as IssueType, text: "Unattended small parcel spotted on luggage rack in Coach S2; no owner identified.", loc: "Coach S2 Luggage Rack" },
            { label: "Emergency Exit Fire Door Obstructed", type: "Security" as IssueType, text: "Fire exit door near booking hall found obstructed by parcel packages.", loc: "West Booking Concourse" },
          ],
        };
      case "railway_medical_officer":
      case "emergency_medical_responder":
        return {
          primaryType: "Medical" as IssueType,
          suggestions: [
            { label: "Station First Aid Kit Refill Due", type: "Medical" as IssueType, text: "Trauma kit bag #2 missing sterile gauge bandages and burn dressings.", loc: "Station First Aid Room" },
            { label: "Station AED Battery Inspection Due", type: "Medical" as IssueType, text: "Automated External Defibrillator unit at Platform 2 indicates battery servicing.", loc: "Platform 2 Emergency Post" },
            { label: "Ambulance Stretcher Wheel Jammed", type: "Medical" as IssueType, text: "Emergency rapid ambulance transport stretcher wheel jammed on ramp.", loc: "Ambulance Bay" },
          ],
        };
      default:
        return {
          primaryType: "Other" as IssueType,
          suggestions: [
            { label: "Station Lighting Fixture Defect", type: "Electrical" as IssueType, text: "High-mast tower light quadrant 2 flickering near west parcel siding.", loc: "West Parcel Siding" },
            { label: "Water Cooler Filter Replacement", type: "Platform" as IssueType, text: "Drinking water fountain water purifier cartridge filter replacement required.", loc: "Platform 1 Concourse" },
            { label: "Operational Communication Line Stalled", type: "Telecom" as IssueType, text: "Control phone connection to station yard master cabin crackling.", loc: "Yard Master Cabin" },
          ],
        };
    }
  }, [rawRole]);

  // Pre-populate suggested primary type on mount if unselected
  useEffect(() => {
    if (!issueType && roleSuggestions.primaryType) {
      setIssueType(roleSuggestions.primaryType);
    }
  }, [roleSuggestions]);

  // Quick suggestion click handler
  const handleApplySuggestion = (sug: { label: string; type: IssueType; text: string; loc?: string }) => {
    setIssueType(sug.type);
    setDescription(sug.text);
    if (sug.loc) {
      setLocation("Other");
      setCustomLocation(sug.loc);
    }
    if (!severity) {
      setSeverity("MEDIUM");
    }
    if (!currentStatus) {
      setCurrentStatus("OPERATIONAL");
    }
    setValidationErrors({});
    showToast(`Applied: ${sug.label}`);
  };

  // Complete 10 Issue Type Options
  const issueTypes: { value: IssueType; label: string }[] = [
    { value: "Signal", label: "Signal" },
    { value: "Track", label: "Track" },
    { value: "Platform", label: "Platform" },
    { value: "Train", label: "Train" },
    { value: "Electrical", label: "Electrical" },
    { value: "Telecom", label: "Telecom" },
    { value: "Safety", label: "Safety" },
    { value: "Security", label: "Security" },
    { value: "Medical", label: "Medical" },
    { value: "Other", label: "Other" },
  ];

  // Demo Location Options
  const demoLocationOptions = [
    "KSR Bengaluru Junction",
    "Kengeri",
    "Ramanagara",
    "Bengaluru Cantonment",
    "Other",
  ];

  // Severity Options
  const severityOptions: {
    value: IssueSeverity;
    label: string;
    description: string;
    badgeStyle: string;
    borderActive: string;
  }[] = [
    {
      value: "LOW",
      label: "LOW",
      description: "Minor discrepancy with minimal operational delay",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      borderActive: "border-emerald-500 bg-emerald-500/10",
    },
    {
      value: "MEDIUM",
      label: "MEDIUM",
      description: "Moderate operational impact; attention required",
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      borderActive: "border-amber-500 bg-amber-500/10",
    },
    {
      value: "HIGH",
      label: "HIGH",
      description: "Substantial delay risk or equipment disruption",
      badgeStyle: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      borderActive: "border-orange-500 bg-orange-500/10",
    },
    {
      value: "CRITICAL",
      label: "CRITICAL",
      description: "Immediate safety hazard or complete section block",
      badgeStyle: "bg-red-500/20 text-red-400 border-red-500/50 font-bold animate-pulse",
      borderActive: "border-red-500 bg-red-500/20 ring-2 ring-red-500/40",
    },
  ];

  // Current Status (Operational Impact) Options
  const operationalStatusOptions: {
    value: OperationalImpactStatus;
    label: string;
    description: string;
    tagColor: string;
  }[] = [
    {
      value: "OPERATIONAL",
      label: "OPERATIONAL",
      description: "Issue exists but operations can continue normally.",
      tagColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      value: "RESTRICTED",
      label: "RESTRICTED",
      description: "Operations are possible with speed or routing restrictions.",
      tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      value: "BLOCKED",
      label: "BLOCKED",
      description: "Normal operation is currently blocked or line is suspended.",
      tagColor: "text-red-400 border-red-500/30 bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#031426] text-slate-100 flex flex-col font-sans selection:bg-[#F59E0B]/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E7C86] text-white px-4 py-3 rounded-lg shadow-xl border border-cyan-400/30 animate-bounce">
          <CheckCircle2 size={18} className="text-cyan-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#16364A] bg-[#071A33]/95 backdrop-blur-md px-4 sm:px-6">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-[#0A2036] text-white transition hover:bg-[#0E5961] lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#294665] bg-[#071A33] shadow-md">
              <img
                src="/logos/raildrishti-dark.png"
                alt="RailDrishti"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0E7C86]">
                  RailDrishti
                </span>
                <span className="rounded bg-[#F59E0B]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#F59E0B]">
                  EMPLOYEE PORTAL
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Operational Issue Reporting
              </h1>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* IST Clock */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] px-3 py-1.5 md:flex">
            <Clock size={16} className="text-[#0E7C86]" />
            <span className="font-mono text-sm font-medium text-slate-200">
              {formatIST(currentTime, is24Hour)} <span className="text-[10px] text-slate-400">IST</span>
            </span>
            <button
              type="button"
              onClick={() => setIs24Hour(!is24Hour)}
              className="ml-1 rounded border border-[#294665] bg-[#071A33] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 transition hover:bg-[#16364A]"
              title="Toggle 12h/24h format"
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>

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
        {/* MOBILE SIDEBAR BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#16364A] bg-[#071A33] transition-all duration-300 ease-in-out lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        >
          {/* Mobile Close Button */}
          <div className="flex h-[72px] items-center justify-between border-b border-[#16364A] px-4 lg:hidden">
            <span className="font-semibold text-white text-sm">Navigation Menu</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-[#0A2036] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = item.id === "report_issue";

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.active}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isCurrent
                      ? "border border-[#F59E0B] bg-[#0E7C86] text-white shadow-lg shadow-[#0E7C86]/20 font-semibold"
                      : item.active
                      ? "text-slate-300 hover:bg-[#0A2036] hover:text-white border border-transparent"
                      : "text-slate-500 cursor-not-allowed border border-transparent opacity-60"
                  }`}
                  title={item.phase ? `${item.label} (${item.phase})` : item.label}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      isCurrent ? "text-amber-300" : item.active ? "text-[#0E7C86]" : "text-slate-500"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.phase && (
                    <span className="rounded bg-[#16364A] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                      {item.phase}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Collapse Toggle (Desktop only) */}
          <div className="hidden border-t border-[#16364A] p-3 lg:block">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#16364A] bg-[#0A2036] py-2 text-xs text-slate-300 transition hover:bg-[#16364A] hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!sidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#031426] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#16364A] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#0E7C86] font-mono uppercase tracking-wider mb-1">
                  <FileWarning size={15} />
                  <span>Operational Issue Reporting Module</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  REPORT AN ISSUE
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Report an operational problem to the responsible railway team.
                </p>
              </div>

              {/* Status Flow Helper Pill */}
              <div className="flex items-center gap-1.5 rounded-lg border border-[#16364A] bg-[#071A33] px-3 py-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Workflow: <span className="text-slate-200 font-medium">Employee Report → Controller Review</span></span>
              </div>
            </div>

            {/* Validation Errors Global Banner */}
            {Object.keys(validationErrors).length > 0 && !submittedReport && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-300 text-sm flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-200">Please correct the following fields:</h4>
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
                {submittedReport ? (
                  <div className="rounded-2xl border border-emerald-500/40 bg-[#071A33] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    {/* Glowing highlight ribbon */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                    
                    <div className="flex items-center gap-3 text-emerald-400 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
                        <CheckCircle2 size={28} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">ISSUE REPORTED SUCCESSFULLY</h2>
                        <p className="text-xs text-emerald-300 font-medium">
                          Report received and queued for operational review
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-[#16364A] bg-[#0A2036] p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Reference ID
                          </span>
                          <span className="text-lg font-mono font-bold text-amber-400">
                            {submittedReport.id}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Status
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-xs font-bold text-cyan-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            {submittedReport.status}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Assigned To
                          </span>
                          <div className="text-sm font-semibold text-slate-200">
                            {submittedReport.assignedTo}
                            <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                              (Demo Assignment)
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                            Issue Type & Severity
                          </span>
                          <div className="text-sm font-medium text-slate-200 flex items-center gap-2 mt-0.5">
                            <span>{submittedReport.issueType}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-amber-300 font-semibold">{submittedReport.severity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#16364A] pt-3">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1">
                          Location & Description
                        </span>
                        <div className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <MapPin size={13} className="text-[#0E7C86]" />
                          <span>{submittedReport.location}</span>
                        </div>
                        <p className="text-xs text-slate-300 italic bg-[#071A33] p-2.5 rounded-lg border border-[#16364A]">
                          "{submittedReport.description}"
                        </p>
                      </div>

                      {submittedReport.imageUrl && (
                        <div className="border-t border-[#16364A] pt-3">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1.5">
                            Attached Media Preview
                          </span>
                          <div className="h-28 w-44 rounded-lg overflow-hidden border border-[#294665] bg-black/40">
                            <img
                              src={submittedReport.imageUrl}
                              alt="Attached preview"
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
                        onClick={() => setSelectedTimelineReport(submittedReport)}
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0E7C86] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0E5961] focus:ring-2 focus:ring-cyan-400"
                      >
                        <Eye size={17} />
                        <span>View Status Timeline</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#294665] bg-[#0A2036] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-[#16364A] hover:text-white"
                      >
                        <RotateCcw size={16} />
                        <span>Report Another Issue</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* REPORT FORM CARD */
                  <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 sm:p-7 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Role-Specific Quick Suggestions */}
                      {roleSuggestions.suggestions.length > 0 && (
                        <div className="rounded-xl border border-[#0E7C86]/30 bg-[#0A2036]/90 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                              <Sparkles size={15} className="text-amber-400" />
                              <span>Role-Specific Issue Suggestions:</span>
                              <span className="rounded bg-[#0E7C86]/20 border border-[#0E7C86]/40 px-2 py-0.5 text-[10px] text-cyan-200 font-mono">
                                {roleConfig.displayName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Click any item to auto-populate
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roleSuggestions.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplySuggestion(sug)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#294665] bg-[#071A33] px-3 py-1.5 text-xs text-slate-200 transition hover:border-[#0E7C86] hover:bg-[#0E7C86]/20 hover:text-white group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                                <span className="font-medium">{sug.label}</span>
                                <span className="rounded bg-[#0A2036] px-1 py-0.2 text-[9px] text-slate-400 font-mono">
                                  {sug.type}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 1: Issue Type & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Issue Type */}
                        <div>
                          <label
                            htmlFor="issueTypeSelect"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                          >
                            1. Issue Type <span className="text-red-400">*</span>
                          </label>
                          <select
                            id="issueTypeSelect"
                            value={issueType}
                            onChange={(e) => {
                              setIssueType(e.target.value as IssueType);
                              if (validationErrors.issueType) {
                                setValidationErrors((prev) => ({ ...prev, issueType: "" }));
                              }
                            }}
                            className={`w-full rounded-xl border bg-[#0A2036] px-3.5 py-2.5 text-sm text-white transition focus:outline-none focus:ring-2 ${
                              validationErrors.issueType
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#16364A] focus:border-[#0E7C86] focus:ring-[#0E7C86]/30"
                            }`}
                          >
                            <option value="" disabled>
                              Select issue type
                            </option>
                            {issueTypes.map((t) => (
                              <option key={t.value} value={t.value} className="bg-[#071A33] text-white">
                                {t.label}
                              </option>
                            ))}
                          </select>
                          {validationErrors.issueType && (
                            <p className="mt-1 text-xs text-red-400">{validationErrors.issueType}</p>
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="locationSelect"
                              className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                            >
                              2. Location <span className="text-red-400">*</span>
                            </label>
                            <span className="rounded bg-[#0A2036] border border-[#294665] px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
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
                                : "border-[#16364A] focus:border-[#0E7C86] focus:ring-[#0E7C86]/30"
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
                                placeholder="Enter specific station / track / KM mark..."
                                value={customLocation}
                                onChange={(e) => setCustomLocation(e.target.value)}
                                className="w-full rounded-lg border border-[#294665] bg-[#031426] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#0E7C86] focus:outline-none"
                              />
                            </div>
                          )}
                          {validationErrors.location && (
                            <p className="mt-1 text-xs text-red-400">{validationErrors.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Severity (Distinguishable indicators) */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                          3. Severity <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                    ? opt.borderActive
                                    : "border-[#16364A] bg-[#0A2036]/60 hover:bg-[#0A2036] hover:border-[#294665]"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`px-2 py-0.5 text-[11px] font-bold rounded border ${opt.badgeStyle}`}
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
                                <span className="text-[11px] text-slate-400 leading-tight">
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
                            className="text-xs font-semibold uppercase tracking-wider text-slate-300"
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
                          placeholder="Describe the operational issue, location details, and any relevant information..."
                          className={`w-full rounded-xl border bg-[#0A2036] p-3.5 text-sm text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
                            validationErrors.description
                              ? "border-red-500 focus:ring-red-400"
                              : "border-[#16364A] focus:border-[#0E7C86] focus:ring-[#0E7C86]/30"
                          }`}
                        />
                        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                          <span>Example: "Platform 4 display board is not showing the correct train information."</span>
                        </div>
                        {validationErrors.description && (
                          <p className="mt-1 text-xs text-red-400">{validationErrors.description}</p>
                        )}
                      </div>

                      {/* Section 4: Attach Image (Local Preview, No Upload) */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                          5. Attach Image <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>

                        {!imagePreviewUrl ? (
                          <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#294665] bg-[#0A2036]/40 p-5 hover:border-[#0E7C86] transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              aria-label="Upload issue reference photo"
                            />
                            <div className="flex flex-col items-center gap-1.5 text-center pointer-events-none">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071A33] border border-[#294665] text-[#0E7C86]">
                                <Upload size={18} />
                              </div>
                              <span className="text-xs font-medium text-slate-200">
                                Click or drag to attach operational photo
                              </span>
                              <span className="text-[10px] text-slate-400">
                                PNG, JPG, WEBP up to 5MB (Client preview only, no remote upload)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4 rounded-xl border border-[#294665] bg-[#0A2036] p-3">
                            <div className="relative h-20 w-28 rounded-lg overflow-hidden border border-[#16364A] bg-black/40 shrink-0">
                              <img
                                src={imagePreviewUrl}
                                alt="Issue Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200 truncate">
                                  <ImageIcon size={14} className="text-[#0E7C86] shrink-0" />
                                  <span className="truncate">{attachedImage?.name || "Attached image"}</span>
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
                                  <span>Remove Image</span>
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
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                          6. Current Status (Operational Impact) <span className="text-red-400">*</span>
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
                                    ? "border-[#0E7C86] bg-[#0E7C86]/15 ring-2 ring-[#0E7C86]/40"
                                    : "border-[#16364A] bg-[#0A2036]/60 hover:bg-[#0A2036] hover:border-[#294665]"
                                }`}
                              >
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mb-1.5 w-fit ${opt.tagColor}`}
                                >
                                  {opt.label}
                                </span>
                                <span className="text-xs text-slate-300 leading-snug">
                                  {opt.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {validationErrors.currentStatus && (
                          <p className="mt-1.5 text-xs text-red-400">{validationErrors.currentStatus}</p>
                        )}
                      </div>

                      {/* Submit & Action Controls */}
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
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0E7C86] px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0E5961] focus:ring-2 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>SUBMIT REPORT</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* SECONDARY COLUMN: GUIDANCE & RECENT REPORTS (4 Cols on desktop) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Reporting Guidance Card */}
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-3">
                    <Info size={15} />
                    <span>REPORT GUIDANCE</span>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div>
                      <h4 className="font-semibold text-white">What happened?</h4>
                      <p className="text-slate-400 mt-0.5">
                        State the visible fault or hazard clearly without speculation.
                      </p>
                    </div>

                    <div className="border-t border-[#16364A] pt-2.5">
                      <h4 className="font-semibold text-white">Where?</h4>
                      <p className="text-slate-400 mt-0.5">
                        Specify platform number, track kilometer, signal mast ID, or coach number.
                      </p>
                    </div>

                    <div className="border-t border-[#16364A] pt-2.5">
                      <h4 className="font-semibold text-white">How serious?</h4>
                      <p className="text-slate-400 mt-0.5">
                        Select <span className="text-red-400 font-semibold">CRITICAL</span> only if trains cannot pass safely or passenger hazard is imminent.
                      </p>
                    </div>

                    <div className="border-t border-[#16364A] pt-2.5 bg-[#0A2036] p-3 rounded-lg border">
                      <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <ArrowRight size={13} />
                        <span>Workflow Notice</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Reports are automatically categorized and routed to the responsible Section Controller and Maintenance Teams for immediate triage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Reports Card */}
                <div className="rounded-2xl border border-[#16364A] bg-[#071A33] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                      <History size={15} className="text-[#0E7C86]" />
                      <span>RECENT REPORTS</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#0A2036] px-2 py-0.5 rounded border border-[#16364A]">
                      {recentReports.length} logged
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {recentReports.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#16364A] bg-[#0A2036] p-3 transition hover:border-[#294665]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {item.id}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              item.status === "RESOLVED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : item.status === "UNDER_REVIEW"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : item.status === "IN_PROGRESS"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-200 mb-0.5">
                          {item.issueType} issue • <span className="font-normal text-slate-400">{item.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-[#16364A]">
                          <span
                            className={`font-semibold ${
                              item.severity === "CRITICAL"
                                ? "text-red-400"
                                : item.severity === "HIGH"
                                ? "text-orange-400"
                                : "text-amber-400"
                            }`}
                          >
                            {item.severity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedTimelineReport(item)}
                            className="flex items-center gap-1 text-[11px] text-[#0E7C86] hover:text-cyan-300 font-medium"
                          >
                            <span>View Status</span>
                            <ExternalLink size={11} />
                          </button>
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

      {/* STATUS TIMELINE MODAL */}
      {selectedTimelineReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#16364A] pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#0E7C86] tracking-wider block mb-1">
                  ISSUE STATUS TIMELINE (DEMO UI)
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Reference:</span>
                  <span className="font-mono text-amber-400">{selectedTimelineReport.id}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTimelineReport(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0A2036] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Issue Quick Details */}
            <div className="rounded-xl bg-[#0A2036] p-3.5 border border-[#16364A] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Issue Category:</span>
                <span className="font-semibold text-slate-200">{selectedTimelineReport.issueType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedTimelineReport.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Severity:</span>
                <span className="font-semibold text-amber-400">{selectedTimelineReport.severity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Team:</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedTimelineReport.assignedTo}</span>
              </div>
            </div>

            {/* Status Timeline */}
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
                    Issue report received and recorded in local system
                  </p>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineReport.status === "UNDER_REVIEW" ||
                      selectedTimelineReport.status === "ACTION_ASSIGNED" ||
                      selectedTimelineReport.status === "IN_PROGRESS" ||
                      selectedTimelineReport.status === "RESOLVED"
                        ? "bg-cyan-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineReport.status === "RESOLVED" ? "✓" : "2"}
                  </div>
                  <div className="w-0.5 h-10 bg-[#16364A]" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineReport.status === "UNDER_REVIEW" ? "text-cyan-300" : "text-slate-300"
                    }`}
                  >
                    Under Review
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Awaiting controller review and operational priority triage
                  </p>
                </div>
              </div>

              {/* Step 3: Action Assigned / In Progress */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineReport.status === "ACTION_ASSIGNED" ||
                      selectedTimelineReport.status === "IN_PROGRESS" ||
                      selectedTimelineReport.status === "RESOLVED"
                        ? "bg-amber-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineReport.status === "RESOLVED" ? "✓" : "3"}
                  </div>
                  <div className="w-0.5 h-10 bg-[#16364A]" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineReport.status === "IN_PROGRESS" ? "text-amber-300" : "text-slate-300"
                    }`}
                  >
                    Action Assigned & In Progress
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operational action assigned to engineering field maintenance team
                  </p>
                </div>
              </div>

              {/* Step 4: Resolved */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      selectedTimelineReport.status === "RESOLVED"
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-600 bg-[#0A2036] text-slate-400"
                    }`}
                  >
                    {selectedTimelineReport.status === "RESOLVED" ? "✓" : "4"}
                  </div>
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      selectedTimelineReport.status === "RESOLVED" ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    Resolved
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Field resolution verified and operational normalcy restored
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="rounded-xl border border-[#16364A] bg-[#0A2036] p-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Status:</span>
              <span className="rounded-md bg-[#0E7C86] px-3 py-1 text-xs font-bold text-white font-mono">
                {selectedTimelineReport.status}
              </span>
            </div>

            {/* Modal Close Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTimelineReport(null)}
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
