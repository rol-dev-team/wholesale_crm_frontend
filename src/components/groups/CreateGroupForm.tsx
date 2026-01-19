"use client";

import * as React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type SelectOption = { label: string; value: string; };

export type CreateGroupFormValues = {
  groupName: string;
  teams: string[];
  supervisors: string[];
};

/* ------------------------------------------------------------------ */
/* VALIDATION */
/* ------------------------------------------------------------------ */

const validationSchema = Yup.object({
  groupName: Yup.string().required("Group name is required"),
  teams: Yup.array().min(1, "Select at least one team"),
  supervisors: Yup.array().min(1, "Select at least one supervisor"),
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
/* CREATE GROUP FORM */
/* ------------------------------------------------------------------ */

export function CreateGroupForm({
  teamOptions,
  supervisorOptions,
  onSave,
  initialValues,
  index,
}: {
  teamOptions: SelectOption[];
  supervisorOptions: SelectOption[];
  onSave: (group: CreateGroupFormValues, index?: number) => void;
  initialValues?: CreateGroupFormValues;
  index?: number;
}) {
  return (
    <Formik<CreateGroupFormValues>
      initialValues={{
        groupName: initialValues?.groupName || "",
        teams: initialValues?.teams || [],
        supervisors: initialValues?.supervisors || [],
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        onSave(values, index);
        toast({
          title: `Group ${initialValues ? "updated" : "created"}`,
          description: `Group "${values.groupName}" has been ${initialValues ? "updated" : "created"}.`,
        });
        resetForm(); // ✅ reset form after submit
      }}
    >
      {({ values, errors, touched, setFieldValue, handleChange }) => (
        <Form className="space-y-5 rounded-lg border bg-muted/50 p-4">
          {/* Group Name */}
          <div className="space-y-1">
            <Label>Group Name</Label>
            <Input
              name="groupName"
              value={values.groupName}
              onChange={handleChange}
              placeholder="Enter group name"
            />
            {touched.groupName && errors.groupName && (
              <p className="text-xs text-destructive">{errors.groupName}</p>
            )}
          </div>

          {/* Teams */}
          <SearchableMultiSelect
            label="Teams"
            options={teamOptions}
            value={values.teams}
            onChange={(v) => setFieldValue("teams", v)}
            error={touched.teams ? (errors.teams as string) : undefined}
          />

          {/* Supervisors */}
          <SearchableMultiSelect
            label="Supervisors"
            options={supervisorOptions}
            value={values.supervisors}
            onChange={(v) => setFieldValue("supervisors", v)}
            error={touched.supervisors ? (errors.supervisors as string) : undefined}
          />

          <div className="flex justify-end">
            <Button type="submit">{initialValues ? "Update Group" : "Create Group"}</Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
