"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SearchX } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";

interface PaymentsTableToolbarProps {
  search: string;
  dateRange?: DateRange;
  onFilterChange: (filters: { search: string; dateRange?: DateRange }) => void;
}

export function PaymentsTableToolbar({
  search,
  dateRange,
  onFilterChange,
}: PaymentsTableToolbarProps) {
  const [currentSearch, setCurrentSearch] = React.useState(search);
  const [currentDateRange, setCurrentDateRange] = React.useState<DateRange>(
    dateRange ?? { from: undefined, to: undefined }
  );

  // Debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        search: currentSearch,
        dateRange: currentDateRange,
      });
    }, 350);

    return () => clearTimeout(handler);
  }, [currentSearch, currentDateRange, onFilterChange]);

  const handleSearchClick = () => {
    onFilterChange({
      search: currentSearch,
      dateRange: currentDateRange,
    });
  };

  const clearSearch = () => {
    setCurrentSearch("");
    setCurrentDateRange({ from: undefined, to: undefined });
    onFilterChange({
      search: "",
      dateRange: { from: undefined, to: undefined },
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
      {/* Search input */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          placeholder="Pesquisar por nome ou CPF"
          value={currentSearch}
          onChange={(e) => setCurrentSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        <Button
          variant="outline"
          onClick={clearSearch}
          className="w-full sm:w-auto flex items-center"
        >
          <SearchX size={14} />
          Limpar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Filter period */}
        <DateRangePicker
          date={currentDateRange}
          onChange={(range) => setCurrentDateRange(range)}
        />

        <Button
          onClick={handleSearchClick}
          className="w-full sm:w-auto flex items-center cursor-pointer"
        >
          <Search /> Pesquisar
        </Button>
      </div>
    </div>
  );
}
