import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  migraineEpisodesCreate,
  migraineEpisodesRetrieve,
  migraineEpisodesUpdate,
} from "@/api/django/migraine-episodes/migraine-episodes";
import {
  migraineSymptomsList,
  migraineSymptomsCreate,
  migraineSymptomsUpdate,
  migraineSymptomsDestroy,
} from "@/api/django/migraine-symptoms/migraine-symptoms";
import {
  migraineTriggersList,
  migraineTriggersCreate,
  migraineTriggersUpdate,
  migraineTriggersDestroy,
} from "@/api/django/migraine-triggers/migraine-triggers";
import {
  migraineMedicationsList,
  migraineMedicationsCreate,
  migraineMedicationsUpdate,
  migraineMedicationsDestroy,
} from "@/api/django/migraine-medications/migraine-medications";
import type {
  Symptom,
  Trigger,
  Medication,
} from "@/api/django/djangoAPI.schemas";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";
import { ManagedMultiSelect } from "./ManagedMultiSelect";

const episodeSchema = z.object({
  started_at: z.string().min(1, "Start time is required"),
  ended_at: z.string().optional(),
  migraine_type: z.string().optional(),
  pain_level: z.number().int().min(0).max(5),
  headache_location: z.string().optional(),
  headache_quality: z.string().optional(),
  disability_level: z.string().optional(),
  has_aura: z.boolean().default(false),
  aura_types: z.array(z.string()).default([]),
  visual_aura_locations: z.array(z.string()).default([]),
  aura_duration_minutes: z.coerce
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
  sleep_hours_before: z.string().nullable().optional(),
  stress_level: z.coerce.number().int().min(0).max(5).nullable().optional(),
  menstrual_related: z.boolean().nullable().optional(),
  notes: z.string().optional(),
  trigger_ids: z.array(z.number()).default([]),
  symptom_ids: z.array(z.number()).default([]),
  medication_ids: z.array(z.number()).default([]),
});

type EpisodeFormValues = z.infer<typeof episodeSchema>;

interface EpisodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  episodeId?: number;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(e.currentTarget.value);
      e.currentTarget.value = "";
    } else if (e.key === "Backspace" && !e.currentTarget.value && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div
      className="flex min-h-9 w-full flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((tag) => (
        <Badge key={tag} variant="outline" className="gap-1 font-normal">
          {tag}
          <XIcon
            className="size-2 cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
          />
        </Badge>
      ))}
      <input
        ref={inputRef}
        className="flex-1 min-w-20 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        placeholder={values.length === 0 ? placeholder : undefined}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          if (e.target.value) {
            addTag(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">
      {children}
    </h3>
  );
}

export function EpisodeFormDialog({
  open,
  onOpenChange,
  onSuccess,
  episodeId,
}: EpisodeFormDialogProps) {
  const isEditMode = episodeId != null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      started_at: "",
      pain_level: 0,
      has_aura: false,
      aura_types: [],
      visual_aura_locations: [],
      trigger_ids: [],
      symptom_ids: [],
      medication_ids: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    migraineSymptomsList().then(setSymptoms).catch(() => {});
    migraineTriggersList().then(setTriggers).catch(() => {});
    migraineMedicationsList().then(setMedications).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || !isEditMode) {
      if (!open) form.reset();
      return;
    }
    migraineEpisodesRetrieve(episodeId!)
      .then((ep) => {
        form.reset({
          started_at: toDatetimeLocal(ep.started_at),
          ended_at: ep.ended_at ? toDatetimeLocal(ep.ended_at) : "",
          migraine_type: ep.migraine_type ?? "",
          pain_level: ep.pain_level ?? 0,
          headache_location: ep.headache_location ?? "",
          headache_quality: ep.headache_quality ?? "",
          disability_level: ep.disability_level ?? "",
          has_aura: ep.has_aura ?? false,
          aura_types: ep.aura_types ?? [],
          visual_aura_locations: ep.visual_aura_locations ?? [],
          aura_duration_minutes: ep.aura_duration_minutes ?? null,
          sleep_hours_before: ep.sleep_hours_before ?? null,
          stress_level: ep.stress_level ?? null,
          menstrual_related: ep.menstrual_related ?? null,
          notes: ep.notes ?? "",
          trigger_ids: ep.triggers.map((t) => t.id),
          symptom_ids: ep.symptoms.map((s) => s.id),
          medication_ids: ep.episode_medications.map((em) => em.medication.id),
        });
      })
      .catch(() => toast.error("Failed to load episode data."));
  }, [open, episodeId]);

  async function refreshSymptoms() {
    const data = await migraineSymptomsList();
    setSymptoms(data);
  }
  async function refreshTriggers() {
    const data = await migraineTriggersList();
    setTriggers(data);
  }
  async function refreshMedications() {
    const data = await migraineMedicationsList();
    setMedications(data);
  }

  async function onSubmit(values: EpisodeFormValues) {
    setIsSubmitting(true);
    const payload = {
      started_at: values.started_at,
      ended_at: values.ended_at || null,
      migraine_type: values.migraine_type as never || undefined,
      pain_level: values.pain_level,
      headache_location: values.headache_location as never || undefined,
      headache_quality: values.headache_quality as never || undefined,
      disability_level: values.disability_level as never || undefined,
      has_aura: values.has_aura,
      aura_types: values.aura_types,
      visual_aura_locations: values.visual_aura_locations,
      aura_duration_minutes: values.aura_duration_minutes ?? null,
      sleep_hours_before: values.sleep_hours_before ?? null,
      stress_level: values.stress_level ?? null,
      menstrual_related: values.menstrual_related ?? null,
      notes: values.notes,
      triggers: values.trigger_ids,
      symptoms: values.symptom_ids,
      episode_medications: values.medication_ids.map((id) => ({
        medication: id,
      })),
    };
    try {
      if (isEditMode) {
        await migraineEpisodesUpdate(episodeId!, payload);
        toast.success("Migraine episode updated.");
      } else {
        await migraineEpisodesCreate(payload);
        toast.success("Migraine episode logged.");
      }
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save episode.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEditMode ? "Edit migraine episode" : "Log migraine episode"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-4">
              <SectionTitle>Timing</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="started_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Started *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ended_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ended</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <SectionTitle>Pain &amp; Severity</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="pain_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain level *</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 — None</SelectItem>
                          <SelectItem value="1">1 — Little</SelectItem>
                          <SelectItem value="2">2 — Discomfort</SelectItem>
                          <SelectItem value="3">3 — Can&apos;t work</SelectItem>
                          <SelectItem value="4">4 — Debilitating</SelectItem>
                          <SelectItem value="5">5 — Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disability_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disability</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="migraine_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="without_aura">Without aura</SelectItem>
                          <SelectItem value="aura_only">Aura only</SelectItem>
                          <SelectItem value="aura_with_headache">Aura with headache</SelectItem>
                          <SelectItem value="hemiplegic">Hemiplegic</SelectItem>
                          <SelectItem value="vestibular">Vestibular</SelectItem>
                          <SelectItem value="chronic">Chronic</SelectItem>
                          <SelectItem value="cluster">Cluster</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headache_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unilateral_left">Unilateral (left)</SelectItem>
                          <SelectItem value="unilateral_right">Unilateral (right)</SelectItem>
                          <SelectItem value="bilateral">Bilateral</SelectItem>
                          <SelectItem value="frontal">Frontal</SelectItem>
                          <SelectItem value="temporal">Temporal</SelectItem>
                          <SelectItem value="occipital">Occipital</SelectItem>
                          <SelectItem value="vertex">Vertex</SelectItem>
                          <SelectItem value="retro_orbital">Retro-orbital</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headache_quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="throbbing">Throbbing / pulsating</SelectItem>
                          <SelectItem value="pressing">Pressing / tightening</SelectItem>
                          <SelectItem value="stabbing">Stabbing</SelectItem>
                          <SelectItem value="burning">Burning</SelectItem>
                          <SelectItem value="dull">Dull / aching</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <SectionTitle>Aura</SectionTitle>
              <FormField
                control={form.control}
                name="has_aura"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Has aura
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("has_aura") && (
                <>
                  <FormField
                    control={form.control}
                    name="aura_duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aura duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 30"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aura_types"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aura types</FormLabel>
                        <FormControl>
                          <TagInput
                            values={field.value}
                            onChange={field.onChange}
                            placeholder="Type and press Enter…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visual_aura_locations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visual aura locations</FormLabel>
                        <FormControl>
                          <TagInput
                            values={field.value}
                            onChange={field.onChange}
                            placeholder="Type and press Enter…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Separator />
              <SectionTitle>Context</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="sleep_hours_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours before</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 6.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stress_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (0–5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? null : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="menstrual_related"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Menstrual related
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Separator />
              <SectionTitle>Triggers</SectionTitle>
              <FormField
                control={form.control}
                name="trigger_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ManagedMultiSelect
                        label="Triggers"
                        selectedIds={field.value}
                        onChange={field.onChange}
                        items={triggers}
                        onCreateItem={async (name) => {
                          await migraineTriggersCreate({ name });
                          await refreshTriggers();
                        }}
                        onUpdateItem={async (id, name) => {
                          await migraineTriggersUpdate(id, { name });
                          await refreshTriggers();
                        }}
                        onDeleteItem={async (id) => {
                          await migraineTriggersDestroy(id);
                          await refreshTriggers();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SectionTitle>Symptoms</SectionTitle>
              <FormField
                control={form.control}
                name="symptom_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ManagedMultiSelect
                        label="Symptoms"
                        selectedIds={field.value}
                        onChange={field.onChange}
                        items={symptoms}
                        onCreateItem={async (name) => {
                          await migraineSymptomsCreate({ name });
                          await refreshSymptoms();
                        }}
                        onUpdateItem={async (id, name) => {
                          await migraineSymptomsUpdate(id, { name });
                          await refreshSymptoms();
                        }}
                        onDeleteItem={async (id) => {
                          await migraineSymptomsDestroy(id);
                          await refreshSymptoms();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SectionTitle>Medications</SectionTitle>
              <FormField
                control={form.control}
                name="medication_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ManagedMultiSelect
                        label="Medications"
                        selectedIds={field.value}
                        onChange={field.onChange}
                        items={medications}
                        onCreateItem={async (name) => {
                          await migraineMedicationsCreate({ name });
                          await refreshMedications();
                        }}
                        onUpdateItem={async (id, name) => {
                          await migraineMedicationsUpdate(id, { name });
                          await refreshMedications();
                        }}
                        onDeleteItem={async (id) => {
                          await migraineMedicationsDestroy(id);
                          await refreshMedications();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <SectionTitle>Notes</SectionTitle>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes…"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="h-2" />
            </div>

            <DialogFooter className="px-6 py-4 border-t" showCloseButton>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : isEditMode ? "Update episode" : "Save episode"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
