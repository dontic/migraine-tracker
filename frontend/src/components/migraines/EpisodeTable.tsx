import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { migraineEpisodesList } from "@/api/django/migraine-episodes/migraine-episodes";
import type {
  MigraineEpisodeList,
  PaginatedMigraineEpisodeListList,
} from "@/api/django/djangoAPI.schemas";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EpisodeDetailDialog } from "./EpisodeDetailDialog";

const PAGE_SIZE = 20;

const PAIN_COLOR: Record<number, string> = {
  0: "text-muted-foreground",
  1: "text-yellow-600",
  2: "text-orange-500",
  3: "text-orange-600",
  4: "text-red-600",
  5: "text-red-700 font-semibold",
};

const DISABILITY_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  none: "outline",
  mild: "secondary",
  moderate: "default",
  severe: "destructive",
};

const MIGRAINE_TYPE_LABELS: Record<string, string> = {
  aura_only: "Aura only",
  aura_with_headache: "Aura + headache",
  without_aura: "No aura",
  hemiplegic: "Hemiplegic",
  vestibular: "Vestibular",
  chronic: "Chronic",
  cluster: "Cluster",
  other: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EpisodeTableProps {
  refreshKey?: number;
  onEdit?: (id: number) => void;
  onDeleted?: () => void;
}

export function EpisodeTable({ refreshKey = 0, onEdit, onDeleted }: EpisodeTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] =
    useState<PaginatedMigraineEpisodeListList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    migraineEpisodesList({ page, page_size: PAGE_SIZE, ordering: "-started_at" })
      .then(setData)
      .catch(() => toast.error("Failed to load migraine episodes"))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  function openDetail(episode: MigraineEpisodeList) {
    setSelectedId(episode.id);
    setDetailOpen(true);
  }

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-36">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">
                  Pain
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-32">
                  Disability
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">
                  Duration
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">
                  Aura
                </th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && data?.results.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No migraine episodes recorded yet.
                  </td>
                </tr>
              )}

              {!loading &&
                data?.results.map((episode) => (
                  <tr
                    key={episode.id}
                    className="group/row border-b hover:bg-accent/40 cursor-pointer transition-colors"
                    onClick={() => openDetail(episode)}
                  >
                    <td className="px-4 py-3">
                      {formatDate(episode.started_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTime(episode.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      {episode.migraine_type
                        ? (MIGRAINE_TYPE_LABELS[episode.migraine_type] ??
                          episode.migraine_type)
                        : "—"}
                    </td>
                    <td
                      className={`px-4 py-3 ${PAIN_COLOR[episode.pain_level] ?? ""}`}
                    >
                      {episode.pain_level} / 5
                    </td>
                    <td className="px-4 py-3">
                      {episode.disability_level ? (
                        <Badge
                          variant={
                            DISABILITY_VARIANT[episode.disability_level] ??
                            "outline"
                          }
                        >
                          {episode.disability_level.charAt(0).toUpperCase() +
                            episode.disability_level.slice(1)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {episode.duration_hours != null
                        ? `${episode.duration_hours.toFixed(1)} h`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {episode.has_aura ? (
                        <span className="text-purple-600">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && data.count > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t shrink-0">
            <span className="text-sm text-muted-foreground">
              {data.count} episode{data.count !== 1 ? "s" : ""} · page {page}{" "}
              of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={!data.previous}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EpisodeDetailDialog
        episodeId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => onEdit?.(selectedId!)}
        onDeleted={() => onDeleted?.()}
      />
    </>
  );
}
