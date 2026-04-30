import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface ResourceTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function ResourceTable<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick 
}: ResourceTableProps<T>) {
  return (
    <div className="glass-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            {columns.map(col => (
              <TableHead key={col.key} className={cn("text-xs font-semibold", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                "hover:bg-secondary/30",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {columns.map(col => (
                <TableCell key={col.key} className={col.className}>
                  {col.render 
                    ? col.render(item) 
                    : (item as any)[col.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
