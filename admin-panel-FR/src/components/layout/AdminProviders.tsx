import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import { theme, colors } from "@/theme/theme";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Wraps the admin surface with MUI theme, baseline CSS, auth context and the
 * toast portal. Kept client-only (routes using it set ssr:false) so Emotion and
 * localStorage-based auth run in the browser without SSR hydration mismatch.
 */
export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: colors.success, secondary: "#fff" } },
            error: { iconTheme: { primary: colors.danger, secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
