import { TextField, InputAdornment, Chip, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/** Debounced search input to avoid firing a request on every keystroke. */
export function SearchInput({ value, onChange, placeholder = "Search…", debounceMs = 350 }: SearchInputProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <TextField
      size="small"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: { xs: "100%", sm: 260 } }}
    />
  );
}

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: 150 }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

const STATUS_COLOR: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
  active: "success",
  processed: "success",
  inactive: "default",
  pending: "warning",
  processing: "warning",
  suspended: "error",
  failed: "error",
  expired: "error",
  canceled: "default",
  deleted: "error",
  archived: "default",
  open: "warning",
  closed: "success",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLOR[status] ?? "default"}
      variant={STATUS_COLOR[status] === "default" || !STATUS_COLOR[status] ? "outlined" : "filled"}
      sx={{ "& .MuiChip-label": { px: 1.25 } }}
    />
  );
}
