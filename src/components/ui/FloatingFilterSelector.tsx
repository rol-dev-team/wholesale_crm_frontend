import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, X } from "lucide-react";

export type FloatingFilterOption = {
  label: string;
  value: string;
};

interface FloatingFilterSelectorProps {
  label: string;
  value?: string | string[];
  onChange: (v: string | string[]) => void;
  options: FloatingFilterOption[];
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
  onSelectComplete?: () => void; // closes drawer
}

export function FloatingFilterSelector({
  label,
  value,
  onChange,
  options,
  multiple = false,
  searchable = false,
  className,
  onSelectComplete,
}: FloatingFilterSelectorProps) {
  const isMulti = multiple;
  const values = Array.isArray(value) ? value : [];
  const hasValue = isMulti ? values.length > 0 : Boolean(value);

  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("relative w-full", className)}>
      <Select
        open={open}
        onOpenChange={setOpen}
        value={!isMulti ? (value as string | undefined) : undefined}
        onValueChange={(v) => {
          if (!isMulti) {
            onChange(v);
            setOpen(false);
            onSelectComplete?.();
          }
        }}
      >
        {/* Trigger */}
        <SelectTrigger className="peer min-h-[44px] w-full px-3 pt-4 text-sm">
          {isMulti && values.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {values.map((v) => {
                const lbl = options.find((o) => o.value === v)?.label;
                return (
                  <span
                    key={v}
                    className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                  >
                    {lbl}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(values.filter((x) => x !== v));
                      }}
                    />
                  </span>
                );
              })}
            </div>
          ) : (
            <SelectValue>
              {!isMulti && value
                ? options.find((o) => o.value === value)?.label
                : " "}
            </SelectValue>
          )}
        </SelectTrigger>

        {/* Content */}
        <SelectContent>
          {searchable ? (
            <Command>
              <CommandInput placeholder={`Search ${label}...`} />
              <CommandEmpty>No results</CommandEmpty>

              <CommandList>
                {options.map((opt) => {
                  const checked = isMulti
                    ? values.includes(opt.value)
                    : value === opt.value;

                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => {
                        if (isMulti) {
                          onChange(
                            checked
                              ? values.filter((v) => v !== opt.value)
                              : [...values, opt.value]
                          );
                        } else {
                          onChange(opt.value);
                          setOpen(false);
                          onSelectComplete?.();
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
          ) : (
  <Command>
    <CommandList>
      {options.map((opt) => {
        const checked = values.includes(opt.value);

        return (
          <CommandItem
            key={opt.value}
            onSelect={() => {
              onChange(
                checked
                  ? values.filter((v) => v !== opt.value)
                  : [...values, opt.value]
              );
            }}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
            {opt.label}
          </CommandItem>
        );
      })}
    </CommandList>
  </Command>
)}

        </SelectContent>
      </Select>

      {/* Floating Label */}
      <label
        className={cn(
          "pointer-events-none absolute left-3 bg-background px-1 transition-all",
          hasValue
            ? "-top-2 text-xs font-semibold text-primary"
            : "top-3 text-sm text-muted-foreground",
          "peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
        )}
      >
        {label}
      </label>
    </div>
  );
}
