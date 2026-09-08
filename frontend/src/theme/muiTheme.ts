import { createTheme } from "@mui/material/styles";

export const luxuryMuiTheme = createTheme({
  palette: {
    primary: {
      main: "#B8935C", // Gold
      light: "#D4AF7A",
      dark: "#96733E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2E2420", // Dark charcoal/brown
      light: "#4A3B35",
      dark: "#1A1412",
      contrastText: "#F9F6F1",
    },
    background: {
      default: "#F9F6F1",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2E2420",
      secondary: "#8B7F76",
    },
    divider: "rgba(46, 36, 32, 0.1)",
  },
  typography: {
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 300,
    },
    h2: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 300,
    },
    h3: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 400,
    },
    h4: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 400,
    },
    h5: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 600,
    },
    button: {
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      fontWeight: 500,
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(184, 147, 92, 0.25)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFFFFF",
            borderRadius: 6,
            "& fieldset": {
              borderColor: "rgba(46, 36, 32, 0.15)",
            },
            "&:hover fieldset": {
              borderColor: "#B8935C",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#B8935C",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(46, 36, 32, 0.08)",
          boxShadow: "0 10px 35px rgba(46, 36, 32, 0.04)",
        },
      },
    },
  },
});
