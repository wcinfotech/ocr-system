import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testimonialService, type TestimonialItem } from "@/services/testimonial.service";
import toast from "react-hot-toast";

export const useTestimonials = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: () => testimonialService.list(),
  });

export const useCreateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testimonial: TestimonialItem) => testimonialService.create(testimonial),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create testimonial");
    },
  });
};

export const useUpdateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TestimonialItem> }) =>
      testimonialService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update testimonial");
    },
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testimonialService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete testimonial");
    },
  });
};
