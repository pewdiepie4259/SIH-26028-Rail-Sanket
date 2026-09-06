import {
  ArrowRight,
  Clock3,
  MapPin,
  Search,
  TrainFront,
  TriangleAlert,
} from "lucide-react"

function PublicDashboard() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">

      {/* Page heading */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#0E7C86]">
            Live Network
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Railway Network Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Real-time train movement, delays and network conditions.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Last updated: <span className="font-medium text-slate-600">Just now</span>
        </div>

      </div>


      {/* Search */}
      <section className="mb-6 border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search train number, train name or station..."
              className="h-11 w-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0E7C86] focus:bg-white"
            />

          </div>

          <button className="h-11 bg-[#0B3D91] px-6 text-sm font-semibold text-white transition hover:bg-[#092f70]">
            Search
          </button>

        </div>

      </section>


      {/* Network metrics */}
      <section className="mb-6 grid grid-cols-2 border border-slate-200 bg-white lg:grid-cols-4">

        <Metric
          label="Trains Monitored"
          value="1,248"
          detail="Live telemetry"
        />

        <Metric
          label="Currently Delayed"
          value="87"
          detail="6.9% of network"
          accent="orange"
        />

        <Metric
          label="Network Sections"
          value="326"
          detail="Under monitoring"
        />

        <Metric
          label="Critical Alerts"
          value="3"
          detail="Require attention"
          accent="red"
        />

      </section>


      {/* Map + status */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

        {/* Map */}
        <div className="min-h-[500px] border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Live Network Map
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Train movement and network conditions
              </p>
            </div>

            <button className="text-xs font-semibold text-[#0B3D91]">
              View Full Map
            </button>

          </div>

          {/* Temporary map area */}
          <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#EEF3F5]">

            {/* Grid */}
            <div className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Railway lines */}
            <div className="absolute h-px w-[70%] rotate-[-12deg] bg-[#0E7C86]" />
            <div className="absolute h-px w-[55%] rotate-[18deg] bg-[#0B3D91]" />
            <div className="absolute h-px w-[45%] rotate-[42deg] bg-slate-400" />

            {/* Stations */}
            <StationDot className="left-[18%] top-[55%]" />
            <StationDot className="left-[39%] top-[42%]" />
            <StationDot className="left-[61%] top-[56%]" />
            <StationDot className="left-[78%] top-[36%]" />

            <div className="absolute bottom-4 left-4 border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500 shadow-sm">
              Map integration placeholder
            </div>

          </div>

        </div>


        {/* Network status */}
        <div className="border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="text-sm font-semibold text-slate-900">
              Network Conditions
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Current operational alerts
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            <Alert
              title="Bengaluru Division"
              detail="Moderate delays"
              status="12 trains affected"
            />

            <Alert
              title="Chennai Junction"
              detail="Platform congestion"
              status="4 trains affected"
            />

            <Alert
              title="Mysuru Section"
              detail="Weather impact detected"
              status="3 trains affected"
            />

          </div>

          <div className="p-5">

            <button className="flex w-full items-center justify-between border border-slate-200 px-4 py-3 text-xs font-semibold text-[#0B3D91] transition hover:bg-slate-50">

              View all alerts

              <ArrowRight size={15} />

            </button>

          </div>

        </div>

      </section>


      {/* Train movements */}
      <section className="mt-6 border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Live Train Movements
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Recently updated train positions
            </p>
          </div>

          <button className="text-xs font-semibold text-[#0B3D91]">
            View all
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px] text-left">

            <thead className="border-b border-slate-100 bg-slate-50">

              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">

                <th className="px-5 py-3">Train</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Current Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">ETA</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              <TrainRow
                number="12627"
                name="Karnataka Express"
                route="Bengaluru → New Delhi"
                location="Krishnarajapuram"
                status="+12 min"
              />

              <TrainRow
                number="12951"
                name="Mumbai Rajdhani"
                route="Mumbai → New Delhi"
                location="Vadodara"
                status="+4 min"
              />

              <TrainRow
                number="12008"
                name="Shatabdi Express"
                route="Mysuru → Chennai"
                location="Bengaluru"
                status="On time"
              />

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}


function Metric({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent?: "orange" | "red"
}) {
  return (
    <div className="border-r border-slate-200 p-5 last:border-r-0">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          accent === "orange"
            ? "text-[#D96B20]"
            : accent === "red"
              ? "text-red-600"
              : "text-[#0B3D91]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {detail}
      </p>

    </div>
  )
}


function StationDot({ className }: { className: string }) {
  return (
    <div className={`absolute ${className}`}>

      <div className="h-3 w-3 rounded-full border-2 border-white bg-[#0B3D91] shadow-sm" />

    </div>
  )
}


function Alert({
  title,
  detail,
  status,
}: {
  title: string
  detail: string
  status: string
}) {
  return (
    <div className="p-5">

      <div className="flex gap-3">

        <TriangleAlert
          size={17}
          className="mt-0.5 shrink-0 text-[#FF8A3D]"
        />

        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>

          <p className="mt-2 text-[11px] font-medium text-slate-400">
            {status}
          </p>

        </div>

      </div>

    </div>
  )
}


function TrainRow({
  number,
  name,
  route,
  location,
  status,
}: {
  number: string
  name: string
  route: string
  location: string
  status: string
}) {
  const delayed = status !== "On time"

  return (
    <tr className="text-sm">

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
            <TrainFront size={16} className="text-[#0B3D91]" />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              {number}
            </p>

            <p className="text-xs text-slate-400">
              {name}
            </p>
          </div>

        </div>

      </td>

      <td className="px-5 py-4 text-xs text-slate-600">
        {route}
      </td>

      <td className="px-5 py-4">

        <div className="flex items-center gap-2 text-xs text-slate-600">

          <MapPin size={14} className="text-slate-400" />

          {location}

        </div>

      </td>

      <td className="px-5 py-4">

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            delayed
              ? "text-[#D96B20]"
              : "text-green-600"
          }`}
        >

          <span className="h-1.5 w-1.5 rounded-full bg-current" />

          {status}

        </span>

      </td>

      <td className="px-5 py-4">

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">

          <Clock3 size={14} className="text-slate-400" />

          Predicted

        </div>

      </td>

    </tr>
  )
}

export default PublicDashboard