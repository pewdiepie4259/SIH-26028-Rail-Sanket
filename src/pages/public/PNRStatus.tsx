import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Ticket,
  Search,
  TrainFront,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  PhoneCall
} from "lucide-react";
import { getCurrentUser } from "../../services/auth";

import {
  type PNRRecord,
  MOCK_PNR_DATABASE,
} from "../../services/pnrService";

export default function PNRStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPnr = searchParams.get("pnr") || "";

  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [loading, setLoading] = useState(false);
  const [pnrResult, setPnrResult] = useState<PNRRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const currentUser = getCurrentUser();

  const handleLookup = (pnrToSearch: string) => {
    const clean = pnrToSearch.trim().replace(/\D/g, "");
    if (!clean || clean.length !== 10) {
      setError("Please enter a valid 10-digit PNR number.");
      setPnrResult(null);
      return;
    }

    setError(null);
    setLoading(true);
    setHasSearched(true);
    setSearchParams({ pnr: clean });

    setTimeout(() => {
      setLoading(false);
      const found = MOCK_PNR_DATABASE[clean];
      if (found) {
        setPnrResult(found);
      } else {
        // Generate simulated PRS record for any 10-digit number
        const simulated: PNRRecord = {
          pnr: clean,
          trainNumber: "12627",
          trainName: "Karnataka Express",
          fromStation: { name: "KSR Bengaluru", code: "SBC", time: "19:20", platform: "PF 1" },
          toStation: { name: "New Delhi", code: "NDLS", time: "06:15 (+2 days)", platform: "PF 3" },
          dateOfJourney: "Tomorrow",
          bookingClass: "3A",
          className: "AC 3 Tier (3A)",
          quota: "General (GN)",
          chartStatus: "Chart Prepared",
          totalPassengers: 1,
          passengers: [
            {
              number: 1,
              bookingStatus: "CNF / B2 / 35",
              currentStatus: "CNF / B2 / 35",
              coach: "B2",
              berth: "35",
              berthType: "Side Lower (SL)",
              confirmed: true,
            },
          ],
          fare: 2180,
          bookingDate: "Recent",
        };
        setPnrResult(simulated);
      }
    }, 600);
  };

  useEffect(() => {
    const p = searchParams.get("pnr");
    if (p && p.length === 10) {
      setPnrInput(p);
      handleLookup(p);
    }
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLookup(pnrInput);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-2">
                <Ticket size={16} />
                <span>Indian Railways Passenger Reservation System (PRS)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Live PNR Status Enquiry
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-200 max-w-2xl">
                Check real-time booking confirmation, coach allocation, berth position, and train chart status.
              </p>
            </div>

            {currentUser && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shrink-0">
                <div className="h-9 w-9 rounded-full bg-[#F59E0B] text-[#071A33] font-black flex items-center justify-center text-sm shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-teal-200 capitalize">
                    {currentUser.role} Account • Verified
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PNR Search Card */}
          <div className="mt-8 max-w-3xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-white p-2 shadow-2xl border-2 border-[#F59E0B]/80"
            >
              <div className="flex flex-1 items-center gap-3 px-4 py-2 sm:py-1">
                <Ticket className="text-[#0E7C86] shrink-0" size={24} />
                <input
                  type="text"
                  maxLength={10}
                  value={pnrInput}
                  onChange={(e) => {
                    setPnrInput(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="Enter 10-Digit PNR Number..."
                  className="w-full text-base sm:text-lg font-bold text-[#071A33] outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
                {pnrInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setPnrInput("");
                      setPnrResult(null);
                      setHasSearched(false);
                      setError(null);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <RotateCcw className="animate-spin" size={18} />
                    <span>Fetching PRS...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Get Status</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/80 px-3.5 py-2 rounded-lg">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo PNR Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                <Sparkles size={13} className="text-[#F59E0B]" />
                Sample PNRs:
              </span>
              {[
                { pnr: "4529108392", tag: "Confirmed • Karnataka Exp" },
                { pnr: "8821903411", tag: "Confirmed • Vande Bharat" },
                { pnr: "6192837401", tag: "RAC • Duronto Exp" },
                { pnr: "3829104720", tag: "Waiting List • Brindavan" },
              ].map((sample) => (
                <button
                  key={sample.pnr}
                  type="button"
                  onClick={() => {
                    setPnrInput(sample.pnr);
                    handleLookup(sample.pnr);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full transition-all cursor-pointer font-medium"
                >
                  <strong className="font-mono text-[#F59E0B] mr-1">{sample.pnr}</strong> ({sample.tag})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <RotateCcw className="mx-auto h-10 w-10 animate-spin text-[#0E7C86]" />
            <h3 className="mt-4 text-lg font-bold text-[#071A33]">
              Connecting to Indian Railways PRS Database...
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Retrieving chart preparation status, coach allocation and passenger details for PNR {pnrInput}.
            </p>
          </div>
        ) : pnrResult ? (
          <div className="space-y-6">
            {/* 1. Journey Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black bg-[#071A33] text-white px-3 py-1 rounded-lg">
                      PNR: {pnrResult.pnr}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                        pnrResult.chartStatus === "Chart Prepared"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {pnrResult.chartStatus}
                    </span>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">
                      {pnrResult.quota}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#071A33] flex items-center gap-3">
                    <TrainFront className="text-[#0E7C86]" size={28} />
                    <span>
                      {pnrResult.trainNumber} - {pnrResult.trainName}
                    </span>
                  </h2>
                  <div className="mt-1 text-xs text-slate-500 font-medium">
                    Class: <strong className="text-slate-800">{pnrResult.className}</strong> • Booked On:{" "}
                    <strong className="text-slate-800">{pnrResult.bookingDate}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/eta?train=${pnrResult.trainNumber}`}
                    className="flex items-center gap-2 bg-[#0E7C86] hover:bg-[#0b636b] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
                  >
                    <span>Track Live ETA</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    to={`/map?train=${pnrResult.trainNumber}`}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  >
                    <span>Live GPS Map</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              {/* Station Route Visualizer */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Origin Station</div>
                    <div className="text-lg font-black text-slate-900">{pnrResult.fromStation.name}</div>
                    <div className="text-xs font-bold text-slate-500 font-mono">
                      {pnrResult.fromStation.code} • {pnrResult.fromStation.platform}
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#071A33] flex items-center gap-1">
                      <Clock size={13} className="text-[#0E7C86]" />
                      <span>{pnrResult.fromStation.time} • {pnrResult.dateOfJourney}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow / Train indicator */}
                <div className="hidden md:flex flex-col items-center justify-center px-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Direct Journey
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="h-0.5 flex-1 bg-slate-200" />
                    <TrainFront size={18} className="text-[#0E7C86]" />
                    <div className="h-0.5 flex-1 bg-slate-200" />
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Destination Station</div>
                    <div className="text-lg font-black text-slate-900">{pnrResult.toStation.name}</div>
                    <div className="text-xs font-bold text-slate-500 font-mono">
                      {pnrResult.toStation.code} • {pnrResult.toStation.platform}
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#071A33] flex items-center gap-1">
                      <Clock size={13} className="text-[#0E7C86]" />
                      <span>{pnrResult.toStation.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Passenger Booking & Current Status Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Users className="text-[#0E7C86]" size={22} />
                  <h3 className="text-lg font-black text-[#071A33]">
                    Passenger Status ({pnrResult.passengers.length} Passenger{pnrResult.passengers.length > 1 ? "s" : ""})
                  </h3>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  Total Fare Paid: <strong className="text-emerald-700 font-mono text-sm">₹{pnrResult.fare}</strong>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                      <th className="pb-3 px-3">#</th>
                      <th className="pb-3 px-3">Passenger</th>
                      <th className="pb-3 px-3">Booking Status</th>
                      <th className="pb-3 px-3">Current Status</th>
                      <th className="pb-3 px-3">Coach</th>
                      <th className="pb-3 px-3">Berth / Position</th>
                      <th className="pb-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pnrResult.passengers.map((p) => (
                      <tr key={p.number} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-3 font-bold text-slate-400 font-mono">{p.number}</td>
                        <td className="py-4 px-3 font-bold text-[#071A33]">Passenger {p.number}</td>
                        <td className="py-4 px-3 font-mono font-semibold text-slate-700">{p.bookingStatus}</td>
                        <td className="py-4 px-3 font-mono font-black text-[#071A33]">{p.currentStatus}</td>
                        <td className="py-4 px-3">
                          <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                            {p.coach}
                          </span>
                        </td>
                        <td className="py-4 px-3 font-semibold text-slate-800">
                          {p.berth} ({p.berthType})
                        </td>
                        <td className="py-4 px-3">
                          {p.confirmed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                              <CheckCircle2 size={13} />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs">
                              <AlertCircle size={13} />
                              Waitlist / RAC
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Important Passenger Notice & Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-xs text-blue-900 flex items-start gap-3">
                <Info size={20} className="text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-blue-950 mb-1">Chart Preparation Rules</div>
                  <p className="leading-relaxed text-blue-800">
                    First chart is typically prepared 4 hours prior to scheduled train departure. Second chart is finalized 30 minutes before departure.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700 flex items-start justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <PhoneCall size={20} className="text-[#0E7C86] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-[#071A33] mb-1">24x7 Rail Madad Passenger Helpline</div>
                    <p className="text-slate-600">Dial 139 for PRS assistance, catering enquiry, or onboard security.</p>
                  </div>
                </div>
                <a
                  href="tel:139"
                  className="shrink-0 bg-[#071A33] text-[#F59E0B] font-black px-3.5 py-2 rounded-xl text-xs hover:bg-slate-900 transition-all"
                >
                  Call 139
                </a>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Ticket className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-[#071A33]">No PNR Record Found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Please check if the 10-digit PNR number is correct or try one of the sample PNRs above.
            </p>
          </div>
        ) : (
          /* Default state when visiting /pnr */
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E7C86] mb-4">
              <Ticket size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#071A33]">Enter a 10-digit PNR to Check Real-Time PRS Status</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
              Get live updates on seat confirmation, coach berth position, chart status, and real-time train ETA.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPnrInput("4529108392");
                  handleLookup("4529108392");
                }}
                className="inline-flex items-center gap-2 bg-[#071A33] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0E5961] transition-all cursor-pointer"
              >
                <span>Try Sample PNR: 4529108392</span>
                <ArrowRight size={14} className="text-[#F59E0B]" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
