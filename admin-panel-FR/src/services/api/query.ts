import type { ListParams } from "@/types";

/** Convert ListParams into a flat query object for Axios. */
export const toQuery = (params: ListParams): Record<string, string | number> => {
  const q: Record<string, string | number> = {
    page: params.page,
    pageSize: params.pageSize,
  };
  if (params.search) q.search = params.search;
  if (params.sortBy) q.sortBy = params.sortBy;
  if (params.sortDir) q.sortDir = params.sortDir;
  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== "" && v !== "all") q[k] = String(v);
    }
  }
  return q;
};
