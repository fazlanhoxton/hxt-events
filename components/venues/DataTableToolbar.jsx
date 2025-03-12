"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { Search } from "lucide-react";

export function DataTableToolbar({
  table,
  filterableColumns = [],
  searchableColumns = [],
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 && (
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchableColumns.map(column => column.title).join(", ")}...`}
              value={(table.getColumn(searchableColumns[0]?.id)?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn(searchableColumns[0]?.id)?.setFilterValue(event.target.value)
              }
              className="w-full pl-8"
            />
          </div>
        )}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}