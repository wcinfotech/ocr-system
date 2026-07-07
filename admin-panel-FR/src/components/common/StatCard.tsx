import { Box, Typography, Card, Skeleton, alpha } from "@mui/material";
import { motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  color?: string;
  hint?: string;
  loading?: boolean;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, color = "#2563EB", hint, loading, index = 0 }: StatCardProps) {
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      sx={{ p: 2.5, height: "100%" }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={90} height={40} />
          ) : (
            <Typography variant="h2" sx={{ mt: 0.5, fontSize: "1.6rem" }}>
              {value}
            </Typography>
          )}
          {hint && !loading && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: alpha(color, 0.12),
          }}
        >
          <Icon />
        </Box>
      </Box>
    </Card>
  );
}
