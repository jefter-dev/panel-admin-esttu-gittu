"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartType } from "@/components/dashboard/chart-payments/chart-interactive-payments";

interface ChartTypeSelectorProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
}

export function ChartTypeSelector({
  chartType,
  setChartType,
}: ChartTypeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={chartType}
      onValueChange={(v: string) => v && setChartType(v as ChartType)}
      variant="outline"
      className="ml-auto"
    >
      <ToggleGroupItem value="bar" className="cursor-pointer px-4">
        Barras
      </ToggleGroupItem>
      <ToggleGroupItem value="area" className="cursor-pointer px-4">
        Área
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
