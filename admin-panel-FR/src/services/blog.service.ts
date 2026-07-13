import { apiClient } from "@/services/api/client";

export interface BlogPost {
  _id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  author?: string;
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadedImage {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export const blogService = {
  list: async (): Promise<BlogPost[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: BlogPost[] }>("/blogs/admin/all");
    return data.data;
  },
  create: async (payload: BlogPost): Promise<BlogPost> => {
    const { data } = await apiClient.post<{ success: boolean; data: BlogPost }>("/blogs/admin/create", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<BlogPost>): Promise<BlogPost> => {
    const { data } = await apiClient.put<{ success: boolean; data: BlogPost }>(`/blogs/admin/update/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/blogs/admin/delete/${id}`);
  },
  importMd: async (file: File): Promise<{ title: string; content: string; excerpt: string; category: string }> => {
    const formData = new FormData();
    formData.append("mdFile", file);
    const { data } = await apiClient.post<{
      success: boolean;
      data: { title: string; content: string; excerpt: string; category: string };
    }>("/blogs/admin/import-md", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
  uploadImage: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("featuredImage", file);
    const { data } = await apiClient.post<{ success: boolean; data: UploadedImage }>(
      "/blogs/admin/upload-image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
};
