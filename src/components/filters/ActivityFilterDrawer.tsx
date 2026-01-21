// ActivityFilterDrawer.tsx

"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, RotateCcw } from "lucide-react";

import { FloatingFilterSelector } from "@/components/ui/FloatingFilterSelector";
import { FloatingDateRangePicker } from "@/components/ui/FloatingDateRangePicker";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type Option<T = string> = {
  label: string;
  value: T;
};

export type FilterConfig<T = string> =
  | {
      type: "single-select";
      label: string;
      value: T;
      onChange: (v: T) => void;
      options: Option<T>[];
    }
  | {
      type: "search-select";
      label: string;
      value: T;
      onChange: (v: T) => void;
      options: Option<T>[];
    }
  | {
      type: "multi-select";
      label: string;
      value: T[];
      onChange: (v: T[]) => void;
      options: Option<T>[];
    }
  | {
      type: "date-range";
      label: string;
      value: { from?: string; to?: string };
      onChange: (v: { from?: string; to?: string }) => void;
    };

interface FilterDrawerProps<T = string> {
  open: boolean;
  onClose: () => void;
  title?: string;
  filters: FilterConfig<T>[];
  onApply: () => void;
  onReset: () => void;
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export function FilterDrawer<T = string>({
  open,
  onClose,
  title = "Filters",
  filters,
  onApply,
  onReset,
}: FilterDrawerProps<T>) {
  
  // 1. Define the desired sequence (Case insensitive matching)
  const sequence = ["division", "supervisor", "kam", "type", "client", "date"];

  // 2. Filter out "Business" and "Business Entity" and sort based on sequence
  const orderedFilters = React.useMemo(() => {
    return filters
      .filter((f) => {
        const label = f.label.toLowerCase();
        // Removes "Business", "Business Entity", or any label containing "entity"
        return !label.includes("business") && !label.includes("entity");
      })
      .sort((a, b) => {
        const indexA = sequence.findIndex((s) => a.label.toLowerCase().includes(s));
        const indexB = sequence.findIndex((s) => b.label.toLowerCase().includes(s));
        
        const finalA = indexA === -1 ? 99 : indexA;
        const finalB = indexB === -1 ? 99 : indexB;
        
        return finalA - finalB;
      });
  }, [filters]);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="w-full sm:w-[420px]">
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Body */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 py-2">
            {orderedFilters.map((filter, idx) => {
              if (filter.type === "single-select") {
                return (
                  <FloatingFilterSelector
                    key={idx}
                    label={filter.label}
                    value={String(filter.value)}
                    onChange={(v) => {
                      const selected = filter.options.find(
                        (o) => String(o.value) === v
                      );
                      if (selected) {
                        filter.onChange(selected.value);
                      }
                    }}
                    options={filter.options.map((o) => ({
                      label: o.label,
                      value: String(o.value),
                    }))}
                  />
                );
              }

              if (filter.type === "search-select") {
                return (
                  <FloatingFilterSelector
                    key={idx}
                    label={filter.label}
                    value={String(filter.value)}
                    searchable
                    onChange={(v) => filter.onChange(v as T)}
                    options={filter.options.map((o) => ({
                      label: o.label,
                      value: String(o.value),
                    }))}
                  />
                );
              }

              if (filter.type === "multi-select") {
                return (
                  <FloatingFilterSelector
                    key={idx}
                    label={filter.label}
                    multiple
                    value={filter.value.map(String)}
                    onChange={(v) => {
                      const selectedValues = (v as string[])
                        .map((sv) =>
                          filter.options.find((o) => String(o.value) === sv)?.value
                        )
                        .filter(Boolean) as T[];

                      filter.onChange(selectedValues);
                    }}
                    options={filter.options.map((o) => ({
                      label: o.label,
                      value: String(o.value),
                    }))}
                  />
                );
              }

              if (filter.type === "date-range") {
                return (
                  <FloatingDateRangePicker
                    key={idx}
                    label={filter.label}
                    value={{
                      startDate: filter.value.from,
                      endDate: filter.value.to,
                    }}
                    onChange={(v) =>
                      filter.onChange({
                        from: v.startDate,
                        to: v.endDate,
                      })
                    }
                  />
                );
              }

              return null;
            })}
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4" /> Clear All Filters
              </Button>
          </div>
        </ScrollArea>
              

        {/* Footer */}
        <DrawerFooter>
          <div className="grid grid-cols-1 gap-3">
            {/* <Button variant="outline" onClick={onReset}>
              Reset
            </Button> */}
            <Button onClick={onApply}>Apply Filters</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}