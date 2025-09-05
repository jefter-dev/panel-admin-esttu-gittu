"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date?: DateRange;
  onChange?: (range: DateRange) => void;
}

export function DateRangePicker({ date, onChange }: DateRangePickerProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    date ?? { from: new Date(), to: addDays(new Date(), 7) }
  );

  const handleChange = (range: DateRange | undefined) => {
    if (!range || !range.from) {
      setInternalDate(undefined);
      return;
    }

    setInternalDate(range);
    onChange?.(range);
  };

  React.useEffect(() => {
    if (date) setInternalDate(date);
  }, [date]);

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild className="cursor-pointer">
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !internalDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {internalDate?.from ? (
              internalDate.to ? (
                <>
                  {format(internalDate.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(internalDate.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(internalDate.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Escolha uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={internalDate?.from}
            selected={internalDate}
            onSelect={handleChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
