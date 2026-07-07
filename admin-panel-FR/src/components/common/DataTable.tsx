import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  Box,
  Skeleton,
} from "@mui/material";
import type { ReactNode } from "react";
import { EmptyState, ErrorState } from "@/components/common/States";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  total: number;
  page: number; // zero-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string, dir: "asc" | "desc") => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDir,
  onSortChange,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  selectable,
  selected = [],
  onSelectedChange,
  toolbar,
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () =>
    onSelectedChange?.(allSelected ? [] : rows.map(rowKey));
  const toggleOne = (id: string) =>
    onSelectedChange?.(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    const nextDir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    onSortChange(key, nextDir);
  };

  return (
    <Card>
      {toolbar && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>{toolbar}</Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  sx={{ width: col.width, whiteSpace: "nowrap" }}
                >
                  {col.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rounded" width={18} height={18} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton width="70%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading &&
              rows.map((row) => {
                const id = rowKey(row);
                return (
                  <TableRow key={id} hover selected={selected.includes(id)}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(id)} onChange={() => toggleOne(id)} />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align}>
                        {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && error && (
        <ErrorState onRetry={onRetry} />
      )}
      {!loading && !error && rows.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  );
}
