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
    <section className="controller-panel overflow-hidden rounded-xl">
      <div className="controller-header px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Network
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Delay Cascade
            </h3>

            <p className="mt-0.5 text-xs text-[#D7E5EC]/80">
              Predicted downstream impact from current network conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">
                Network propagation
              </div>

              <div className="mt-1 text-sm font-bold text-[#071A33]">
                Current disruption may affect 3 downstream movements
              </div>
            </div>

            <ArrowDownRight
              size={20}
              className="shrink-0 text-amber-600"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {cascade.map((node, index) => (
            <div key={node.train}>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrainFront
                      size={14}
                      className="text-[#0E5961]"
                    />

                    <span className="text-xs font-bold text-[#071A33]">
                      {node.train}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock3
                      size={12}
                      className="text-amber-600"
                    />

                    <span className="text-[10px] font-bold text-amber-700">
                      +{node.delay} min
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
                  <span className="font-semibold text-slate-800">{node.station}</span>

                  <ArrowRight
                    size={11}
                    className="text-slate-400"
                  />

                  <span>{node.consequence}</span>
                </div>
              </div>

              {index < cascade.length - 1 && (
                <div className="ml-5 h-3 border-l border-dashed border-teal-300" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-[10px] text-slate-500">
            Forecast horizon: <span className="font-bold text-[#071A33]">Next 45 mins</span>
          </span>

          <Link
            to="/controller/cascade"
            className="text-[10px] font-bold uppercase tracking-wide text-[#0E5961] transition hover:text-[#F59E0B]"
          >
            Full Cascade View →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DelayCascade