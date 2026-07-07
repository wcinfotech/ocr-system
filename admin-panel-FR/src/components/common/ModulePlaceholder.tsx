import { Box } from "@mui/material";
import type { ComponentType } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/States";

/**
 * Scaffold for modules whose backend endpoints are not yet wired. The full UI
 * shell, routing and permission gating are in place — connect the service layer
 * (src/services + src/hooks/queries) to activate.
 * TODO(backend): replace with the module's data-driven UI once the API is live.
 */
export function ModulePlaceholder({
  title,
  subtitle,
  icon,
  note,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  note?: string;
}) {
  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} />
      <Box sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 3 }}>
        <EmptyState
          icon={icon}
          title={`${title} is ready to connect`}
          description={
            note ??
            "The interface, routing and permissions are in place. Wire the service layer to your backend endpoint to activate this module."
          }
        />
      </Box>
    </Box>
  );
}
