import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import PreviewIcon from "@mui/icons-material/PreviewOutlined";
import CodeIcon from "@mui/icons-material/CodeOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import EditNoteIcon from "@mui/icons-material/EditNoteOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/queries/useBlogs";
import { blogService, type BlogPost } from "@/services/blog.service";
import { env } from "@/config/env";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_admin/blogs")({
  head: () => ({ meta: [{ title: "Blog Management — Admin Panel" }] }),
  component: BlogsPage,
});

function BlogsPage() {
  const { data: blogs, isLoading, isError } = useBlogs();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [author, setAuthor] = useState("Escannora Team");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);

  // Editor Tab: 0 = Visual Editor, 1 = Write HTML, 2 = Live Preview
  const [editorTab, setEditorTab] = useState(0);
  const [CKEditorComponent, setCKEditorComponent] = useState<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Promise.all([
        import("@ckeditor/ckeditor5-react").then((m) => m.CKEditor),
        import("@ckeditor/ckeditor5-build-classic"),
      ])
        .then(([CKEditor, ClassicEditor]) => {
          setCKEditorComponent(() => ({
            CKEditor,
            ClassicEditor: ClassicEditor.default || ClassicEditor,
          }));
          setEditorLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load CKEditor", err);
        });
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("General");
    setAuthor("Escannora Team");
    setFeaturedImage("");
    setIsPublished(true);
    setEditorTab(0);
    setImageUploading(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCategory(blog.category);
    setAuthor(blog.author || "Escannora Team");
    setFeaturedImage(blog.featuredImage || "");
    setIsPublished(blog.isPublished);
    setEditorTab(0);
    setImageUploading(false);
    setOpenDialog(true);
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setImageUploading(true);
    try {
      const result = await blogService.uploadImage(file);
      const fullUrl = `${env.API_BASE_URL}${result.url}`;
      setFeaturedImage(fullUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed.");
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, []);

  const handleImageDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImageDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleImportMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Parsing markdown file...", { id: "md-import" });
      const parsed = await blogService.importMd(file);
      
      if (parsed.title) setTitle(parsed.title);
      if (parsed.excerpt) setExcerpt(parsed.excerpt);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.content) {
        // Convert simple markdown block paragraphs into clean HTML paragraphs
        // to maintain compatibility with standard rich-text rendering
        const formattedHtml = parsed.content
          .split(/\r?\n\r?\n/)
          .map((para) => {
            if (para.startsWith("#")) {
              const depth = (para.match(/^#+/) || ["#"])[0].length;
              const text = para.replace(/^#+\s*/, "");
              return `<h${depth} class="text-xl font-bold mt-4 mb-2">${text}</h${depth}>`;
            }
            return `<p class="mb-3 leading-relaxed">${para}</p>`;
          })
          .join("\n");
        setContent(formattedHtml);
      }
      toast.success("Markdown file imported successfully!", { id: "md-import" });
    } catch (err: any) {
      toast.error(err.message || "Failed to import markdown file", { id: "md-import" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BlogPost = {
      title,
      excerpt,
      content,
      category,
      author,
      featuredImage,
      isPublished,
    };

    if (editingBlog?._id) {
      updateMutation.mutate(
        { id: editingBlog._id, payload },
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
        <Alert severity="error">Failed to load blog posts. Check your server connection.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader
          title="Blog Articles"
          subtitle="Publish customer guides, compliance articles, and log technical feature releases."
          icon={ArticleIcon}
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
          New Article
        </Button>
      </Box>

      {/* Hidden input for markdown imports */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".md"
        style={{ display: "none" }}
        onChange={handleImportMarkdown}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Publish Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs && blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No articles found. Click "New Article" or import a markdown file.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              blogs?.map((blog) => (
                <TableRow key={blog._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {blog.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      /{blog.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={blog.category} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{blog.author || "Escannora Team"}</TableCell>
                  <TableCell>
                    <Chip
                      label={blog.isPublished ? "Published" : "Draft"}
                      color={blog.isPublished ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton color="primary" onClick={() => handleOpenEdit(blog)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(blog._id!)} size="small">
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

      {/* Create / Edit Article Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingBlog ? "Edit Blog Article" : "Create New Article"}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            Import .md File
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Article Title"
                  fullWidth
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Category"
                  fullWidth
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Author Name"
                  fullWidth
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Featured Image Upload Zone */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Featured Image
              </Typography>

              {/* Hidden file input */}
              <input
                type="file"
                ref={imageInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleImageInputChange}
              />

              {featuredImage ? (
                /* ── Image Preview ── */
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    maxHeight: 220,
                  }}
                >
                  <Box
                    component="img"
                    src={featuredImage}
                    alt="Featured"
                    sx={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Overlay actions */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: "rgba(0,0,0,0.35)",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => imageInputRef.current?.click()}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#333",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#fff" },
                      }}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => setFeaturedImage("")}
                      sx={{
                        bgcolor: "rgba(244,67,54,0.85)",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#f44336" },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ) : (
                /* ── Drop Zone ── */
                <Box
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageDragActive(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleImageDrop}
                  onClick={() => !imageUploading && imageInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: imageDragActive ? "primary.main" : "divider",
                    borderRadius: 2.5,
                    py: 4,
                    px: 2,
                    textAlign: "center",
                    cursor: imageUploading ? "default" : "pointer",
                    bgcolor: imageDragActive ? "action.hover" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {imageUploading ? (
                    <Box>
                      <CircularProgress size={32} sx={{ mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Uploading image…
                      </Typography>
                      <LinearProgress sx={{ mt: 1.5, mx: "auto", maxWidth: 200, borderRadius: 1 }} />
                    </Box>
                  ) : (
                    <Box>
                      <ImageIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {imageDragActive ? "Drop image here" : "Click or drag an image to upload"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        JPG, PNG, WebP, or GIF — Max 5 MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <TextField
              label="Short Excerpt / Summary"
              fullWidth
              required
              multiline
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary shown on the blog index cards..."
            />

            {/* Content WYSIWYG Editor with Live Preview */}
            <Box>
              <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Tabs value={editorTab} onChange={(_, val) => setEditorTab(val)}>
                  <Tab icon={<EditNoteIcon fontSize="small" />} iconPosition="start" label="Visual Editor" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab icon={<CodeIcon fontSize="small" />} iconPosition="start" label="Write HTML / Code" sx={{ textTransform: "none", fontWeight: 600 }} />
                  <Tab icon={<PreviewIcon fontSize="small" />} iconPosition="start" label="Live Preview" sx={{ textTransform: "none", fontWeight: 600 }} />
                </Tabs>
                <Typography variant="caption" color="text.secondary">
                  HTML markup is fully supported.
                </Typography>
              </Box>

              {editorTab === 0 ? (
                editorLoaded && CKEditorComponent ? (
                  <Box
                    sx={{
                      "& .ck-editor__editable_inline": {
                        minHeight: 280,
                        maxHeight: 400,
                        fontFamily: "inherit",
                        px: 2,
                        borderRadius: "0 0 10px 10px !important",
                        borderTop: "none !important",
                      },
                      "& .ck-toolbar": {
                        borderRadius: "10px 10px 0 0 !important",
                        borderColor: "divider !important",
                        bgcolor: "action.hover !important",
                      },
                      "& .ck.ck-editor__main>.ck-editor__editable": {
                        borderColor: "divider !important",
                        "&:focus": {
                          borderColor: "primary.main !important",
                          boxShadow: "none !important",
                        }
                      }
                    }}
                  >
                    <CKEditorComponent.CKEditor
                      editor={CKEditorComponent.ClassicEditor}
                      data={content}
                      onChange={(event: any, editor: any) => {
                        const data = editor.getData();
                        setContent(data);
                      }}
                      config={{
                        placeholder: "Write your article body here...",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 280,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CircularProgress size={32} sx={{ mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Loading Visual Editor...
                    </Typography>
                  </Box>
                )
              ) : editorTab === 1 ? (
                <TextField
                  placeholder="<p>Write your article body here. Support for rich tags, images and links...</p>"
                  fullWidth
                  required
                  multiline
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  sx={{
                    fontFamily: "monospace",
                    "& .MuiInputBase-input": {
                      fontFamily: "Consolas, Courier, monospace",
                      fontSize: 13,
                    },
                  }}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3.5,
                    minHeight: 275,
                    maxHeight: 400,
                    overflowY: "auto",
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  {content ? (
                    <div
                      className="blog-preview-content"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8 }}>
                      Nothing to preview yet. Start writing in the editor!
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>

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
                    Publish immediately
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Make this post instantly visible on the public website.
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
            {editingBlog ? "Save Changes" : "Publish Article"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
