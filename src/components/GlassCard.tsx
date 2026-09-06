interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border border-slate-200/70
        bg-white/70
        shadow-sm
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default GlassCard