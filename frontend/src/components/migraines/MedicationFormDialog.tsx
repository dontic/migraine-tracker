import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  migraineMedicationsCreate,
  migraineMedicationsUpdate,
} from "@/api/django/migraine-medications/migraine-medications";
import type { Medication, TypeEnum } from "@/api/django/djangoAPI.schemas";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const MEDICATION_TYPE_OPTIONS: { value: TypeEnum; label: string }[] = [
  { value: "triptan", label: "Triptan" },
  { value: "otc_analgesic", label: "OTC analgesic" },
  { value: "antiemetic", label: "Antiemetic" },
  { value: "preventive", label: "Preventive" },
  { value: "ergotamine", label: "Ergotamine" },
  { value: "gepant", label: "Gepant" },
  { value: "other", label: "Other" },
];

const NO_TYPE_VALUE = "__none__";

const medicationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().optional(),
  is_active: z.boolean(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication;
  onSuccess: (medication: Medication) => void;
}

export function MedicationFormDialog({
  open,
  onOpenChange,
  medication,
  onSuccess,
}: MedicationFormDialogProps) {
  const isEditMode = medication != null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MedicationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicationSchema) as any,
    defaultValues: {
      name: "",
      type: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }
    form.reset({
      name: medication?.name ?? "",
      type: medication?.type ?? "",
      is_active: medication?.is_active ?? true,
    });
  }, [open, medication]);

  async function onSubmit(values: MedicationFormValues) {
    setIsSubmitting(true);
    const payload = {
      name: values.name,
      type: (values.type || undefined) as never,
      is_active: values.is_active,
    };
    try {
      const saved = isEditMode
        ? await migraineMedicationsUpdate(medication!.id, payload)
        : await migraineMedicationsCreate(payload);
      toast.success(isEditMode ? "Medication updated." : "Medication added.");
      onSuccess(saved);
      onOpenChange(false);
    } catch {
      toast.error("Failed to save medication.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit medication" : "Add medication"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sumatriptan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === NO_TYPE_VALUE ? "" : v)
                    }
                    value={field.value ? field.value : NO_TYPE_VALUE}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_TYPE_VALUE}>—</SelectItem>
                      {MEDICATION_TYPE_OPTIONS.map((opt) => (
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
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">Active</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving…"
                  : isEditMode
                    ? "Update medication"
                    : "Add medication"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
