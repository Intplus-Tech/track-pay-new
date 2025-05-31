import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterOption } from "@/types/data-table";
import { ChevronDown, Filter } from "lucide-react";

interface TableFiltersProps {
  filters: FilterOption[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
}

export function TableFilters({
  filters,
  selectedFilters,
  onFilterChange,
}: TableFiltersProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* <div className="flex items-center text-sm text-gray-600">
        <Filter className="h-4 w-4 mr-1" />
        Filter:
      </div> */}
      {filters.map((filter) => (
        <DropdownMenu key={filter.id}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full bg-primary/10 text-sm font-normal"
            >
              {filter.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] bg-white border shadow-lg">
            <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filter.values.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={
                  selectedFilters[filter.id]?.includes(option.value) || false
                }
                onCheckedChange={(checked) => {
                  const currentValues = selectedFilters[filter.id] || [];
                  const newValues = checked
                    ? [...currentValues, option.value]
                    : currentValues.filter((v) => v !== option.value);
                  onFilterChange(filter.id, newValues);
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
