import type { LucideIcon } from "lucide-react";

type StatTone = "gold" | "green" | "blue" | "red";

const toneClasses: Record<StatTone, { icon: string; value: string }> = {
  gold: {
    icon: "border-atlas-gold-main/25 bg-atlas-gold-main/10 text-atlas-gold-main",
    value: "text-white",
  },
  green: {
    icon: "border-green-400/25 bg-green-400/10 text-green-400",
    value: "text-white",
  },
  blue: {
    icon: "border-blue-400/25 bg-blue-400/10 text-blue-400",
    value: "text-white",
  },
  red: {
    icon: "border-red-400/25 bg-red-400/10 text-red-400",
    value: "text-white",
  },
};

interface AdminStatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  helper?: string;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
  helper,
}: AdminStatCardProps) {
  const classes = toneClasses[tone];

  return (
    <article className="atlas-stat-card">
      <div className="flex min-w-0 items-center gap-4">
        <div className={`atlas-stat-card-icon ${classes.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="atlas-stat-card-label">{label}</p>
          <div className={`atlas-metric-value break-words ${classes.value}`}>{value}</div>
          {helper && <p className="mt-2 text-xs leading-relaxed text-atlas-text-muted">{helper}</p>}
        </div>
      </div>
    </article>
  );
}
