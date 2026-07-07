import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/VisibilityOutlined";
import VisibilityOff from "@mui/icons-material/VisibilityOffOutlined";
import { motion } from "framer-motion";
import { AdminProviders } from "@/components/layout/AdminProviders";
import { useAuth } from "@/contexts/AuthContext";
import { isApiError } from "@/services/api/client";
import { colors } from "@/theme/theme";
import { env } from "@/config/env";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: () => (
    <AdminProviders>
      <LoginPage />
    </AdminProviders>
  ),
});

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Unable to sign in");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: `radial-gradient(1200px 600px at 100% 0%, ${colors.primaryLight}55, transparent), ${colors.background}`,
      }}
    >
      <Card
        component={motion.form}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: { xs: 3, sm: 5 }, width: "100%", maxWidth: 420 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
            }}
          >
            A
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {env.APP_NAME}
          </Typography>
        </Box>

        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your admin account to continue.
        </Typography>

        <TextField
          fullWidth
          label="Email"
          placeholder="you@company.com"
          margin="normal"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register("password")}
        />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1, mb: 2 }}>
          <FormControlLabel
            control={<Checkbox defaultChecked {...register("remember")} />}
            label={<Typography variant="body2">Remember me</Typography>}
          />
          <MuiLink component="button" type="button" variant="body2" underline="hover">
            Forgot password?
          </MuiLink>
        </Box>

        <Button
          type="submit"
          fullWidth
          size="large"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        {env.ENABLE_DEV_AUTH && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
            Dev mode: sign in with any credentials until the backend is connected.
          </Typography>
        )}
      </Card>
    </Box>
  );
}
