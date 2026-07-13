import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService, type BlogPost } from "@/services/blog.service";
import toast from "react-hot-toast";

export const useBlogs = () =>
  useQuery({
    queryKey: ["blogs"],
    queryFn: () => blogService.list(),
  });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blog: BlogPost) => blogService.create(blog),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create blog post");
    },
  });
};

export const useUpdateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlogPost> }) =>
      blogService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update blog post");
    },
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete blog post");
    },
  });
};
