import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeRange } from "@/components/dashboard/chart-payments/chart-interactive-payments";

interface TimeRangeSelectorProps {
  timeRange: TimeRange | null;
  setTimeRange: (value: TimeRange | null) => void;
  setCurrentDateRange: (range: { from: Date; to: Date } | null) => void;
}

export function DateTimeRangeSelector({
  timeRange,
  setTimeRange,
  setCurrentDateRange,
}: TimeRangeSelectorProps) {
  return (
    <>
      <div className="flex sm:hidden flex-1 !justify-start">
        <Select
          value={timeRange ?? undefined}
          onValueChange={(v) => {
            setTimeRange(v as TimeRange);
            setCurrentDateRange(null);
          }}
        >
          <SelectTrigger className="w-full text-left">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1y">Anual</SelectItem>
            <SelectItem value="6m">Semestral</SelectItem>
            <SelectItem value="3m">Trimestral</SelectItem>
            <SelectItem value="30d">Mensal</SelectItem>
            <SelectItem value="7d">Semanal</SelectItem>
            <SelectItem value="1d">Diário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:flex gap-2">
        <ToggleGroup
          type="single"
          value={timeRange ?? undefined}
          onValueChange={(v: string) => {
            setTimeRange(v as TimeRange);
            setCurrentDateRange(null);
          }}
          variant="outline"
        >
          <ToggleGroupItem value="1y" className="cursor-pointer px-4">
            Anual
          </ToggleGroupItem>
          <ToggleGroupItem value="6m" className="cursor-pointer px-4">
            Semestral
          </ToggleGroupItem>
          <ToggleGroupItem value="3m" className="cursor-pointer px-4">
            Trimestral
          </ToggleGroupItem>
          <ToggleGroupItem value="30d" className="cursor-pointer px-4">
            Mensal
          </ToggleGroupItem>
          <ToggleGroupItem value="7d" className="cursor-pointer px-4">
            Semanal
          </ToggleGroupItem>
          <ToggleGroupItem value="1d" className="cursor-pointer px-4">
            Diário
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );
}
