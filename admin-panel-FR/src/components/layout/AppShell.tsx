import { Box, Drawer } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Sidebar, SIDEBAR_WIDTH } from "@/components/layout/Sidebar";
import { Navbar, NAVBAR_HEIGHT } from "@/components/layout/Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* Desktop sticky sidebar */}
      <Box sx={{ display: { xs: "none", lg: "block" }, height: "100%", position: "sticky", top: 0 }}>
        <Sidebar />
      </Box>

      {/* Mobile drawer sidebar */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { lg: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: "none" } }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Main column */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ position: "sticky", top: 0, zIndex: 10 }}>
          <Navbar onMenuClick={() => setMobileOpen(true)} />
        </Box>
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 3, lg: 4 },
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
