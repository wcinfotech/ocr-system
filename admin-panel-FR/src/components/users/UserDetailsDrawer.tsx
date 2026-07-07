import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { StatusChip } from "@/components/common/Filters";
import { initialsOf, formatBytesMb, formatDate, formatNumber } from "@/utils/format";
import type { User } from "@/types";

interface Props {
  user: User | null;
  open: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
}

export function UserDetailsDrawer({ user, open, onClose, actions }: Props) {
  const storagePct =
    user?.storageUsedMb && user?.storageLimitMb
      ? Math.min(100, (user.storageUsedMb / user.storageLimitMb) * 100)
      : 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 }, p: 3 } } }}
    >
      {user && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4">User details</Typography>
            <IconButton onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{initialsOf(user.name)}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" noWrap>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>

          {actions && (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                {actions}
              </Stack>
              <Divider sx={{ mb: 1 }} />
            </>
          )}

          <Typography variant="overline" color="text.secondary">
            Account
          </Typography>
          <Row label="Status" value={<StatusChip status={user.status} />} />
          <Row label="Joined" value={formatDate(user.createdAt)} />
          <Divider sx={{ my: 1 }} />

          <Typography variant="overline" color="text.secondary">
            Subscription
          </Typography>
          <Row label="Plan" value={user.planName ? <Chip size="small" label={user.planName} /> : "—"} />
          <Divider sx={{ my: 1 }} />

          <Typography variant="overline" color="text.secondary">
            Usage
          </Typography>
          <Row label="Bills uploaded" value={formatNumber(user.billsCount ?? 0)} />
          <Box sx={{ py: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Storage
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatBytesMb(user.storageUsedMb)} / {formatBytesMb(user.storageLimitMb)}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={storagePct} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
