import { AlertTriangle, Info } from "lucide-react";

interface RoleDepartmentWarningProps {
  warningMessage?: string;
  isUnassigned?: boolean;
}

export default function RoleDepartmentWarning({
  warningMessage,
  isUnassigned,
}: RoleDepartmentWarningProps) {
  if (!warningMessage && !isUnassigned) return null;

  if (isUnassigned) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200 shadow-sm flex items-start gap-3">
        <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300">Operational Role Not Assigned</div>
          <p className="text-amber-200/90 leading-relaxed">
            Your employee account is active, but an operational role has not been designated yet.
            The dashboard is running in safe generic mode. Please contact your Divisional Personnel Officer (DPO) or update your profile to configure your role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-200 shadow-sm flex items-start gap-3">
      <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
      <div className="text-xs space-y-1">
        <div className="font-bold text-amber-300">Department / Role Configuration Notice</div>
        <p className="text-amber-200/90 leading-relaxed">{warningMessage}</p>
      </div>
    </div>
  );
}
