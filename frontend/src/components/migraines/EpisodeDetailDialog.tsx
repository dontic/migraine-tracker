import { useEffect, useState } from "react";
import { toast } from "sonner";
import { migraineEpisodesRetrieve } from "@/api/django/migraine-episodes/migraine-episodes";
import type { MigraineEpisodeDetail } from "@/api/django/djangoAPI.schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface EpisodeDetailDialogProps {
  episodeId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIGRAINE_TYPE_LABELS: Record<string, string> = {
  aura_only: "Aura only",
  aura_with_headache: "Aura with headache",
  without_aura: "Without aura",
  hemiplegic: "Hemiplegic",
  vestibular: "Vestibular",
  chronic: "Chronic",
  cluster: "Cluster",
  other: "Other",
};

const DISABILITY_LABELS: Record<string, string> = {
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

const HEADACHE_SIDE_LABELS: Record<string, string> = {
  left: "Left",
  right: "Right",
  both: "Both",
};

const PAIN_LABELS: Record<number, string> = {
  0: "None",
  1: "Little",
  2: "Discomfort",
  3: "Can't work",
  4: "Debilitating",
  5: "Hospital",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EpisodeDetailDialog({
  episodeId,
  open,
  onOpenChange,
}: EpisodeDetailDialogProps) {
  const [episode, setEpisode] = useState<MigraineEpisodeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !episodeId) return;
    setLoading(true);
    migraineEpisodesRetrieve(episodeId)
      .then(setEpisode)
      .catch(() => toast.error("Failed to load episode details"))
      .finally(() => setLoading(false));
  }, [open, episodeId]);

  function handleOpenChange(v: boolean) {
    if (!v) setEpisode(null);
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {episode
              ? `Episode – ${formatDatetime(episode.started_at)}`
              : "Episode Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!loading && episode && (
            <>
              <Section title="Overview">
                <DetailRow
                  label="Started"
                  value={formatDatetime(episode.started_at)}
                />
                <DetailRow
                  label="Ended"
                  value={
                    episode.ended_at ? formatDatetime(episode.ended_at) : "—"
                  }
                />
                <DetailRow
                  label="Duration"
                  value={
                    episode.duration_hours != null
                      ? `${episode.duration_hours.toFixed(1)} h`
                      : "—"
                  }
                />
                <DetailRow
                  label="Type"
                  value={
                    episode.migraine_type
                      ? MIGRAINE_TYPE_LABELS[episode.migraine_type] ??
                        episode.migraine_type
                      : "—"
                  }
                />
                <DetailRow
                  label="Pain level"
                  value={
                    episode.pain_level != null
                      ? `${episode.pain_level} / 5 — ${PAIN_LABELS[episode.pain_level] ?? ""}`
                      : "—"
                  }
                />
                <DetailRow
                  label="Disability"
                  value={
                    episode.disability_level
                      ? DISABILITY_LABELS[episode.disability_level] ??
                        episode.disability_level
                      : "—"
                  }
                />
                <DetailRow
                  label="Headache side"
                  value={
                    episode.headache_side
                      ? HEADACHE_SIDE_LABELS[episode.headache_side] ??
                        episode.headache_side
                      : "—"
                  }
                />
              </Section>

              <Separator />

              <Section title="Aura">
                <DetailRow
                  label="Has aura"
                  value={episode.has_aura ? "Yes" : "No"}
                />
                {episode.has_aura && (
                  <>
                    <DetailRow
                      label="Aura duration"
                      value={
                        episode.aura_duration_minutes != null
                          ? `${episode.aura_duration_minutes} min`
                          : "—"
                      }
                    />
                    {episode.aura_types && episode.aura_types.length > 0 && (
                      <div className="col-span-2 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          Aura types
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {episode.aura_types.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {episode.visual_aura_locations &&
                      episode.visual_aura_locations.length > 0 && (
                        <div className="col-span-2 flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            Visual aura locations
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {episode.visual_aura_locations.map((l) => (
                              <Badge key={l} variant="outline">
                                {l}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </Section>

              <Separator />

              <Section title="Context">
                <DetailRow
                  label="Sleep before"
                  value={
                    episode.sleep_hours_before
                      ? `${episode.sleep_hours_before} h`
                      : "—"
                  }
                />
                <DetailRow
                  label="Stress level"
                  value={
                    episode.stress_level != null
                      ? `${episode.stress_level} / 5`
                      : "—"
                  }
                />
                <DetailRow
                  label="Menstrual related"
                  value={
                    episode.menstrual_related === true
                      ? "Yes"
                      : episode.menstrual_related === false
                        ? "No"
                        : "—"
                  }
                />
              </Section>

              {episode.triggers.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Triggers
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {episode.triggers.map((t) => (
                        <Badge key={t.id} variant="secondary">
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {episode.symptoms.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Symptoms
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {episode.symptoms.map((s) => (
                        <Badge key={s.id} variant="secondary">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {episode.episode_medications.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Medications
                    </h3>
                    <div className="flex flex-col gap-2">
                      {episode.episode_medications.map((em) => (
                        <div
                          key={em.id}
                          className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm"
                        >
                          <div className="flex-1">
                            <span className="font-medium">
                              {em.medication.name}
                            </span>
                            {em.dose && (
                              <span className="text-muted-foreground ml-2">
                                {em.dose}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                            {em.taken_offset_minutes != null && (
                              <span>
                                {em.taken_offset_minutes >= 0
                                  ? `+${em.taken_offset_minutes} min`
                                  : `${em.taken_offset_minutes} min`}
                              </span>
                            )}
                            {em.effectiveness === 2 && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Effective
                              </Badge>
                            )}
                            {em.effectiveness === 1 && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                Partial relief
                              </Badge>
                            )}
                            {em.effectiveness === 0 && (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Not effective
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {episode.notes && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Notes
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{episode.notes}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
