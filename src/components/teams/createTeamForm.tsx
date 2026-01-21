"use client";

import * as React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { cn } from "@/lib/utils";
import { FloatingInput } from "@/components/ui/FloatingInput";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type SelectOption = {
  label: string;
  value: string;
};

export type TeamPayload = {
  name: string;
  kams: string[];
  supervisors: string[];
};

interface FloatingTeamFormProps {
  kamOptions: SelectOption[];
  supervisorOptions: SelectOption[];
  onSave: (team: TeamPayload, index?: number) => void; 
  onCancel?: () => void;
  initialValues?: TeamPayload; 
  index?: number; 
}

/* ------------------------------------------------------------------ */
/* VALIDATION */
/* ------------------------------------------------------------------ */

const TeamSchema = Yup.object({
  teamName: Yup.string().trim().required("Team name is required"),
  kams: Yup.array().of(Yup.string()).min(1, "Select at least one KAM"),
  supervisors: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one supervisor"),
});

/* ------------------------------------------------------------------ */
/* MULTI SELECT with chips and outside click detection */
/* ------------------------------------------------------------------ */

function SearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const removeChip = (v: string) => {
    onChange(value.filter((x) => x !== v));
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "peer w-full min-h-[44px] rounded-md border px-3 pt-4 text-left text-sm bg-background flex flex-wrap gap-1",
          error ? "border-destructive" : "border-input",
          "focus:outline-none focus:ring-1 focus:ring-primary"
        )}
      >
        {value.length > 0 ? (
          value.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
            >
              {options.find((o) => o.value === v)?.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // prevent dropdown toggle
                  removeChip(v);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">Select {label}</span>
        )}
      </button>

      {/* Floating label */}
      <label
        className={cn(
          "pointer-events-none absolute left-3 bg-background px-1 transition-all",
          value.length > 0
            ? "-top-2 text-xs font-semibold text-primary"
            : "top-3 text-sm text-muted-foreground",
          "peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
        )}
      >
        {label}
      </label>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No results</CommandEmpty>
            <CommandList className="max-h-[200px] overflow-y-auto">
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  onSelect={() => toggleValue(opt.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(opt.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */

export default function FloatingTeamForm({
  kamOptions,
  supervisorOptions,
  onSave,
  onCancel,
  initialValues,
  index,
}: FloatingTeamFormProps) {
  return (
    <Formik
      initialValues={{
        teamName: initialValues?.name || "",
        kams: initialValues?.kams || [],
        supervisors: initialValues?.supervisors || [],
      }}
      validationSchema={TeamSchema}
      onSubmit={(values, { resetForm }) => {
        onSave(
          {
            name: values.teamName.trim(),
            kams: values.kams,
            supervisors: values.supervisors,
          },
          index
        );
        resetForm(); // ✅ reset form after submit
      }}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form className="space-y-5 rounded-lg border bg-muted/50 p-4">
          {/* Team Name */}
          <FloatingInput
            label="Team Name"
            value={values.teamName}
            onChange={(e) => setFieldValue("teamName", e.target.value)}
            error={touched.teamName ? errors.teamName : undefined}
          />

          {/* KAMs */}
          <SearchableMultiSelect
            label="Assign KAMs"
            options={kamOptions}
            value={values.kams}
            onChange={(v) => setFieldValue("kams", v)}
            error={touched.kams ? (errors.kams as string) : undefined}
          />

          {/* Supervisors */}
          <SearchableMultiSelect
            label="Assign Supervisors"
            options={supervisorOptions}
            value={values.supervisors}
            onChange={(v) => setFieldValue("supervisors", v)}
            error={touched.supervisors ? (errors.supervisors as string) : undefined}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              Save Team
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
