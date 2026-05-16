import { useEffect, useState } from "react";
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
import { ManagedMultiSelect } from "./ManagedMultiSelect";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

const HEADACHE_SIDE_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
];

const HEADACHE_REGION_OPTIONS = [
  { value: "temporal", label: "Temporal" },
  { value: "frontal", label: "Frontal" },
  { value: "occipital", label: "Occipital" },
  { value: "vertex", label: "Vertex" },
  { value: "retro_orbital", label: "Retro-orbital" },
  { value: "orbital", label: "Orbital" },
  { value: "parietal", label: "Parietal" },
];

const AURA_TYPE_OPTIONS = [
  { value: "auditory", label: "Auditory" },
  { value: "cognitive", label: "Cognitive" },
  { value: "dizziness", label: "Dizziness" },
  { value: "motor", label: "Motor" },
  { value: "sensory", label: "Sensory" },
  { value: "speech", label: "Speech" },
  { value: "tingling", label: "Tingling" },
  { value: "visual", label: "Visual" },
];

const VISUAL_AURA_LOCATION_OPTIONS = [
  { value: "bilateral", label: "Bilateral" },
  { value: "central", label: "Central" },
  { value: "left_field", label: "Left field" },
  { value: "lower_field", label: "Lower field" },
  { value: "peripheral", label: "Peripheral" },
  { value: "right_field", label: "Right field" },
  { value: "upper_field", label: "Upper field" },
];

const episodeSchema = z
  .object({
  started_at: z.string().min(1, "Start time is required"),
  still_ongoing: z.boolean(),
  ended_at: z.string().optional(),
  migraine_type: z.string().optional(),
  pain_level: z.number().int().min(0).max(5),
  headache_side: z.string().optional(),
  headache_regions: z.array(z.string()),
  disability_level: z.string().optional(),
  has_aura: z.boolean(),
  aura_types: z.array(z.string()),
  visual_aura_locations: z.array(z.string()),
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
  trigger_ids: z.array(z.number()),
  symptom_ids: z.array(z.number()),
  medication_ids: z.array(z.number()),
})
.superRefine((data, ctx) => {
  if (!data.still_ongoing && (!data.ended_at || data.ended_at.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time is required",
      path: ["ended_at"],
    });
  }
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
    // zodResolver returns Resolver<z4.input<T>> but useForm needs Resolver<z4.output<T>>;
    // z.coerce fields make input≠output in Zod v4, so we cast to satisfy the compiler.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(episodeSchema) as any,
    defaultValues: {
      started_at: toDatetimeLocal(new Date().toISOString()),
      still_ongoing: false,
      pain_level: 0,
      headache_regions: [],
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
    if (!open) {
      form.reset();
      return;
    }
    if (!isEditMode) {
      form.reset({
        started_at: toDatetimeLocal(new Date().toISOString()),
        still_ongoing: false,
        pain_level: 0,
        headache_regions: [],
        has_aura: false,
        aura_types: [],
        visual_aura_locations: [],
        trigger_ids: [],
        symptom_ids: [],
        medication_ids: [],
      });
      return;
    }
    migraineEpisodesRetrieve(episodeId!)
      .then((ep) => {
        form.reset({
          started_at: toDatetimeLocal(ep.started_at),
          still_ongoing: !ep.ended_at,
          ended_at: ep.ended_at ? toDatetimeLocal(ep.ended_at) : "",
          migraine_type: ep.migraine_type ?? "",
          pain_level: ep.pain_level ?? 0,
          headache_side: ep.headache_side ?? "",
          headache_regions: ep.headache_regions ?? [],
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
      headache_side: values.headache_side as never || undefined,
      headache_regions: values.headache_regions,
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
                {!form.watch("still_ongoing") && (
                  <FormField
                    control={form.control}
                    name="ended_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ended *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormField
                control={form.control}
                name="still_ongoing"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) form.setValue("ended_at", "");
                        }}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Still ongoing
                    </FormLabel>
                  </FormItem>
                )}
              />

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
                  name="headache_side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side</FormLabel>
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
                          {HEADACHE_SIDE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="headache_regions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regions</FormLabel>
                    <FormControl>
                      <MultiSelect
                        values={field.value}
                        onValuesChange={field.onChange}
                      >
                        <MultiSelectTrigger className="w-full">
                          <MultiSelectValue placeholder="Select regions…" />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                          <MultiSelectGroup>
                            {HEADACHE_REGION_OPTIONS.map((opt) => (
                              <MultiSelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MultiSelectItem>
                            ))}
                          </MultiSelectGroup>
                        </MultiSelectContent>
                      </MultiSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <MultiSelect
                            values={field.value}
                            onValuesChange={field.onChange}
                          >
                            <MultiSelectTrigger className="w-full">
                              <MultiSelectValue placeholder="Select aura types…" />
                            </MultiSelectTrigger>
                            <MultiSelectContent>
                              <MultiSelectGroup>
                                {AURA_TYPE_OPTIONS.map((opt) => (
                                  <MultiSelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MultiSelectItem>
                                ))}
                              </MultiSelectGroup>
                            </MultiSelectContent>
                          </MultiSelect>
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
                          <MultiSelect
                            values={field.value}
                            onValuesChange={field.onChange}
                          >
                            <MultiSelectTrigger className="w-full">
                              <MultiSelectValue placeholder="Select locations…" />
                            </MultiSelectTrigger>
                            <MultiSelectContent>
                              <MultiSelectGroup>
                                {VISUAL_AURA_LOCATION_OPTIONS.map((opt) => (
                                  <MultiSelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MultiSelectItem>
                                ))}
                              </MultiSelectGroup>
                            </MultiSelectContent>
                          </MultiSelect>
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
                      <FormLabel>Stress level</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "" ? null : Number(v))
                        }
                        value={field.value != null ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 — None</SelectItem>
                          <SelectItem value="1">1 — Mild</SelectItem>
                          <SelectItem value="2">2 — Moderate</SelectItem>
                          <SelectItem value="3">3 — High</SelectItem>
                          <SelectItem value="4">4 — Very high</SelectItem>
                          <SelectItem value="5">5 — Extreme</SelectItem>
                        </SelectContent>
                      </Select>
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
