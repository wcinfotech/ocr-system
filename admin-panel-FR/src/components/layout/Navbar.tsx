import {
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { initialsOf } from "@/utils/format";

export const NAVBAR_HEIGHT = 64;

function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((p) => p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        Admin
      </Typography>
      {crumbs.map((c, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            /
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: i === crumbs.length - 1 ? 700 : 500, color: i === crumbs.length - 1 ? "text.primary" : "text.secondary" }}
          >
            {c}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    setAnchor(null);
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <Box
      component="header"
      sx={{
        height: NAVBAR_HEIGHT,
        px: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <IconButton onClick={onMenuClick} sx={{ display: { lg: "none" } }} aria-label="Open menu">
        <MenuIcon />
      </IconButton>

      <Box sx={{ display: { xs: "none", md: "block" }, flex: "0 1 auto", minWidth: 0 }}>
        <Breadcrumbs />
      </Box>

      <Box sx={{ flex: 1 }} />

      <TextField
        size="small"
        placeholder="Search…"
        sx={{ display: { xs: "none", sm: "block" }, width: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <IconButton aria-label="Notifications">
        <Badge color="error" variant="dot">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }} aria-label="Account">
        <Avatar src={user?.avatarUrl} sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.85rem" }}>
          {initialsOf(user?.name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2.5, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate({ to: "/profile" });
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
