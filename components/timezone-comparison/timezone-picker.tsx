"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useTimezone } from "@/contexts/timezone-context";
import { getAllTimezoneIds, parseTimezoneId } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * Searchable timezone picker component that allows users to search
 * and select from all available IANA timezones.
 */
export function TimezonePicker() {
  const { addTimezone, timezoneDisplays } = useTimezone();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get all timezone IDs and group them by region
  const timezonesByRegion = useMemo(() => {
    const allIds = getAllTimezoneIds();
    const existingIds = new Set(timezoneDisplays.map((d) => d.timezone.id));
    
    // Filter out already added timezones
    const availableIds = allIds.filter((id) => !existingIds.has(id));
    
    // Group by region
    const grouped: Record<string, string[]> = {};
    
    availableIds.forEach((id) => {
      const { region } = parseTimezoneId(id);
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(id);
    });
    
    // Sort regions and timezones within each region
    const sortedRegions = Object.keys(grouped).sort();
    const sorted: Record<string, string[]> = {};
    
    sortedRegions.forEach((region) => {
      sorted[region] = grouped[region].sort();
    });
    
    return sorted;
  }, [timezoneDisplays]);

  // Filter timezones based on search query
  const filteredTimezonesByRegion = useMemo(() => {
    if (!search.trim()) {
      return timezonesByRegion;
    }
    
    const query = search.toLowerCase();
    const filtered: Record<string, string[]> = {};
    
    Object.entries(timezonesByRegion).forEach(([region, ids]) => {
      const matchingIds = ids.filter((id) => {
        const { city } = parseTimezoneId(id);
        return (
          city.toLowerCase().includes(query) ||
          region.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query)
        );
      });
      
      if (matchingIds.length > 0) {
        filtered[region] = matchingIds;
      }
    });
    
    return filtered;
  }, [timezonesByRegion, search]);

  const handleSelect = (timezoneId: string) => {
    addTimezone(timezoneId);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add Timezone
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0 bg-white border border-slate-200 shadow-sm" 
        align="start"
      >
        <Command shouldFilter={false} className="bg-white [&_[cmdk-input-wrapper]]:border-slate-200">
          <CommandInput
            placeholder="Search timezones..."
            value={search}
            onValueChange={setSearch}
            className="h-11"
          />
          <CommandList className="max-h-[400px] p-1">
            <CommandEmpty className="py-8 text-center text-sm text-slate-500">
              {search.trim()
                ? "No timezones found."
                : "No timezones available."}
            </CommandEmpty>
            {Object.entries(filteredTimezonesByRegion).map(([region, ids]) => (
              <CommandGroup 
                key={region} 
                heading={region}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {ids.map((timezoneId) => {
                  const { city } = parseTimezoneId(timezoneId);
                  return (
                    <CommandItem
                      key={timezoneId}
                      value={timezoneId}
                      onSelect={() => handleSelect(timezoneId)}
                      className="cursor-pointer px-3 py-2.5 rounded-md transition-colors data-[selected=true]:bg-slate-50 data-[selected=true]:text-slate-900 hover:bg-slate-50"
                    >
                      <span className="flex-1 text-sm font-medium text-slate-900">
                        {city}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {timezoneId}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

