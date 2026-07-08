import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "cyan" | "blue" | "violet" | "emerald" | "amber";
  delay?: number;
};

const accentStyles = {
  cyan: {
    icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    glow: "from-cyan-500/10 to-transparent",
    value: "text-cyan-700 dark:text-cyan-300",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    glow: "from-blue-500/10 to-transparent",
    value: "text-blue-700 dark:text-blue-300",
  },
  violet: {
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    glow: "from-violet-500/10 to-transparent",
    value: "text-violet-700 dark:text-violet-300",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/10 to-transparent",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    glow: "from-amber-500/10 to-transparent",
    value: "text-amber-700 dark:text-amber-300",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  accent = "cyan",
  delay = 0,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "interactive-card glass-card group relative overflow-hidden",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.glow
        )}
      />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            "rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
            styles.icon
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <p className={cn("font-heading text-4xl font-bold tracking-tight", styles.value)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
