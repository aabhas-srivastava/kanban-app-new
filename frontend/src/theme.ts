import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5',      // indigo-600
      light: '#818cf8',     // indigo-400
      dark: '#3730a3',      // indigo-800
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',      // sky-500
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#6366f1',
    },
    background: {
      default: '#f1f5f9',   // slate-100
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',   // slate-900
      secondary: '#64748b', // slate-500
    },
    divider: '#e2e8f0',     // slate-200
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    caption: { color: '#64748b' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.06)',
    '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
    '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.04)',
    '0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04)',
    '0 20px 25px rgba(15,23,42,0.1), 0 10px 10px rgba(15,23,42,0.04)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
    '0 25px 50px rgba(15,23,42,0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
          },
        },
        outlined: {
          borderColor: '#4f46e5',
          '&:hover': { backgroundColor: '#eef2ff' },
        },
        sizeLarge: { padding: '11px 24px', fontSize: '0.95rem' },
        sizeSmall: { padding: '5px 12px', fontSize: '0.8rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.72rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 48px rgba(15,23,42,0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-8px 0 32px rgba(15,23,42,0.12)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          fontWeight: 700,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 0.15s',
        },
      },
    },
  },
});

export default theme;
