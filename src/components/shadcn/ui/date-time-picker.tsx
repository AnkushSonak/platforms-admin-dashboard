"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Label } from "./label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

type Props = {
  value?: Date | null;
  onChange: (value: Date | null) => void;
};

export function DateTimePicker({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  // Extract time (HH:mm:ss)
  const time = value
    ? value.toTimeString().slice(0, 8) // "HH:MM:SS"
    : "00:00:00";

  const handleTimeChange = (timeString: string) => {
    if (!value) return; // Must select a date first

    const [h, m, s] = timeString.split(":").map(Number);

    const newDate = new Date(value);
    newDate.setHours(h);
    newDate.setMinutes(m);
    newDate.setSeconds(s);

    onChange(newDate);
  };

  return (
    <div className="flex gap-4">
      {/* DATE PICKER */}
      <div className="flex flex-col gap-3">
        {/* <Label className="px-1">Date</Label> */}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40 justify-between font-normal">
              {value ? value.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              captionLayout="dropdown"
              fromMonth={new Date(1990, 0)} // earliest month visible in dropdown
              toMonth={new Date(2035, 11)}  // latest month visible in dropdown
              hidden={{
                before: new Date(1990, 0, 1),
                after: new Date(2035, 11, 31),
              }}
              onSelect={(d) => {
                if (!d) onChange(null);
                else {
                  const newD = new Date(d);
                  if (value) {
                    newD.setHours(value.getHours());
                    newD.setMinutes(value.getMinutes());
                    newD.setSeconds(value.getSeconds());
                  }
                  onChange(newD);
                }
                setOpen(false);
              }}
            />

          </PopoverContent>
        </Popover>
      </div>

      {/* TIME PICKER */}
      <div className="flex flex-col gap-3">
        {/* <Label className="px-1">Time</Label> */}
        <Input
          type="time"
          step="1"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-background appearance-none"
        />
      </div>
    </div>
  );
}
