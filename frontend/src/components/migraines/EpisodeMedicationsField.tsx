import { useMemo, useState } from "react";
import {
  PencilIcon,
  Trash2Icon,
  PlusIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";

import { migraineMedicationsDestroy } from "@/api/django/migraine-medications/migraine-medications";
import type { Medication } from "@/api/django/djangoAPI.schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MedicationFormDialog } from "./MedicationFormDialog";

export interface EpisodeMedicationEntry {
  medication: number;
  taken_offset_minutes: number | null;
  effectiveness: number | null;
}

interface EpisodeMedicationsFieldProps {
  value: EpisodeMedicationEntry[];
  onChange: (next: EpisodeMedicationEntry[]) => void;
  medications: Medication[];
  onMedicationsChange: () => Promise<void>;
}

const EFFECTIVENESS_OPTIONS = [
  { value: 0, label: "No relief" },
  { value: 1, label: "Partial relief" },
  { value: 2, label: "Full relief" },
];

const NO_EFFECTIVENESS_VALUE = "__none__";

export function EpisodeMedicationsField({
  value,
  onChange,
  medications,
  onMedicationsChange,
}: EpisodeMedicationsFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Medication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const medicationsById = useMemo(() => {
    const map = new Map<number, Medication>();
    for (const m of medications) map.set(m.id, m);
    return map;
  }, [medications]);

  const filteredMedications = useMemo(() => {
    if (!search) return medications;
    return medications.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [medications, search]);

  function addRow(medicationId: number) {
    onChange([
      ...value,
      {
        medication: medicationId,
        taken_offset_minutes: null,
        effectiveness: null,
      },
    ]);
    setPickerOpen(false);
    setSearch("");
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<EpisodeMedicationEntry>) {
    onChange(
      value.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      await migraineMedicationsDestroy(deleteTarget.id);
      onChange(value.filter((row) => row.medication !== deleteTarget.id));
      await onMedicationsChange();
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {value.length > 0 && (
          <div className="flex flex-col gap-2">
            {value.map((row, index) => {
              const med = medicationsById.get(row.medication);
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium flex-1 truncate">
                      {med?.name ?? "Unknown medication"}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => removeRow(index)}
                      aria-label="Remove medication"
                    >
                      <XIcon className="size-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        Offset (min)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 30"
                        value={
                          row.taken_offset_minutes != null
                            ? String(row.taken_offset_minutes)
                            : ""
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          updateRow(index, {
                            taken_offset_minutes:
                              v === "" ? null : Number(v),
                          });
                        }}
                        className="h-8"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        Effectiveness
                      </label>
                      <Select
                        value={
                          row.effectiveness != null
                            ? String(row.effectiveness)
                            : NO_EFFECTIVENESS_VALUE
                        }
                        onValueChange={(v) =>
                          updateRow(index, {
                            effectiveness:
                              v === NO_EFFECTIVENESS_VALUE ? null : Number(v),
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_EFFECTIVENESS_VALUE}>
                            —
                          </SelectItem>
                          {EFFECTIVENESS_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Popover open={pickerOpen} onOpenChange={setPickerOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-1.5"
            >
              <PlusIcon className="size-4" />
              Add medication
              <ChevronDownIcon className="size-4 ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
            align="start"
          >
            <div className="p-2 border-b">
              <Input
                placeholder="Search medications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-sm"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filteredMedications.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No medications found
                </div>
              )}
              {filteredMedications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer group hover:bg-accent hover:text-accent-foreground"
                  onClick={() => addRow(med.id)}
                >
                  <span className="flex-1 truncate">{med.name}</span>
                  <div className="flex opacity-0 group-hover:opacity-100 shrink-0">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(med);
                      }}
                      aria-label="Edit medication"
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(med);
                      }}
                      aria-label="Delete medication"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs justify-start gap-1.5"
                onClick={() => {
                  setPickerOpen(false);
                  setCreateOpen(true);
                }}
              >
                <PlusIcon className="size-3" />
                Add new medication
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <MedicationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={async (saved) => {
          await onMedicationsChange();
          addRow(saved.id);
        }}
      />

      <MedicationFormDialog
        open={editTarget != null}
        onOpenChange={(o) => !o && setEditTarget(null)}
        medication={editTarget ?? undefined}
        onSuccess={async () => {
          await onMedicationsChange();
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
