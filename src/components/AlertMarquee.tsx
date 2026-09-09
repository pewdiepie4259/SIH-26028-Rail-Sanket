import { AlertTriangle, Info, Radio } from "lucide-react"
import { useEffect, useState } from "react"

interface Alert {
  id: string
  type: "warning" | "info" | "critical"
  message: string
  time: string
}

const fallbackAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    message: "Train 12628 is running approximately 18 minutes late.",
    time: "Just now",
  },
  {
    id: "2",
    type: "info",
    message: "Platform 4 at KSR Bengaluru is currently operational.",
    time: "2 min ago",
  },
  {
    id: "3",
    type: "warning",
    message:
      "Heavy rainfall may affect train movement in the Bengaluru section.",
    time: "5 min ago",
  },
]

function AlertMarquee() {
  const [alerts, setAlerts] = useState<Alert[]>(fallbackAlerts)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/public/alerts")

        if (!response.ok) {
          throw new Error("Failed to fetch alerts")
        }

        const data: Alert[] = await response.json()
        setAlerts(data)
      } catch {
        setAlerts(fallbackAlerts)
      }
    }

    fetchAlerts()

    const interval = window.setInterval(fetchAlerts, 30 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  if (alerts.length === 0) {
    return null
  }

  return (
    <section className="border-b border-[#F59E0B]/40 bg-[#FFF8EC]">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center px-6 lg:px-12">
        <div className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-[#F59E0B]/40 bg-[#FFF8EC] pr-5">
          <Radio
            size={17}
            strokeWidth={2.5}
            className="text-[#F59E0B]"
          />

          <span className="text-[13px] font-extrabold uppercase tracking-wider text-[#071A33]">
            Live Alerts
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="alert-marquee flex w-max items-center">
            {[...alerts, ...alerts].map((alert, index) => (
              <div
                key={`${alert.id}-${index}`}
                className="flex items-center gap-2 whitespace-nowrap px-6 text-sm"
              >
                {alert.type === "critical" ? (
                  <AlertTriangle
                    size={15}
                    strokeWidth={2.5}
                    className="text-red-600"
                  />
                ) : alert.type === "warning" ? (
                  <AlertTriangle
                    size={15}
                    strokeWidth={2.5}
                    className="text-[#F59E0B]"
                  />
                ) : (
                  <Info
                    size={15}
                    strokeWidth={2.5}
                    className="text-[#2563EB]"
                  />
                )}

                <span className="font-semibold text-slate-700">
                  {alert.message}
                </span>

                <span className="text-xs font-medium text-slate-400">
                  {alert.time}
                </span>

                <span className="ml-4 text-[#F59E0B]/40">
                  •
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AlertMarquee