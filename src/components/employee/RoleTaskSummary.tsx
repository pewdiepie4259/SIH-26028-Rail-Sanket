import { useNavigate } from "react-router-dom";
import { CheckSquare, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import type { RoleTaskItem } from "../../services/employeeDashboardService";

interface RoleTaskSummaryProps {
  tasks: RoleTaskItem[];
  onToggleStatus: (taskId: string) => void;
}

export default function RoleTaskSummary({
  tasks,
  onToggleStatus,
}: RoleTaskSummaryProps) {
  const navigate = useNavigate();
  const pendingCount = tasks.filter((t) => t.status !== "Completed").length;

  return (
    <div className="rounded-xl border border-[#16364A] bg-[#071A33] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#16364A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Shift Operational Tasks
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#16364A] text-slate-300">
            {pendingCount} Pending
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <CheckCircle2 size={22} className="mx-auto text-teal-400 mb-1" />
              No pending tasks for this shift.
            </div>
          ) : (
            tasks.slice(0, 3).map((task) => {
              const isHigh = task.priority.includes("High");
              const isCompleted = task.status === "Completed";

              return (
                <div
                  key={task.id}
                  className={`rounded-lg border p-3 transition flex items-center justify-between gap-3 ${
                    isCompleted
                      ? "bg-[#0A2036]/50 border-teal-900/30 opacity-70"
                      : "bg-[#0A2036] border-[#16364A] hover:border-[#0E7C86]/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-xs font-medium leading-snug ${
                          isCompleted ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {isHigh && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-red-950/60 text-red-300 border-red-800/40 uppercase shrink-0">
                          High
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <Clock size={11} className="text-slate-400 shrink-0" />
                      <span>{task.dueTime}</span>
                      {task.category && (
                        <span className="text-teal-400/90 font-medium truncate">
                          • {task.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(task.id)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded border transition shrink-0 ${
                      task.status === "Completed"
                        ? "bg-teal-950 text-teal-300 border-teal-600 hover:bg-teal-900"
                        : task.status === "In Progress"
                        ? "bg-[#0A223D] text-teal-300 border-teal-500 hover:bg-[#0E3558]"
                        : "bg-[#16364A] text-slate-200 border-slate-600 hover:border-teal-400 hover:text-white"
                    }`}
                    title="Click to toggle status"
                  >
                    {task.status || "Pending"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-end">
        <button
          type="button"
          onClick={() => navigate("/employee/tasks")}
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
        >
          <span>View All Tasks</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
