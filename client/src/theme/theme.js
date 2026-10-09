import { createTheme } from "@mui/material/styles";

const gold = "#F4C430";
const goldDark = "#C79A00";
const goldLight = "#FFF7D5";
const black = "#111111";
const muted = "#666666";
const border = "#E8E8E8";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: gold,
      light: "#FFF4BD",
      dark: goldDark,
      contrastText: black,
    },

    secondary: {
      main: black,
      light: "#333333",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },

    text: {
      primary: black,
      secondary: muted,
    },

    divider: border,

    success: {
      main: "#2E7D32",
    },

    error: {
      main: "#D32F2F",
    },

    warning: {
      main: "#ED6C02",
    },

    info: {
      main: "#0288D1",
    },
  },

  typography: {
    fontFamily:
      '"Inter", "Poppins", "Roboto", "Helvetica Neue", Arial, sans-serif',

    h1: {
      fontWeight: 900,
      letterSpacing: "-0.045em",
      lineHeight: 1.08,
    },

    h2: {
      fontWeight: 900,
      letterSpacing: "-0.04em",
      lineHeight: 1.1,
    },

    h3: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    },

    h4: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },

    h5: {
      fontWeight: 800,
      lineHeight: 1.25,
    },

    h6: {
      fontWeight: 800,
      lineHeight: 1.3,
    },

    button: {
      textTransform: "none",
      fontWeight: 800,
    },
  },

  shape: {
    borderRadius: 14,
  },

  transitions: {
    duration: {
      shortest: 120,
      shorter: 160,
      short: 200,
      standard: 260,
      complex: 360,
      enteringScreen: 320,
      leavingScreen: 220,
    },

    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: "#FFFFFF",
          color: black,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },

        "*": {
          boxSizing: "border-box",
        },

        "button, input, textarea, select": {
          fontFamily: "inherit",
        },

        a: {
          color: "inherit",
          textDecoration: "none",
        },

        "::selection": {
          backgroundColor: gold,
          color: black,
        },

        "::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },

        "::-webkit-scrollbar-track": {
          backgroundColor: "#F7F7F7",
        },

        "::-webkit-scrollbar-thumb": {
          backgroundColor: "#D0D0D0",
          borderRadius: "999px",
          transition: "background-color 200ms ease",
        },

        "::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#B5B5B5",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          paddingLeft: 20,
          paddingRight: 20,
          fontWeight: 800,
          transition:
            "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms ease, background-color 180ms ease, border-color 180ms ease",

          "&:active": {
            transform: "scale(0.98)",
          },

          "@media (hover: hover)": {
            "&:hover": {
              transform: "translateY(-2px)",
            },
          },
        },

        containedPrimary: {
          color: black,
          backgroundColor: gold,

          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "#E6B600",
              boxShadow: "0 10px 26px rgba(244, 196, 48, 0.24)",
            },
          },
        },

        outlinedPrimary: {
          borderWidth: 1.5,

          "@media (hover: hover)": {
            "&:hover": {
              borderWidth: 1.5,
              backgroundColor: "#FFF9DF",
            },
          },
        },

        textPrimary: {
          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "rgba(244, 196, 48, 0.08)",
            },
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition:
            "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 180ms ease",

          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: goldLight,
              transform: "translateY(-2px)",
            },
          },

          "&:active": {
            transform: "scale(0.94)",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },

        elevation1: {
          boxShadow: "0 4px 18px rgba(17, 17, 17, 0.055)",
        },

        elevation2: {
          boxShadow: "0 8px 28px rgba(17, 17, 17, 0.075)",
        },

        elevation3: {
          boxShadow: "0 14px 40px rgba(17, 17, 17, 0.09)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${border}`,
          backgroundImage: "none",
          boxShadow: "0 8px 30px rgba(17, 17, 17, 0.055)",
          overflow: "hidden",
          transition:
            "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 280ms ease, border-color 220ms ease",

          "@media (hover: hover)": {
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 16px 42px rgba(17, 17, 17, 0.10)",
              borderColor: "#DCDCDC",
            },
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },

      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            transition:
              "background-color 180ms ease, box-shadow 220ms ease, transform 180ms ease",

            "& fieldset": {
              borderColor: "#DDDDDD",
              borderWidth: 1,
              transition:
                "border-color 180ms ease, border-width 180ms ease",
            },

            "&:hover": {
              backgroundColor: "#FFFDF7",

              "& fieldset": {
                borderColor: "#C9A52A",
              },
            },

            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
              boxShadow: "0 0 0 3px rgba(244, 196, 48, 0.10)",

              "& fieldset": {
                borderColor: gold,
                borderWidth: 1.5,
              },
            },
          },

          "& .MuiInputLabel-root": {
            transition: "color 180ms ease",
          },

          "& .MuiInputLabel-root.Mui-focused": {
            color: "#927100",
          },

          "& .MuiFormHelperText-root": {
            transition: "opacity 180ms ease",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          transition: "background-color 180ms ease",
        },

        icon: {
          transition: "transform 180ms ease, color 180ms ease",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 5,
          borderRadius: 14,
          border: `1px solid ${border}`,
          boxShadow: "0 16px 45px rgba(17, 17, 17, 0.12)",
          backgroundImage: "none",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 9,
          margin: "3px 6px",
          transition:
            "background-color 150ms ease, transform 150ms ease, color 150ms ease",

          "&:hover": {
            backgroundColor: "#FFF8DC",
            transform: "translateX(2px)",
          },

          "&.Mui-selected": {
            backgroundColor: "#FFF1B8",
            fontWeight: 800,
          },

          "&.Mui-selected:hover": {
            backgroundColor: "#FFE99A",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 700,
          transition:
            "transform 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease",

          "@media (hover: hover)": {
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: border,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: black,
          borderRadius: 8,
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "7px 10px",
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          animation: "GlyrusAlertIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",

          "@keyframes GlyrusAlertIn": {
            from: {
              opacity: 0,
              transform: "translateY(8px) scale(0.98)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0) scale(1)",
            },
          },
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${border}`,
          boxShadow: "0 6px 24px rgba(17, 17, 17, 0.045)",
          overflow: "auto",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAFAFA",

          "& .MuiTableCell-head": {
            color: "#333333",
            fontWeight: 800,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 160ms ease",

          "&:hover": {
            backgroundColor: "#FFFDF5",
          },
        },
      },
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;