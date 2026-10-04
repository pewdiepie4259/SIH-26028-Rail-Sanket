import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Clock,
  ChevronRight,
  CheckCircle2,
  X,
  Layers,
  ExternalLink,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import type { RoleTaskItem } from "../../services/employeeDashboardService";

interface RoleTaskSummaryProps {
  tasks: RoleTaskItem[];
  onToggleStatus: (taskId: string, targetStatus?: "Pending" | "In Progress" | "Completed") => void;
}

export default function RoleTaskSummary({
  tasks,
  onToggleStatus,
}: RoleTaskSummaryProps) {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<RoleTaskItem | null>(null);

  const pendingCount = tasks.filter((t) => t.status !== "Completed").length;

  // Active selected task reference synchronized with parent state
  const activeSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

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
                  onClick={() => setSelectedTask(task)}
                  className={`rounded-lg border p-3 transition flex items-center justify-between gap-3 cursor-pointer group ${
                    isCompleted
                      ? "bg-[#0A2036]/50 border-teal-900/30 opacity-70 hover:opacity-100"
                      : "bg-[#0A2036] border-[#16364A] hover:border-[#0E7C86] hover:bg-[#0A223D]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-xs font-medium leading-snug group-hover:text-cyan-200 transition ${
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

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-teal-400/80 group-hover:text-cyan-300 hidden sm:inline-block transition">
                      Details →
                    </span>

                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(task.id);
                      }}
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
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#16364A] flex items-center justify-between">
        <span className="text-[11px] text-[#71899C]">
          Click status button or row to manage task.
        </span>
        <button
          type="button"
          onClick={() => navigate("/employee/tasks")}
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-1 transition"
        >
          <span>View All Tasks</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* TASK DETAIL & EXECUTION MODAL */}
      {activeSelectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#16364A] bg-[#071A33] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#16364A] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-teal-950/60 border border-teal-600/50 flex items-center justify-center text-teal-300 shrink-0">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-teal-950/80 text-teal-300 border-teal-700/60">
                      {activeSelectedTask.category || "OPERATIONAL"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {activeSelectedTask.dueTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {activeSelectedTask.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#16364A]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#0A2036] p-3.5 rounded-lg border border-[#16364A] space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Layers size={12} className="text-teal-400" />
                  Task Priority & Execution Target
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Priority Level:</span>
                  <span className="font-semibold text-amber-300">
                    {activeSelectedTask.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Due Window:</span>
                  <span className="font-mono text-teal-300">
                    {activeSelectedTask.dueTime} IST
                  </span>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="bg-[#0A2036] p-3.5 rounded-lg border border-[#16364A]">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Update Task Status
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["Pending", "In Progress", "Completed"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onToggleStatus(activeSelectedTask.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center ${
                        activeSelectedTask.status === st
                          ? st === "Completed"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm"
                            : st === "In Progress"
                            ? "bg-[#0E3558] text-teal-300 border-teal-500 shadow-sm"
                            : "bg-[#16364A] text-amber-300 border-amber-500/60 shadow-sm"
                          : "bg-[#071A33] text-slate-400 border-[#16364A] hover:text-white hover:border-slate-500"
                      }`}
                    >
                      {st === "Completed" && "✓ "}
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#16364A] pt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  navigate("/employee/tasks");
                  setSelectedTask(null);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#16364A] text-teal-400 hover:text-teal-300 hover:bg-[#0A2036] text-xs flex items-center gap-1.5 transition"
              >
                <ExternalLink size={13} />
                <span>Open Full Tasks Page</span>
              </button>

              <div className="flex items-center gap-2">
                {activeSelectedTask.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleStatus(activeSelectedTask.id, "Completed");
                      setSelectedTask((prev) =>
                        prev ? { ...prev, status: "Completed" } : null
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm transition"
                  >
                    <CheckCircle2 size={13} />
                    <span>Mark Done</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#16364A] text-slate-300 hover:text-white text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

