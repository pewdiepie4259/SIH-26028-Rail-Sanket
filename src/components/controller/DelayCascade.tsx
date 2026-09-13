import {
  ArrowDownRight,
  ArrowRight,
  Clock3,
  Network,
  TrainFront,
} from "lucide-react"

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
    <section className="overflow-hidden rounded-xl border border-[#16364A] bg-[#0A2036]">
      <div className="border-b border-[#16364A] px-5 py-4">
        <div className="flex items-center gap-2">
          <Network
            size={17}
            className="text-[#F59E0B]"
          />

          <div>
            <h3 className="text-sm font-bold text-white">
              Delay Cascade
            </h3>

            <p className="mt-1 text-xs text-[#71899C]">
              Predicted downstream impact from current network conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#F59E0B]">
                Network propagation
              </div>

              <div className="mt-1 text-sm font-bold text-white">
                Current disruption may affect 3 downstream movements
              </div>
            </div>

            <ArrowDownRight
              size={20}
              className="shrink-0 text-[#F59E0B]"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {cascade.map((node, index) => (
            <div key={node.train}>
              <div className="rounded-lg border border-[#16364A] bg-[#071A33] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrainFront
                      size={14}
                      className="text-[#0E7C86]"
                    />

                    <span className="text-xs font-bold text-white">
                      {node.train}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock3
                      size={12}
                      className="text-[#F59E0B]"
                    />

                    <span className="text-[10px] font-bold text-[#F59E0B]">
                      +{node.delay} min
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-[#AFC0D4]">
                  <span>{node.station}</span>

                  <ArrowRight
                    size={11}
                    className="text-[#71899C]"
                  />

                  <span>{node.consequence}</span>
                </div>
              </div>

              {index < cascade.length - 1 && (
                <div className="ml-5 h-3 border-l border-dashed border-[#0E5961]" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#16364A] pt-4">
          <span className="text-[10px] text-[#71899C]">
            Forecast horizon
          </span>

          <span className="text-[10px] font-bold text-[#D7E5EC]">
            Next 45 minutes
          </span>
        </div>
      </div>
    </section>
  )
}

export default DelayCascade