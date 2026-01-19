"use client";

import * as React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { systemUsers } from "@/data/mockData";

export type SelectOption = { label: string; value: string };

export type UserAccessFormValues = {
  userId: string;
  groups: string[];
  teams: string[];
  kams: string[];
};

interface UserAccessFormProps {
  groupOptions: { id: string; label: string; teams: { id: string; label: string; kams: SelectOption[] }[] }[];
  teamOptions: { id: string; label: string; kams: SelectOption[] }[];
  kamOptions: SelectOption[];
  onSave: (data: UserAccessFormValues) => void;
  initialValues?: UserAccessFormValues;
}

/* ---------------- Validation ---------------- */
const validationSchema = Yup.object({
  userId: Yup.string().required("Select a user"),
});

/* ---------------- Searchable Single Select (Chip) ---------------- */
function SearchableSingleSelect({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectItem = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const removeChip = () => onChange("");

  return (
    <div ref={ref} className="relative space-y-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "peer w-full min-h-[44px] rounded-md border px-3 pt-4 text-left text-sm bg-background",
          error ? "border-destructive" : "border-input"
        )}
      >
        {value ? (
          <div className="flex flex-wrap gap-1">
            <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
              {options.find((o) => o.value === value)?.label}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeChip(); }}>
                ×
              </button>
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground" />
        )}
      </button>

      <label
        className={cn(
          "pointer-events-none absolute left-3 bg-background px-1 transition-all",
          value ? "-top-2 text-xs font-semibold text-primary" : "top-3 text-sm text-muted-foreground"
        )}
      >
        {label}
      </label>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No results</CommandEmpty>
            <CommandList className="max-h-[200px] overflow-y-auto">
              {options.map((opt) => (
                <CommandItem key={opt.value} onSelect={() => selectItem(opt.value)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
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

/* ---------------- Searchable MultiSelect (Chip) ---------------- */
function SearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  allToggleLabel,
  allOption = false,
  error,
}: {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  allToggleLabel?: string;
  allOption?: boolean;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { }, [value]);

  // close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const toggleAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const removeChip = (v: string) => onChange(value.filter((x) => x !== v));

  return (
    <div ref={ref} className="relative space-y-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "peer w-full min-h-[44px] rounded-md border px-3 pt-4 text-left text-sm bg-background",
          error ? "border-destructive" : "border-input"
        )}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(value)).map((v) => (
              <span key={v} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                {options.find((o) => o.value === v)?.label}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeChip(v); }}>
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground" />
        )}
      </button>

      <label
        className={cn(
          "pointer-events-none absolute left-3 bg-background px-1 transition-all",
          value.length > 0 ? "-top-2 text-xs font-semibold text-primary" : "top-3 text-sm text-muted-foreground"
        )}
      >
        {label}
      </label>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
          <Command>
            {allOption && allToggleLabel && (
              <CommandItem onSelect={toggleAll} className="font-semibold">
                {value.length === options.length ? "Deselect All" : allToggleLabel}
              </CommandItem>
            )}
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No results</CommandEmpty>
            <CommandList className="max-h-[200px] overflow-y-auto">
              {options.map((opt) => (
                <CommandItem key={opt.value} onSelect={() => toggle(opt.value)}>
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

/* ---------------- UserAccessForm ---------------- */
export function UserAccessForm({
  groupOptions,
  teamOptions,
  kamOptions,
  onSave,
  initialValues,
}: UserAccessFormProps) {
  return (
    <Formik<UserAccessFormValues>
      initialValues={initialValues || { userId: "", groups: [], teams: [], kams: [] }}
      validationSchema={validationSchema}
     onSubmit={(values, { resetForm }) => {
        // Merge derived teams
        const derivedTeamsFromGroups = values.groups.flatMap((gId) => {
          const group = groupOptions.find((g) => g.id === gId);
          return group?.teams.map((t) => t.id) || [];
        });
        const allTeams = Array.from(new Set([...values.teams, ...derivedTeamsFromGroups]));

        // Merge derived KAMs
        const derivedKamsFromGroups = values.groups.flatMap((gId) => {
          const group = groupOptions.find((g) => g.id === gId);
          return group?.teams.flatMap((t) => t.kams.map((k) => k.value)) || [];
        });
        const derivedKamsFromTeams = allTeams.flatMap((tId) => {
          const team = teamOptions.find((t) => t.id === tId);
          return team?.kams.map((k) => k.value) || [];
        });
        const allKams = Array.from(new Set([...values.kams, ...derivedKamsFromGroups, ...derivedKamsFromTeams]));

        onSave({
          userId: values.userId,
          groups: values.groups,
          teams: allTeams,
          kams: allKams,
        });
          resetForm();


      }}
    >
      {({ values, setFieldValue, errors, touched }) => {
        // Display teams & KAMs in dropdowns
        const derivedTeamsFromGroups = values.groups.flatMap((gId) => {
          const group = groupOptions.find((g) => g.id === gId);
          return group?.teams.map((t) => t.id) || [];
        });
        const displayedTeams = Array.from(new Set([...values.teams, ...derivedTeamsFromGroups]));

        const derivedKamsFromGroups = values.groups.flatMap((gId) => {
          const group = groupOptions.find((g) => g.id === gId);
          return group?.teams.flatMap((t) => t.kams.map((k) => k.value)) || [];
        });
        const derivedKamsFromTeams = displayedTeams.flatMap((tId) => {
          const team = teamOptions.find((t) => t.id === tId);
          return team?.kams.map((k) => k.value) || [];
        });
        const displayedKams = Array.from(new Set([...values.kams, ...derivedKamsFromGroups, ...derivedKamsFromTeams]));

        return (
          <Form className="space-y-5 rounded-lg border bg-muted/50 p-4">
            <SearchableSingleSelect
              label="User"
              options={systemUsers.map(u => ({ label: u.name, value: u.id }))}
              value={values.userId}
              onChange={(v) => setFieldValue("userId", v)}
              error={touched.userId ? errors.userId : undefined}
            />

            <SearchableMultiSelect
              label="Groups"
              options={groupOptions.map((g) => ({ label: g.label, value: g.id }))}
              value={values.groups}
              onChange={(v) => setFieldValue("groups", v)}
              allToggleLabel="All Groups"
              allOption
            />

            <SearchableMultiSelect
              label="Teams"
              options={teamOptions.map((t) => ({ label: t.label, value: t.id }))}
              value={displayedTeams}
              onChange={(v) => setFieldValue("teams", v)}
              allToggleLabel="All Teams"
              allOption
            />

            <SearchableMultiSelect
              label="KAMs"
              options={kamOptions}
              value={displayedKams}
              onChange={(v) => setFieldValue("kams", v)}
              allToggleLabel="All KAMs"
              allOption
            />

            <div className="flex justify-end">
              <Button type="submit">Save Access</Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
