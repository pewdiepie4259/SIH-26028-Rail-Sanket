// src/components/UserPNRSection.tsx
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket,
  Search,
  TrainFront,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  X,
  Copy,
  Check,
} from "lucide-react";
import {
  type PNRRecord,
  getUserSavedBookings,
  lookupPNR,
  saveUserPNRNumber,
} from "../services/pnrService";
import type { AuthUser } from "../services/auth";

interface UserPNRSectionProps {
  currentUser: AuthUser;
}

export default function UserPNRSection({ currentUser }: UserPNRSectionProps) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<PNRRecord[]>([]);
  const [quickPnr, setQuickPnr] = useState("");
  const [pnrError, setPnrError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PNRRecord | null>(null);
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  useEffect(() => {
    setBookings(getUserSavedBookings());
  }, []);

  const handleQuickSearch = (e: FormEvent) => {
    e.preventDefault();
    const clean = quickPnr.trim().replace(/\D/g, "");
    if (clean.length !== 10) {
      setPnrError("Please enter a valid 10-digit Indian Railways PNR number.");
      return;
    }
    setPnrError(null);

    const found = lookupPNR(clean);
    if (found) {
      saveUserPNRNumber(clean);
      setBookings(getUserSavedBookings());
      setSelectedRecord(found);
    } else {
      // Navigate to /pnr page for comprehensive PRS lookup
      navigate(`/pnr?pnr=${clean}`);
    }
  };

  const handleCopyPnr = (pnr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2500);
  };

  const samplePnrs = ["4529108392", "8821903411", "6192837401"];

  return (
    <section className="relative mx-auto max-w-[1600px] px-6 py-6 lg:px-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Background card with gentle gradient & premium styling */}
      <div className="overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-white via-[#F6FBFC] to-[#EDF7F8] p-6 shadow-sm sm:p-8">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-teal-100/80 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0E7C86] to-[#071A33] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                <Ticket size={13} className="text-[#F59E0B]" />
                <span>My PRS Telemetry</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Verified Passenger: {currentUser.name || "Passenger"}</span>
              </span>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-[#071A33] sm:text-2xl">
              My Active Train Journeys & PNR Live Status
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Live seat allotment, coach composition, chart status, and dynamic train ETA for your ticketed journeys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/pnr"
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600/30 bg-white px-4 py-2 text-xs font-bold text-[#0E7C86] shadow-2xs transition-all hover:bg-teal-50 hover:border-[#0E7C86] cursor-pointer"
            >
              <span>Full PRS Portal</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Quick 10-Digit PNR Lookup Bar */}
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <form onSubmit={handleQuickSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                maxLength={10}
                value={quickPnr}
                onChange={(e) => {
                  setQuickPnr(e.target.value.replace(/\D/g, ""));
                  if (pnrError) setPnrError(null);
                }}
                placeholder="Enter any 10-digit PNR to track status (e.g. 4529108392)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-16 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal focus:border-[#0E7C86] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/20 transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] font-mono text-slate-400 pointer-events-none">
                {quickPnr.length}/10
              </span>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer shrink-0"
            >
              <Search size={14} className="text-[#F59E0B]" />
              <span>Check Status</span>
            </button>
          </form>

          {pnrError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-in fade-in">
              <AlertCircle size={14} />
              <span>{pnrError}</span>
            </div>
          )}

          {/* Sample PNR Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Quick Samples:</span>
            {samplePnrs.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuickPnr(sample);
                  setPnrError(null);
                  const found = lookupPNR(sample);
                  if (found) setSelectedRecord(found);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-700 transition hover:border-[#0E7C86] hover:bg-teal-50/70 hover:text-[#0E7C86] cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* User's Booked Journeys Cards */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Bookings ({bookings.length} Registered)
            </h3>
            <span className="text-[11px] text-slate-500">Click any journey for coach breakdown</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const firstPassenger = booking.passengers[0];
              const isConfirmed = firstPassenger?.confirmed ?? false;
              const isChartPrepared = booking.chartStatus === "Chart Prepared";

              return (
                <div
                  key={booking.pnr}
                  onClick={() => setSelectedRecord(booking)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0E7C86] hover:shadow-md cursor-pointer"
                >
                  {/* Card Header: Train Info & PNR */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-teal-50 border border-teal-100 p-2 text-[#0E7C86] group-hover:scale-110 transition-transform">
                          <TrainFront size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {booking.trainNumber}
                            </span>
                            <span className="text-xs font-bold text-[#071A33] line-clamp-1">
                              {booking.trainName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {booking.dateOfJourney}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-[#0E7C86]">{booking.bookingClass}</span>
                          </div>
                        </div>
                      </div>

                      {/* PNR Pill with Copy Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyPnr(booking.pnr, e)}
                        title="Copy PNR"
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-mono font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <span>{booking.pnr}</span>
                        {copiedPnr === booking.pnr ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} className="text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Route Timeline */}
                    <div className="mt-4 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[#071A33]">{booking.fromStation.code}</span>
                          <span className="ml-1 text-[11px] text-slate-500">({booking.fromStation.time})</span>
                          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                            {booking.fromStation.name}
                          </div>
                        </div>

                        <div className="flex flex-col items-center px-2">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Direct</div>
                          <div className="flex items-center gap-1 text-[#0E7C86]">
                            <div className="h-0.5 w-6 bg-teal-200" />
                            <ArrowRight size={12} />
                          </div>
                          <span className="text-[9px] font-bold text-amber-700">{booking.fromStation.platform}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-[#071A33]">{booking.toStation.code}</span>
                          <span className="ml-1 text-[11px] text-slate-500">({booking.toStation.time})</span>
                          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                            {booking.toStation.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seat & Status Summary */}
                    <div className="mt-3 flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 size={12} />
                            <span>
                              {firstPassenger?.coach ? `${firstPassenger.coach} / ${firstPassenger.berth}` : "Confirmed"}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                            <AlertCircle size={12} />
                            <span>{firstPassenger?.currentStatus || "Waitlist / RAC"}</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 font-medium">
                          ({booking.totalPassengers} Pax)
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isChartPrepared
                            ? "bg-emerald-100/80 text-emerald-800"
                            : "bg-amber-100/80 text-amber-800"
                        }`}
                      >
                        {booking.chartStatus}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(booking);
                      }}
                      className="flex-1 rounded-xl bg-teal-50/70 border border-teal-200 py-1.5 text-center text-xs font-bold text-[#0E7C86] hover:bg-teal-100 transition-colors"
                    >
                      Passenger Chart
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/eta?train=${booking.trainNumber}`);
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl bg-[#071A33] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0E5961] transition-colors"
                      title="Track Live Train ETA"
                    >
                      <Clock size={12} className="text-[#F59E0B]" />
                      <span>Live ETA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected PNR Quick Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Ticket size={20} className="text-[#F59E0B]" />
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    PNR Details: {selectedRecord.pnr}
                  </h3>
                  <p className="text-xs text-teal-200">
                    {selectedRecord.trainNumber} • {selectedRecord.trainName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
              {/* Journey Route Banner */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Origin</span>
                    <div className="font-bold text-sm text-[#071A33]">{selectedRecord.fromStation.name}</div>
                    <div className="font-mono text-xs text-slate-600">
                      {selectedRecord.fromStation.code} • {selectedRecord.fromStation.time} ({selectedRecord.fromStation.platform})
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400">{selectedRecord.dateOfJourney}</span>
                    <div className="flex items-center gap-1 text-[#0E7C86] my-1">
                      <div className="h-0.5 w-10 bg-teal-300" />
                      <TrainFront size={14} />
                      <div className="h-0.5 w-10 bg-teal-300" />
                    </div>
                    <span className="text-[10px] font-bold text-[#0E7C86]">{selectedRecord.className}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Destination</span>
                    <div className="font-bold text-sm text-[#071A33]">{selectedRecord.toStation.name}</div>
                    <div className="font-mono text-xs text-slate-600">
                      {selectedRecord.toStation.code} • {selectedRecord.toStation.time} ({selectedRecord.toStation.platform})
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger List Table */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Passenger Breakdown ({selectedRecord.passengers.length} Passenger{selectedRecord.passengers.length > 1 ? "s" : ""})
                  </h4>
                  <span className="text-xs font-bold text-emerald-700">
                    Total Fare: ₹{selectedRecord.fare}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Booking Status</th>
                        <th className="py-2.5 px-3">Current Status</th>
                        <th className="py-2.5 px-3">Coach</th>
                        <th className="py-2.5 px-3">Berth / Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRecord.passengers.map((p) => (
                        <tr key={p.number} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-bold text-slate-400 font-mono">{p.number}</td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-600">{p.bookingStatus}</td>
                          <td className="py-3 px-3 font-mono font-black text-[#071A33]">{p.currentStatus}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{p.coach}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700">
                              {p.berth} {p.berthType ? `(${p.berthType})` : ""}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart Status Banner */}
              <div className="flex items-center justify-between rounded-xl bg-teal-50/70 border border-teal-200/80 p-3.5 text-xs text-teal-950">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0E7C86] shrink-0" />
                  <span>
                    Charting Status: <strong>{selectedRecord.chartStatus}</strong> • Quota: <strong>{selectedRecord.quota}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/eta?train=${selectedRecord.trainNumber}`);
                  }}
                  className="rounded-xl border border-teal-600/40 bg-white px-4 py-2 text-xs font-bold text-[#0E7C86] hover:bg-teal-50 cursor-pointer"
                >
                  Track Live Train ETA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate(`/pnr?pnr=${selectedRecord.pnr}`);
                  }}
                  className="rounded-xl bg-[#071A33] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E5961] cursor-pointer"
                >
                  Full PRS Page →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
