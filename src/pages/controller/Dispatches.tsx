// src/pages/controller/Dispatches.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Send,
  Inbox,
  CheckCircle2,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Mail,
  Radio,
} from "lucide-react";
import { getCurrentUser } from "../../services/auth";
import {
  fetchInbox,
  fetchSent,
  fetchStaffDirectory,
  sendOfficialDispatch,
  acknowledgeDispatchApi,
  OPERATIONAL_TEMPLATES,
  type DispatchItem,
  type StaffDirectoryItem,
  type DispatchPriority,
  type DispatchCategory,
} from "../../services/mailService";

export default function ControllerDispatches() {
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [inboxItems, setInboxItems] = useState<DispatchItem[]>([]);
  const [sentItems, setSentItems] = useState<DispatchItem[]>([]);
  const [directory, setDirectory] = useState<StaffDirectoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DispatchItem | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compose Form State
  const [recipientEmail, setRecipientEmail] = useState<string>("krutika.g@raildrishti.gov.in");
  const [category, setCategory] = useState<DispatchCategory>("operational_directive");
  const [priority, setPriority] = useState<DispatchPriority>("high");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [trainNumber, setTrainNumber] = useState<string>("12628");
  const [section, setSection] = useState<string>("Bengaluru Section (SBC)");
  const [stationCode, setStationCode] = useState<string>("SBC");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dir, inbox, sent] = await Promise.all([
        fetchStaffDirectory(),
        fetchInbox(currentUser?.email, "controller", currentUser?.id),
        fetchSent(currentUser?.email, currentUser?.id),
      ]);
      setDirectory(dir);
      setInboxItems(inbox);
      setSentItems(sent);

      if (inbox.length > 0 && !selectedItem) {
        setSelectedItem(inbox[0]);
      }
    } catch (err) {
      console.error("Error loading controller dispatches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.email]);

  const handleApplyTemplate = (tmpl: (typeof OPERATIONAL_TEMPLATES.controller)[0]) => {
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    showToast(`Loaded operational template: ${tmpl.label}`);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject.trim() || !body.trim()) {
      showToast("Please specify recipient, subject, and order body.");
      return;
    }

    setSending(true);
    const targetStaff = directory.find((d) => d.email.toLowerCase() === recipientEmail.toLowerCase());

    try {
      const res = await sendOfficialDispatch({
        senderId: currentUser?.id || "usr_ctrl_001",
        senderName: currentUser?.name || "Section Controller",
        senderRole: "controller",
        senderEmail: currentUser?.email || "controller@raildrishti.gov.in",
        recipientId: targetStaff?.id,
        recipientName: targetStaff?.name || recipientEmail,
        recipientRole: targetStaff?.role || "employee",
        recipientEmail,
        category,
        priority,
        subject,
        body,
        trainNumber: trainNumber || undefined,
        section: section || undefined,
        stationCode: stationCode || undefined,
      });

      if (res.success) {
        showToast("Operational directive dispatched & emailed to field staff!");
        setSubject("");
        setBody("");
        setActiveTab("sent");
        loadData();
      }
    } catch (err: any) {
      showToast(`Failed to dispatch directive: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleAcknowledge = async (item: DispatchItem) => {
    try {
      const res = await acknowledgeDispatchApi(item.id, currentUser?.name);
      if (res.success && res.dispatch) {
        setInboxItems((prev) => prev.map((i) => (i.id === item.id ? res.dispatch! : i)));
        setSelectedItem(res.dispatch);
        showToast("Memo acknowledged by Control Desk.");
      }
    } catch (err: any) {
      showToast(`Acknowledgment failed: ${err.message}`);
    }
  };

  const fieldStaffList = useMemo(() => {
    return directory.filter((d) => d.role === "employee" || d.role === "admin");
  }, [directory]);

  const filteredInbox = useMemo(() => {
    if (filterPriority === "all") return inboxItems;
    return inboxItems.filter((i) => i.priority === filterPriority);
  }, [inboxItems, filterPriority]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0E5961] text-white px-4 py-2.5 rounded-lg shadow-2xl border border-teal-400/40 text-xs font-semibold">
          <CheckCircle2 size={16} className="text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#145158] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0E5961] text-amber-400">
              <Mail size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Section Control Dispatches & Operational Directives</h1>
              <p className="text-xs text-[#9FB8BE]">
                Formal bidirectional correspondence hub between Section Controllers and Field Personnel.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-[#08383D]/60 p-1.5 rounded-lg border border-[#145158]">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === "inbox" ? "bg-[#0E5961] text-white shadow" : "text-[#9FB8BE] hover:text-white"
            }`}
          >
            <Inbox size={14} />
            <span>Field Memos ({inboxItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === "sent" ? "bg-[#0E5961] text-white shadow" : "text-[#9FB8BE] hover:text-white"
            }`}
          >
            <Send size={14} />
            <span>Issued Directives ({sentItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-extrabold transition ${
              activeTab === "compose"
                ? "bg-[#F59E0B] text-slate-950 shadow"
                : "bg-[#F59E0B]/20 text-amber-300 hover:bg-[#F59E0B]/30"
            }`}
          >
            <Radio size={14} />
            <span>+ Issue Directive</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Sync dispatches"
            className="p-1.5 text-[#9FB8BE] hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* VIEW 1: COMPOSE DIRECTIVE */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-[#145158] bg-[#07242B] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#145158] mb-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Send size={16} />
                Issue Official Operational Directive / Caution Order
              </h2>
              <span className="text-[11px] text-[#9FB8BE] font-mono">
                Control Desk: {currentUser?.email || "controller@raildrishti.gov.in"}
              </span>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                  To: Operational Field Staff / Station Master / Loco Pilot
                </label>
                <select
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {fieldStaffList.map((s) => (
                    <option key={s.id} value={s.email}>
                      {s.name} — {s.designation} ({s.email})
                    </option>
                  ))}
                  <option value="stationmaster@raildrishti.gov.in">
                    Duty Station Master Desk (stationmaster@raildrishti.gov.in)
                  </option>
                  <option value="locopilot@raildrishti.gov.in">
                    Duty Loco Pilot Crew Lobby (locopilot@raildrishti.gov.in)
                  </option>
                </select>
              </div>

              {/* Directive Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                    Directive Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DispatchCategory)}
                    className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="operational_directive">Operational Directive / Precedence Order</option>
                    <option value="speed_restriction">Temporary Speed Restriction (TSR / Caution)</option>
                    <option value="safety_circular">Safety Advisory / Weather Circular</option>
                    <option value="general">Official Dispatch Memo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as DispatchPriority)}
                    className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="high">High Priority (Immediate Action Required)</option>
                    <option value="urgent">Urgent Priority (Emergency / Caution Order)</option>
                    <option value="routine">Routine Priority (Informational)</option>
                  </select>
                </div>
              </div>

              {/* Train & Section Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                    Train Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12628"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                    Section / Corridor
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                    Target Station Code
                  </label>
                  <input
                    type="text"
                    value={stationCode}
                    onChange={(e) => setStationCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                  Directive Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAUTION ORDER: Impose 30 km/h speed restriction KM 341-343"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-[#145158] bg-[#08383D] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-[#D7E5EC] mb-1.5">
                  Official Directive Body & Specific Operating Instructions *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="State the operational restriction, precedence change, or safety action required..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border border-[#145158] bg-[#08383D] p-3 text-xs text-white font-mono placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#9FB8BE] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal-400" />
                  Sent to recipient's email address and logged in Control Audit
                </span>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 shadow-md"
                >
                  <Send size={14} />
                  {sending ? "Transmitting..." : "Issue & Send Real Email"}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Controller Directives Templates */}
          <div className="rounded-xl border border-[#145158] bg-[#07242B] p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#145158] pb-3">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Pre-Approved Section Directives
              </h3>
            </div>

            <p className="text-[11px] text-[#9FB8BE] leading-relaxed">
              Select standard railway operating procedures to populate the directive instantaneously:
            </p>

            <div className="space-y-2.5">
              {OPERATIONAL_TEMPLATES.controller.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-left rounded-lg border border-[#145158] bg-[#08383D] p-3 transition hover:border-amber-400/50 hover:bg-[#0E5961]/30 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      {tmpl.label}
                    </span>
                    <ChevronRight size={14} className="text-[#9FB8BE] group-hover:text-amber-400" />
                  </div>
                  <span className="mt-1 inline-block text-[10px] font-semibold text-teal-400 uppercase">
                    {tmpl.priority} priority · {tmpl.category.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-auto rounded-lg border border-teal-500/20 bg-[#0E5961]/20 p-3 text-[11px] text-teal-200">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400" />
                Compliance Tracking
              </div>
              Field staff must review and digitally acknowledge directives in their RailSanket console before shift completion.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INBOX & SENT */}
      {(activeTab === "inbox" || activeTab === "sent") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Pane */}
          <div className="lg:col-span-5 flex flex-col rounded-xl border border-[#145158] bg-[#07242B] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-[#145158] bg-[#08383D] p-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#9FB8BE]" />
                <span className="text-xs font-bold text-white">
                  {activeTab === "inbox" ? "Memos from Field Staff" : "Directives Dispatched by Control Desk"}
                </span>
              </div>

              {activeTab === "inbox" && (
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="rounded border border-[#145158] bg-[#07242B] px-2 py-1 text-[11px] text-white focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent Only</option>
                  <option value="high">High Only</option>
                  <option value="routine">Routine</option>
                </select>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#145158] max-h-[600px]">
              {loading ? (
                <div className="p-8 text-center text-xs text-[#9FB8BE]">Loading dispatches...</div>
              ) : (activeTab === "inbox" ? filteredInbox : sentItems).length === 0 ? (
                <div className="p-8 text-center text-xs text-[#9FB8BE]">No records in this folder.</div>
              ) : (
                (activeTab === "inbox" ? filteredInbox : sentItems).map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isUrgent = item.priority === "urgent";
                  const isHigh = item.priority === "high";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-[#0E5961]/40 border-l-4 border-amber-400"
                          : "hover:bg-[#08383D]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">
                          {activeTab === "inbox" ? item.sender_name : `To: ${item.recipient_name}`}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isUrgent
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : isHigh
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {item.subject}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#9FB8BE] pt-1">
                        <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-mono text-teal-400">
                          {item.status === "acknowledged" ? "✓ Acknowledged" : "Pending Acknowledgment"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail Pane */}
          <div className="lg:col-span-7 rounded-xl border border-[#145158] bg-[#07242B] overflow-hidden shadow-xl flex flex-col">
            {selectedItem ? (
              <div className="flex flex-col h-full">
                <div className="border-b border-[#145158] bg-[#08383D] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Ref: {selectedItem.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          selectedItem.priority === "urgent"
                            ? "bg-rose-600 text-white"
                            : selectedItem.priority === "high"
                            ? "bg-amber-500 text-slate-950 font-black"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {selectedItem.priority} PRIORITY
                      </span>
                      <span className="text-[10px] bg-[#071A33] text-teal-300 px-2 py-0.5 rounded font-mono">
                        {selectedItem.category.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-white mb-2">{selectedItem.subject}</h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#07242B] p-2.5 rounded-lg border border-[#145158]">
                    <div>
                      <span className="text-[#9FB8BE] block text-[9px] uppercase">From:</span>
                      <span className="text-white font-semibold">{selectedItem.sender_name}</span>
                    </div>
                    <div>
                      <span className="text-[#9FB8BE] block text-[9px] uppercase">To:</span>
                      <span className="text-white font-semibold">{selectedItem.recipient_name}</span>
                    </div>
                    <div>
                      <span className="text-[#9FB8BE] block text-[9px] uppercase">Train / Section:</span>
                      <span className="text-amber-300 font-mono">
                        {selectedItem.train_number ? `Train #${selectedItem.train_number}` : selectedItem.section || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9FB8BE] block text-[9px] uppercase">Logged:</span>
                      <span className="text-slate-300">
                        {new Date(selectedItem.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-5 overflow-y-auto bg-[#07242B]">
                  <div className="rounded-lg border border-[#145158] bg-[#08383D]/70 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.body}
                  </div>

                  {selectedItem.smtp_preview_url && (
                    <div className="mt-4 p-3 rounded-lg bg-teal-950/40 border border-teal-500/30 flex items-center justify-between">
                      <span className="text-xs text-teal-300">
                        ✉️ Rendered HTML email available via Ethereal web preview
                      </span>
                      <a
                        href={selectedItem.smtp_preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-[#0E5961] px-3 py-1 rounded"
                      >
                        Inspect Email <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="border-t border-[#145158] bg-[#08383D] p-4 flex items-center justify-between">
                  <div className="text-xs">
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        selectedItem.status === "acknowledged" ? "text-teal-400" : "text-amber-400"
                      }`}
                    >
                      {selectedItem.status === "acknowledged"
                        ? `✓ Acknowledged at ${new Date(selectedItem.acknowledged_at || "").toLocaleTimeString()}`
                        : "Pending Action / Compliance"}
                    </span>
                  </div>

                  {activeTab === "inbox" && selectedItem.status !== "acknowledged" && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(selectedItem)}
                      className="flex items-center gap-2 rounded-lg bg-[#0E5961] hover:bg-[#14707a] text-white px-4 py-2 text-xs font-bold transition shadow"
                    >
                      <CheckCircle2 size={15} className="text-teal-300" />
                      Acknowledge & Mark Logged
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-[#9FB8BE]">
                Select a dispatch from the list to view full details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
