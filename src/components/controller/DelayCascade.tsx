import {
  ArrowDownRight,
  ArrowRight,
  Clock3,
  Network,
  TrainFront,
} from "lucide-react"
import { Link } from "react-router-dom"

interface CascadeNode {
  train: string
  station: string
  delay: number
  consequence: string
}

const cascade: CascadeNode[] = [
  {
    train: "12627",
    station: "Krishnarajapuram",
    delay: 18,
    consequence: "Junction conflict",
  },
  {
    train: "16591",
    station: "Baiyappanahalli",
    delay: 11,
    consequence: "Preceding train delay",
  },
  {
    train: "12639",
    station: "Bengaluru Cantonment",
    delay: 6,
    consequence: "Platform occupation",
  },
]

function DelayCascade() {
  return (
    <section className="rounded-2xl border border-[#164B5A] bg-[#071A33]/90 shadow-xl backdrop-blur-md overflow-hidden">
      <div className="border-b border-[#164B5A] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Network
            size={18}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-extrabold text-white">
              Delay Cascade
            </h3>

            <p className="mt-0.5 text-xs font-medium text-slate-200">
              Predicted downstream impact from current network conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                Network propagation
              </div>

              <div className="mt-0.5 text-xs sm:text-sm font-bold text-white">
                Current disruption may affect 3 downstream movements
              </div>
            </div>

            <ArrowDownRight
              size={20}
              className="shrink-0 text-[#FF8A3D]"
            />
          </div>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {cascade.map((node, index) => (
            <div key={node.train}>
              <div className="rounded-xl border border-[#164B5A] bg-[#040E1B]/90 p-3 transition hover:border-teal-400 hover:bg-[#071A33]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrainFront
                      size={15}
                      className="text-teal-300"
                    />

                    <span className="text-xs font-bold text-white tracking-wide">
                      #{node.train}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock3
                      size={13}
                      className="text-amber-400"
                    />

                    <span className="text-[11px] font-bold text-[#FF8A3D]">
                      +{node.delay} min
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-200">
                  <span className="font-bold text-teal-300">{node.station}</span>

                  <ArrowRight
                    size={12}
                    className="text-slate-400 shrink-0"
                  />

                  <span className="text-slate-100">{node.consequence}</span>
                </div>
              </div>

              {index < cascade.length - 1 && (
                <div className="ml-5 h-2.5 border-l border-dashed border-teal-500/50" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#164B5A] pt-3.5">
          <span className="text-xs text-slate-300">
            Forecast horizon: <span className="font-bold text-white">Next 45 mins</span>
          </span>

          <Link
            to="/controller/cascade"
            className="text-xs font-bold uppercase tracking-wider text-teal-300 transition hover:text-[#FF8A3D]"
          >
            Full Cascade View →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DelayCascade