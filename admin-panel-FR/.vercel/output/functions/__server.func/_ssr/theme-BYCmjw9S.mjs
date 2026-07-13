import { Tt as createTheme } from "../_libs/@mui/icons-material+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-BYCmjw9S.js
/**
* Single source of truth for the design system.
* Light theme only — no dark mode, no theme switch.
*/
var colors = {
	primary: "#2563EB",
	primaryHover: "#1D4ED8",
	primaryLight: "#DBEAFE",
	background: "#F8FAFC",
	surface: "#FFFFFF",
	border: "#E5E7EB",
	textPrimary: "#111827",
	textSecondary: "#6B7280",
	success: "#22C55E",
	danger: "#EF4444",
	warning: "#F59E0B",
	info: "#0EA5E9"
};
var theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: colors.primary,
			dark: colors.primaryHover,
			light: colors.primaryLight
		},
		success: { main: colors.success },
		error: { main: colors.danger },
		warning: { main: colors.warning },
		info: { main: colors.info },
		background: {
			default: colors.background,
			paper: colors.surface
		},
		text: {
			primary: colors.textPrimary,
			secondary: colors.textSecondary
		},
		divider: colors.border
	},
	shape: { borderRadius: 12 },
	typography: {
		fontFamily: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
		h1: {
			fontWeight: 700,
			fontSize: "1.75rem",
			letterSpacing: "-0.02em"
		},
		h2: {
			fontWeight: 700,
			fontSize: "1.5rem",
			letterSpacing: "-0.02em"
		},
		h3: {
			fontWeight: 600,
			fontSize: "1.25rem",
			letterSpacing: "-0.01em"
		},
		h4: {
			fontWeight: 600,
			fontSize: "1.125rem"
		},
		h5: {
			fontWeight: 600,
			fontSize: "1rem"
		},
		h6: {
			fontWeight: 600,
			fontSize: "0.9375rem"
		},
		subtitle2: { fontWeight: 600 },
		button: {
			textTransform: "none",
			fontWeight: 600
		}
	},
	components: {
		MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
		MuiCard: {
			defaultProps: { elevation: 0 },
			styleOverrides: { root: {
				borderRadius: 12,
				border: `1px solid ${colors.border}`,
				boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.04)"
			} }
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: { root: {
				borderRadius: 10,
				paddingInline: 16,
				paddingBlock: 8
			} }
		},
		MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
		MuiChip: { styleOverrides: { root: {
			borderRadius: 8,
			fontWeight: 600
		} } },
		MuiTableCell: { styleOverrides: { head: {
			fontWeight: 600,
			color: colors.textSecondary,
			backgroundColor: "#FAFBFC"
		} } },
		MuiTooltip: { styleOverrides: { tooltip: {
			borderRadius: 8,
			fontSize: "0.75rem"
		} } }
	}
});
//#endregion
export { theme as n, colors as t };
