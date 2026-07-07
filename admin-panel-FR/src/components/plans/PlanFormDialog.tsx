import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import type { Plan } from "@/types";
import type { PlanPayload } from "@/services/catalog.service";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1),
  ocrLimit: z.coerce.number().int().min(0),
  storageMb: z.coerce.number().int().min(0),
  durationDays: z.coerce.number().int().min(1, "At least 1 day"),
  status: z.enum(["active", "archived"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  plan: Plan | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: PlanPayload) => void;
}

export function PlanFormDialog({ open, plan, loading, onClose, onSubmit }: Props) {
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: 0,
      currency: "USD",
      ocrLimit: 100,
      storageMb: 1024,
      durationDays: 30,
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: plan?.name ?? "",
        price: plan?.price ?? 0,
        currency: plan?.currency ?? "USD",
        ocrLimit: plan?.ocrLimit ?? 100,
        storageMb: plan?.storageMb ?? 1024,
        durationDays: plan?.durationDays ?? 30,
        status: plan?.status ?? "active",
      });
      setBenefits(plan?.benefits ?? []);
      setBenefitInput("");
    }
  }, [open, plan, reset]);

  const addBenefit = () => {
    const v = benefitInput.trim();
    if (v && !benefits.includes(v)) setBenefits((b) => [...b, v]);
    setBenefitInput("");
  };

  const submit = (values: FormValues) => onSubmit({ ...values, benefits });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{plan ? "Edit plan" : "Create plan"}</DialogTitle>
      <DialogContent>
        <Box component="form" id="plan-form" onSubmit={handleSubmit(submit)} sx={{ display: "grid", gap: 2, pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Plan name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label="Price" error={!!errors.price} helperText={errors.price?.message} />
              )}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Currency">
                  {["USD", "EUR", "GBP", "INR"].map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <Controller
              name="ocrLimit"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label="OCR limit" error={!!errors.ocrLimit} />}
            />
            <Controller
              name="storageMb"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Storage"
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">MB</InputAdornment> } }}
                />
              )}
            />
            <Controller
              name="durationDays"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label="Duration" error={!!errors.durationDays}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">days</InputAdornment> } }} />
              )}
            />
          </Box>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            )}
          />

          <TextField
            label="Add benefit"
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBenefit();
              }
            }}
            helperText="Press Enter to add"
          />
          {benefits.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {benefits.map((b) => (
                <Chip key={b} label={b} onDelete={() => setBenefits((prev) => prev.filter((x) => x !== b))} />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="plan-form" variant="contained" disabled={loading}>
          {plan ? "Save changes" : "Create plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
