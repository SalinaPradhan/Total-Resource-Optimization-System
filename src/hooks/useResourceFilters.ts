import { useState, useMemo } from "react";

interface UseResourceFiltersOptions<T> {
  data: T[] | undefined;
  searchFields: (keyof T)[];
  statusField?: keyof T;
  typeField?: keyof T;
}

export function useResourceFilters<T>({
  data,
  searchFields,
  statusField,
  typeField,
}: UseResourceFiltersOptions<T>) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (Array.isArray(value)) {
            return value.some(
              (v) => typeof v === "string" && v.toLowerCase().includes(searchLower)
            );
          }
          return false;
        });
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && statusField) {
        if (item[statusField] !== statusFilter) return false;
      }

      // Type filter
      if (typeFilter !== "all" && typeField) {
        if (item[typeField] !== typeFilter) return false;
      }

      return true;
    });
  }, [data, search, searchFields, statusField, statusFilter, typeField, typeFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredData,
  };
}
