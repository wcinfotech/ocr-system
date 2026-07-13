import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from "@/hooks/queries/useTestimonials";
import { type TestimonialItem } from "@/services/testimonial.service";

export const Route = createFileRoute("/_admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials Management — Admin Panel" }] }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { data: testimonials, isLoading, isError } = useTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  // Form State
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(true);

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setAuthor("");
    setRole("");
    setQuote("");
    setOrder(testimonials ? testimonials.length : 0);
    setIsPublished(true);
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingTestimonial(item);
    setAuthor(item.author);
    setRole(item.role);
    setQuote(item.quote);
    setOrder(item.order ?? 0);
    setIsPublished(item.isPublished ?? true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TestimonialItem = {
      author,
      role,
      quote,
      order: Number(order),
      isPublished,
    };

    if (editingTestimonial?._id) {
      updateMutation.mutate(
        { id: editingTestimonial._id, payload },
        {
          onSuccess: () => setOpenDialog(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setOpenDialog(false),
      });
    }
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
        <Alert severity="error">Failed to load testimonials. Check your server connection.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader
          title="Testimonials & Reviews"
          subtitle="Manage the customer testimonials displayed on the marketing landing pages."
          icon={RateReviewIcon}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: "#7c4dff",
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            px: 3,
            "&:hover": { bgcolor: "#651fff" },
          }}
        >
          Add Testimonial
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: "20%" }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 700, width: "20%" }}>Role / Designation</TableCell>
              <TableCell sx={{ fontWeight: 700, width: "40%" }}>Quote</TableCell>
              <TableCell sx={{ fontWeight: 700, width: "8%" }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 700, width: "12%" }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testimonials && testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No testimonials found. Click "Add Testimonial" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              testimonials?.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{item.author}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      "{item.quote}"
                    </Typography>
                  </TableCell>
                  <TableCell>{item.order ?? 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.isPublished ? "Visible" : "Hidden"}
                      color={item.isPublished ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton color="primary" onClick={() => handleOpenEdit(item)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item._id!)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Testimonial Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Author Name"
                  fullWidth
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Rajesh K."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role / Company"
                  fullWidth
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Operations Director, Fashion Hub"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Order Index"
                  type="number"
                  fullWidth
                  required
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  helperText="Lower numbers will appear first in the scrolling feed."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Quote / Review Content"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Write the customer's review here..."
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Publish testimonial
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Make this review instantly visible on the public website slider.
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              bgcolor: "#7c4dff",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: "#651fff" },
            }}
          >
            {editingTestimonial ? "Save Changes" : "Create Testimonial"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
