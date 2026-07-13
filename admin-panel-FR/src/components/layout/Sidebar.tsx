import { Box, Typography, Divider, Tooltip } from "@mui/material";
import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/constants/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { env } from "@/config/env";
import { colors } from "@/theme/theme";

export const SIDEBAR_WIDTH = 264;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = usePermissions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const visible = NAV_ITEMS.filter((item) => can(item.permission));

  // Preserve declared section order while grouping.
  const sections = visible.reduce<{ name: string; items: typeof visible }[]>((acc, item) => {
    const name = item.section ?? "General";
    let group = acc.find((g) => g.name === name);
    if (!group) {
      group = { name, items: [] };
      acc.push(group);
    }
    group.items.push(item);
    return acc;
  }, []);

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <img src="/logo.png" alt="Escannora Logo" style={{ height: 48, objectFit: "contain" }} />
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {sections.map((section) => (
          <Box key={section.name} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: "0.68rem",
              }}
            >
              {section.name}
            </Typography>
            <Box sx={{ mt: 0.75, display: "flex", flexDirection: "column", gap: 0.25 }}>
              {section.items.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Tooltip key={item.to} title="" disableHoverListener>
                    <Box
                      component={Link}
                      // dynamic route path from config
                      to={item.to as string}
                      onClick={onNavigate}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        textDecoration: "none",
                        color: active ? "primary.main" : "text.secondary",
                        bgcolor: active ? "primary.light" : "transparent",
                        fontWeight: active ? 700 : 500,
                        fontSize: "0.9rem",
                        transition: "background-color .15s ease, color .15s ease",
                        "&:hover": { bgcolor: active ? "primary.light" : "action.hover", color: active ? "primary.main" : "text.primary" },
                      }}
                    >
                      <Icon fontSize="small" />
                      <span>{item.label}</span>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
