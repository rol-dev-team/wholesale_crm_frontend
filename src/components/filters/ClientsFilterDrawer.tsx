"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { FloatingSelect } from "@/components/ui/FloatingSelect";
import { SelectItem } from "@/components/ui/select";

interface Kam {
  id: string;
  name: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ClientsFilterDrawerProps {
  currentClient: string;
  setClient: (val: string) => void;
  currentDivision: string;
  setDivision: (val: string) => void;
  currentKam: string;
  setKam: (val: string) => void;
  clients: ClientOption[];
  divisions: string[];
  kams: Kam[];
  onApply: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export default function ClientsFilterDrawer({
  currentClient,
  setClient,
  currentDivision,
  setDivision,
  currentKam,
  setKam,
  clients,
  divisions,
  kams,
  onApply,
  hasActiveFilters,
  onClear,
}: ClientsFilterDrawerProps) {
  const [clientLocal, setClientLocal] = useState(currentClient);
  const [divisionLocal, setDivisionLocal] = useState(currentDivision);
  const [kamLocal, setKamLocal] = useState(currentKam);
  const [open, setOpen] = useState(false);

  // Sync local state with parent props
  useEffect(() => setClientLocal(currentClient), [currentClient]);
  useEffect(() => setDivisionLocal(currentDivision), [currentDivision]);
  useEffect(() => setKamLocal(currentKam), [currentKam]);

  // Apply filters
  const handleApply = () => {
    setClient(clientLocal);
    setDivision(divisionLocal);
    setKam(kamLocal);
    onApply();
    setOpen(false);
  };

  // Clear filters (local + parent)
  const handleClear = () => {
    setClientLocal("all");
    setDivisionLocal("all");
    setKamLocal("all");

    setClient("all");
    setDivision("all");
    setKam("all");

    onClear();
  };

  // ✅ Show placeholder by default
  const getDisplayValue = (val: string) => (val === "all" ? "" : val);

  // Compute local active filters for showing Clear button
  const hasLocalFilters =
    clientLocal !== "all" || divisionLocal !== "all" || kamLocal !== "all";

  return (
    <>
      {/* Filter Button */}
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filter</span>
        {hasActiveFilters && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            !
          </Badge>
        )}
      </Button>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-sm">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            {/* CLIENT FILTER */}
            <FloatingSelect
              label="All Client"
              value={getDisplayValue(clientLocal)}
              onValueChange={setClientLocal}
            >
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* DIVISION FILTER */}
            <FloatingSelect
              label="All Division"
              value={getDisplayValue(divisionLocal)}
              onValueChange={setDivisionLocal}
            >
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* KAM FILTER */}
            <FloatingSelect
              label="All KAM"
              value={getDisplayValue(kamLocal)}
              onValueChange={setKamLocal}
            >
              {kams.map((kam) => (
                <SelectItem key={kam.id} value={kam.id}>
                  {kam.name}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* Clear Filters */}
            {hasLocalFilters && (
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={handleClear}
              >
                <RotateCcw className="h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </div>

          <DrawerFooter>
            <Button className="w-full" onClick={handleApply}>
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
