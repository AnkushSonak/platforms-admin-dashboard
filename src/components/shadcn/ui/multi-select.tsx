// components/ui/multi-select.tsx
// This is a basic MultiSelect component using Shadcn UI primitives.
// You might have a more robust one, or want to integrate a library like react-select.
// This serves as a functional placeholder.

"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils"; // Assuming you have a utility for class merging
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/shadcn/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { Badge } from "@/components/shadcn/ui/badge";

interface Option {
  label: string;
  value: string; // Explicitly enforce value as string
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelect: (selectedValues: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onSelect, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onSelect(newSelected);
  };

  const selectedLabels = selected
    .map(value => options.find(option => option.value === value)?.label)
    .filter(Boolean) as string[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-[40px] flex-wrap", className)}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder || "Select items..."}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1 rounded-md">
                  {label}
                  {/* Changed from <button> to <span> for valid HTML nesting */}
                  <span
                    role="button" // Indicate it's interactive
                    tabIndex={0} // Make it keyboard focusable
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent popover from closing
                      handleSelect(options.find(opt => opt.label === label)?.value || '');
                    }}
                    onKeyDown={(e) => { // Add keyboard support for accessibility
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(options.find(opt => opt.label === label)?.value || '');
                      }
                    }}
                    className="ml-1 -mr-0.5 h-3 w-3 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 cursor-pointer"
                  >
                    <span className="sr-only">Remove {label}</span>
                    &times;
                  </span>
                </Badge>
              ))}
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
