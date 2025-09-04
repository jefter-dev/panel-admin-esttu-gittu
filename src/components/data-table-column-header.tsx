import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const sortIcons: Record<"asc" | "desc" | "none", React.ReactNode> = {
  asc: <SortAsc className="ml-2 h-4 w-4" />,
  desc: <SortDesc className="ml-2 h-4 w-4" />,
  none: <ArrowUpDown className="ml-2 h-4 w-4" />,
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sort = column.getIsSorted() || "none";

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(sort === "asc")}
        className="cursor-pointer -ml-3 h-8 data-[state=open]:bg-accent"
      >
        <span>{title}</span>
        {sortIcons[sort]}
      </Button>
    </div>
  );
}
