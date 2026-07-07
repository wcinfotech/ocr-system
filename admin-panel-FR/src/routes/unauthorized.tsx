import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Box, Button, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/LockOutlined";
import { AdminProviders } from "@/components/layout/AdminProviders";

export const Route = createFileRoute("/unauthorized")({
  ssr: false,
  head: () => ({ meta: [{ title: "Unauthorized — Admin Panel" }] }),
  component: () => (
    <AdminProviders>
      <UnauthorizedPage />
    </AdminProviders>
  ),
});

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 3 }}>
      <Box sx={{ textAlign: "center", maxWidth: 420 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <LockIcon fontSize="large" />
        </Box>
        <Typography variant="h2" gutterBottom>
          Access denied
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </Typography>
        <Button variant="contained" onClick={() => navigate({ to: "/dashboard" })}>
          Back to dashboard
        </Button>
      </Box>
    </Box>
  );
}
