import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { migraineEpisodesHeatmapList } from "@/api/django/migraine-episodes/migraine-episodes";
import type { MigraineEpisodeHeatmap } from "@/api/django/djangoAPI.schemas";

const PAIN_COLORS = [
  "bg-emerald-200 dark:bg-emerald-800",
  "bg-yellow-200 dark:bg-yellow-700",
  "bg-orange-300 dark:bg-orange-600",
  "bg-orange-500 dark:bg-orange-500",
  "bg-red-500 dark:bg-red-500",
  "bg-red-700 dark:bg-red-700",
];

const PAIN_LABELS = [
  "None",
  "Little",
  "Discomfort",
  "Can't work",
  "Debilitating",
  "Hospital",
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildGrid(year: number): { weeks: Date[][]; monthPositions: Map<number, string> } {
  const jan1 = new Date(year, 0, 1);
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() - jan1.getDay()); // rewind to Sunday

  const dec31 = new Date(year, 11, 31);
  const gridEnd = new Date(dec31);
  gridEnd.setDate(gridEnd.getDate() + (6 - dec31.getDay())); // forward to Saturday

  const weeks: Date[][] = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthPositions = new Map<number, string>();
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = new Date(year, m, 1);
    const diffDays = Math.round(
      (firstOfMonth.getTime() - gridStart.getTime()) / 86_400_000,
    );
    const weekIndex = Math.floor(diffDays / 7);
    monthPositions.set(weekIndex, MONTH_LABELS[m]);
  }

  return { weeks, monthPositions };
}

export function MigraineHeatmap() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<MigraineEpisodeHeatmap[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setLoading(true);
    setData([]);
    migraineEpisodesHeatmapList({
      date_from: `${year}-01-01`,
      date_to: `${year}-12-31`,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const painMap = new Map<string, number>();
  for (const ep of data) {
    const existing = painMap.get(ep.date);
    if (existing == null || ep.pain_level > existing) {
      painMap.set(ep.date, ep.pain_level);
    }
  }

  const { weeks, monthPositions } = buildGrid(year);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Migraine activity
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setYear((y) => y - 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium tabular-nums w-10 text-center">
              {year}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= currentYear}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-[3px]">
            {/* Month labels */}
            <div className="flex gap-[3px] ml-[30px]">
              {weeks.map((_, weekIndex) => (
                <div
                  key={weekIndex}
                  className="w-[14px] text-[10px] leading-none text-muted-foreground overflow-visible whitespace-nowrap"
                >
                  {monthPositions.get(weekIndex) ?? ""}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-[2px]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (label, i) => (
                    <div
                      key={i}
                      className="w-[24px] h-[14px] text-[10px] leading-[14px] text-muted-foreground text-right pr-[3px] select-none"
                    >
                      {i % 2 === 1 ? label.slice(0, 3) : ""}
                    </div>
                  ),
                )}
              </div>

              {/* Week columns */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((date, dayIndex) => {
                    const iso = dateToISO(date);
                    const inYear = date.getFullYear() === year;
                    const isFuture = date > today;
                    const painLevel =
                      inYear && !isFuture ? painMap.get(iso) : undefined;

                    if (!inYear) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-[14px] h-[14px] rounded-[2px]"
                        />
                      );
                    }

                    let cellClass: string;
                    if (isFuture) {
                      cellClass =
                        "w-[14px] h-[14px] rounded-[2px] bg-muted/40 opacity-50";
                    } else if (painLevel != null) {
                      cellClass = `w-[14px] h-[14px] rounded-[2px] ${PAIN_COLORS[painLevel]}`;
                    } else {
                      cellClass = loading
                        ? "w-[14px] h-[14px] rounded-[2px] bg-muted/50 animate-pulse"
                        : "w-[14px] h-[14px] rounded-[2px] bg-muted/60";
                    }

                    if (isFuture) {
                      return (
                        <div key={dayIndex} className={cellClass} />
                      );
                    }

                    const formattedDate = date.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    const tooltipText =
                      painLevel != null
                        ? `${formattedDate} — Pain ${painLevel}/5 (${PAIN_LABELS[painLevel]})`
                        : `${formattedDate} — No migraine`;

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div className={cellClass} />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {tooltipText}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground select-none">
          <span>No migraine</span>
          <div className="flex gap-[3px] items-center">
            <div className="w-[14px] h-[14px] rounded-[2px] bg-muted/60" />
            {PAIN_COLORS.map((color, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className={`w-[14px] h-[14px] rounded-[2px] ${color}`} />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Pain {i}/5 — {PAIN_LABELS[i]}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <span>Pain 5/5</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
