import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score?: number | null;
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  if (!score) return null;

  const color =
    score >= 90
      ? "bg-green-500"
      : score >= 80
        ? "bg-emerald-500"
        : score >= 70
          ? "bg-yellow-500"
          : "bg-gray-500";

  return (
    <div
      className={cn(
        "px-2.5 py-1 rounded-full text-sm font-semibold text-white",
        color
      )}
    >
      {score}%
    </div>
  );
}
