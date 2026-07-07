import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  Chip,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/SendOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAllOutlined";
import { StatusChip } from "@/components/common/Filters";
import { formatDate } from "@/utils/format";
import type { Ticket } from "@/types";
import { useReplyTicket } from "@/hooks/queries/useTickets";

interface Props {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
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

export function TicketDetailsDrawer({ ticket, open, onClose }: Props) {
  const [replyText, setReplyText] = useState("");
  const replyMutation = useReplyTicket();

  const handleReplySubmit = (close: boolean) => {
    if (!ticket || !replyText.trim()) return;

    replyMutation.mutate(
      {
        id: ticket.id,
        payload: {
          reply: replyText,
          close,
        },
      },
      {
        onSuccess: () => {
          setReplyText("");
          onClose();
        },
      }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 460 }, p: 3 } } }}
    >
      {ticket && (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                Ticket Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {ticket.ticketId}
              </Typography>
            </Box>
            <IconButton onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
            {/* Meta Rows */}
            <Typography variant="overline" color="text.secondary">
              Status & Priority
            </Typography>
            <Row label="Status" value={<StatusChip status={ticket.status} />} />
            <Row
              label="Priority"
              value={
                <Chip
                  size="small"
                  color={getPriorityColor(ticket.priority)}
                  label={ticket.priority.toUpperCase()}
                  variant="outlined"
                />
              }
            />
            <Row label="Category" value={ticket.category || "General"} />
            <Row label="Created At" value={formatDate(ticket.createdAt)} />
            
            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary">
              User Information
            </Typography>
            <Row label="User Name" value={ticket.userName} />
            <Row label="User Email" value={ticket.userEmail} />

            <Divider sx={{ my: 2 }} />

            {/* Subject and Message */}
            <Typography variant="overline" color="text.secondary">
              Inquiry Subject
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>
              {ticket.subject}
            </Typography>

            <Typography variant="overline" color="text.secondary">
              Original Message
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                mb: 3,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {ticket.message}
              </Typography>
            </Box>
          </Box>

          {/* Footer - Response / Reply */}
          {ticket.status === "open" && (
            <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Response Reply
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your official reply to the customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ mb: 2 }}
                disabled={replyMutation.isPending}
              />
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={() => handleReplySubmit(false)}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  Send Reply
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  endIcon={<DoneAllIcon />}
                  onClick={() => handleReplySubmit(true)}
                  disabled={!replyText.trim() || replyMutation.isPending}
                >
                  Reply & Close
                </Button>
              </Stack>
            </Box>
          )}

          {ticket.status === "closed" && (
            <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                <DoneAllIcon fontSize="small" /> This ticket is marked as resolved and closed.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
}
