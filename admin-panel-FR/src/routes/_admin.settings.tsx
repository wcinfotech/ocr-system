import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useSettings, useUpdateSettings } from "@/hooks/queries/useLogs";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({ meta: [{ title: "System Settings — Admin Panel" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settings, isLoading, isError } = useSettings();
  const updateSettings = useUpdateSettings();

  // Local state for the settings form
  const [supportEmail, setSupportEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [maxStorageLimitMb, setMaxStorageLimitMb] = useState(10240);
  const [ocrRetryLimit, setOcrRetryLimit] = useState(3);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activityLogRetention, setActivityLogRetention] = useState(false);
  const [activityLogSavePayload, setActivityLogSavePayload] = useState(false);

  // Sync state when DB loads
  useEffect(() => {
    if (settings) {
      setSupportEmail(settings.supportEmail || "");
      setContactPhone(settings.contactPhone || "");
      setContactAddress(settings.contactAddress || "");
      setMaxStorageLimitMb(settings.maxStorageLimitMb ?? 10240);
      setOcrRetryLimit(settings.ocrRetryLimit ?? 3);
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setEmailNotifications(settings.emailNotifications ?? true);
      setActivityLogRetention(settings.activityLogRetention ?? false);
      setActivityLogSavePayload(settings.activityLogSavePayload ?? false);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    updateSettings.mutate({
      ...settings,
      supportEmail,
      contactPhone,
      contactAddress,
      maxStorageLimitMb: Number(maxStorageLimitMb),
      ocrRetryLimit: Number(ocrRetryLimit),
      maintenanceMode,
      emailNotifications,
      activityLogRetention,
      activityLogSavePayload,
      allowedUploadTypes: settings.allowedUploadTypes || ["pdf", "jpg", "jpeg", "png", "webp"],
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load system settings. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <PageHeader
        title="System Settings"
        subtitle="Manage company contact details, SMTP logs, OCR parameters, and system maintenance."
        icon={SettingsIcon}
      />

      <Box component="form" onSubmit={handleSave} sx={{ mt: 3, maxWidth: 960 }}>
        <Grid container spacing={3.5}>
          {/* Section 1: Contact Details */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Contact & Support Details
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                These contact details are fed directly into the public website Contact Us page.
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Support Email Address"
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
                <TextField
                  label="Contact Phone Number"
                  variant="outlined"
                  fullWidth
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <TextField
                  label="Corporate HQ Address"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Section 2: OCR & Processing Configuration */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                OCR & File Quotas
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                Manage maximum server file retention storage quotas and OCR queue retry parameters.
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Max Storage Limit (MB)"
                  variant="outlined"
                  type="number"
                  fullWidth
                  required
                  value={maxStorageLimitMb}
                  onChange={(e) => setMaxStorageLimitMb(Number(e.target.value))}
                />
                <TextField
                  label="OCR Retry Rate Limit"
                  variant="outlined"
                  type="number"
                  fullWidth
                  required
                  value={ocrRetryLimit}
                  onChange={(e) => setOcrRetryLimit(Number(e.target.value))}
                />
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Allowed Upload Format Enforcements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently active formats: {settings?.allowedUploadTypes?.join(", ") || "pdf, jpg, jpeg, png, webp"}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Section 3: System Logging, Notifications & Maintenance */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                System Administration & Logging
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                Configure global notification toggles, debug logging parameters, and server maintenance states.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2.5}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Global Email Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Trigger automatic SMTP invoices, account changes, and system alert updates.
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={activityLogRetention}
                          onChange={(e) => setActivityLogRetention(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            7-Day Log Auto-Retention
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Automatically purge system log histories older than 7 days from databases.
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={2.5}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={activityLogSavePayload}
                          onChange={(e) => setActivityLogSavePayload(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Capture Request/Response Payloads
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Log raw HTTP response JSON objects to debug transaction payloads.
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          color="error"
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: maintenanceMode ? "error.main" : "text.primary" }}>
                            Maintenance Mode
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Instantly restrict access to standard client workspace pages with a warning.
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Submit Actions */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={updateSettings.isPending}
            startIcon={updateSettings.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              bgcolor: "#7c4dff",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 4,
              py: 1.25,
              borderRadius: 2.5,
              "&:hover": { bgcolor: "#651fff" },
            }}
          >
            {updateSettings.isPending ? "Saving Settings..." : "Save Configuration"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
