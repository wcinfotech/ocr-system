import { Box, Typography, CircularProgress } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Button } from "@mui/material";
import type { ComponentType, ReactNode } from "react";

/** Full-screen / block loading spinner. */
export function Loader({ label = "Loading…", minHeight = 240 }: { label?: string; minHeight?: number }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight, gap: 1.5 }}>
      <CircularProgress size={32} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  action?: ReactNode;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to display.",
  icon: Icon = InboxIcon,
  action,
}: EmptyStateProps) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", textAlign: "center", py: 8, px: 3, gap: 1.5 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.light",
          color: "primary.main",
        }}
      >
        <Icon fontSize="large" />
      </Box>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Failed to load data.", onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", textAlign: "center", py: 8, px: 3, gap: 1.5 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: (t) => t.palette.error.main + "1f",
          color: "error.main",
        }}
      >
        <ErrorOutlineIcon fontSize="large" />
      </Box>
      <Typography variant="h4">Something went wrong</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry} sx={{ mt: 1 }}>
          Try again
        </Button>
      )}
    </Box>
  );
}
