import { useMemo, useState } from "react";
import type { ListParams } from "@/types";

/**
 * Local state manager for server-driven tables (pagination/search/sort/filters).
 * Resets to page 0 whenever search, sort or filters change.
 */
export function useListParams(initial?: Partial<ListParams>) {
  const [page, setPage] = useState(initial?.page ?? 0);
  const [pageSize, setPageSize] = useState(initial?.pageSize ?? 10);
  const [search, setSearchValue] = useState(initial?.search ?? "");
  const [sortBy, setSortBy] = useState(initial?.sortBy);
  const [sortDir, setSortDir] = useState<ListParams["sortDir"]>(initial?.sortDir);
  const [filters, setFiltersValue] = useState<ListParams["filters"]>(initial?.filters ?? {});

  const setSearch = (v: string) => {
    setSearchValue(v);
    setPage(0);
  };
  const setSort = (key: string, dir: "asc" | "desc") => {
    setSortBy(key);
    setSortDir(dir);
    setPage(0);
  };
  const setFilter = (key: string, value: string) => {
    setFiltersValue((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // API expects 1-based pages; table component is 0-based.
  const params = useMemo<ListParams>(
    () => ({ page: page + 1, pageSize, search, sortBy, sortDir, filters }),
    [page, pageSize, search, sortBy, sortDir, filters],
  );

  return {
    params,
    page,
    pageSize,
    search,
    sortBy,
    sortDir,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilter,
  };
}
