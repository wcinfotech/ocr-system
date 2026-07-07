import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgentOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useRoles } from "@/hooks/queries/useAdmins";

export const Route = createFileRoute("/_admin/roles")({
  head: () => ({ meta: [{ title: "Roles — Admin Panel" }] }),
  component: RolesPage,
});

function RolesPage() {
  const { data: roles = [], isLoading, isError, refetch } = useRoles();

  const getRoleIcon = (name: string) => {
    switch (name) {
      case "SUPER_ADMIN":
        return <ShieldIcon color="error" sx={{ fontSize: 32 }} />;
      case "ADMIN":
        return <SecurityIcon color="primary" sx={{ fontSize: 32 }} />;
      case "MANAGER":
        return <VerifiedUserIcon color="warning" sx={{ fontSize: 32 }} />;
      case "SUPPORT":
        return <SupportAgentIcon color="success" sx={{ fontSize: 32 }} />;
      case "ACCOUNTANT":
        return <AccountBalanceIcon color="secondary" sx={{ fontSize: 32 }} />;
      default:
        return <VisibilityIcon color="disabled" sx={{ fontSize: 32 }} />;
    }
  };

  const getRoleDescription = (name: string) => {
    switch (name) {
      case "SUPER_ADMIN":
        return "Absolute system owner. Has access to all system APIs, audit logs, and developer options.";
      case "ADMIN":
        return "Standard administrator credentials. Manages users, plans, support tickets, and system settings.";
      case "MANAGER":
        return "Managerial credentials. Handles operations, views analytics, and oversees active client subscriptions.";
      case "SUPPORT":
        return "Support staff credentials. Dedicated to replying to customer tickets and checking invoice states.";
      case "ACCOUNTANT":
        return "Financial credentials. Reviews client payments, issues refunds, and tracks monthly billing invoices.";
      case "VIEWER":
        return "Read-only auditor credentials. Allowed to view user directories, logs, and dashboard metrics.";
      default:
        return "Custom system role defined in application settings.";
    }
  };

  return (
    <Box>
      <PageHeader
        title="Access Control Roles"
        subtitle="View administrative roles, their permission templates, and operational scopes."
      />

      {isLoading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <Typography color="text.secondary">Loading roles catalog...</Typography>
        </Box>
      ) : isError ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography color="error" sx={{ mb: 2 }}>
            Failed to retrieve roles catalog.
          </Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Retry
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.name}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "col",
                  borderRadius: 3.5,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "grey.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getRoleIcon(role.name)}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {role.name}
                      </Typography>
                      <Chip
                        label={role.name === "SUPER_ADMIN" ? "Unlimited access" : `${role.permissions.length} default rules`}
                        size="small"
                        color={role.name === "SUPER_ADMIN" ? "error" : "primary"}
                        variant={role.name === "SUPER_ADMIN" ? "filled" : "outlined"}
                        sx={{ fontWeight: 700, mt: 0.5, borderRadius: 1.5, fontSize: "0.65rem" }}
                      />
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40, lineHeight: 1.5 }}>
                    {getRoleDescription(role.name)}
                  </Typography>

                  <Divider />

                  <Box sx={{ mt: 2.5, flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 1, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                      Permission Template Rules
                    </Typography>
                    {role.permissions.includes("*") ? (
                      <Typography variant="body2" color="error.main" sx={{ fontWeight: 650, display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon color="error" fontSize="inherit" /> Wildcard permission override (*)
                      </Typography>
                    ) : (
                      <List dense disablePadding sx={{ maxHeight: 200, overflowY: "auto" }}>
                        {role.permissions.map((perm) => (
                          <ListItem key={perm} disableGutters sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckCircleIcon color="primary" sx={{ fontSize: 14 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={perm}
                              primaryTypographyProps={{
                                variant: "caption",
                                sx: { fontFamily: "monospace", color: "text.primary", fontWeight: 550 },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
