import { apiClient } from "@/services/api/client";

export interface TestimonialItem {
  _id?: string;
  quote: string;
  author: string;
  role: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const testimonialService = {
  list: async (): Promise<TestimonialItem[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: TestimonialItem[] }>("/testimonials/admin/all");
    return data.data;
  },
  create: async (payload: TestimonialItem): Promise<TestimonialItem> => {
    const { data } = await apiClient.post<{ success: boolean; data: TestimonialItem }>("/testimonials/admin/create", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<TestimonialItem>): Promise<TestimonialItem> => {
    const { data } = await apiClient.put<{ success: boolean; data: TestimonialItem }>(`/testimonials/admin/update/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/testimonials/admin/delete/${id}`);
  },
};
