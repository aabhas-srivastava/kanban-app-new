import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login, clearError } from '../features/auth/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate('/boards');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#1e40af',
        backgroundImage: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)',
      }}
    >
      {/* Left branding panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: { md: 7, lg: 10 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: 'white',
            }}
          >
            ⬡
          </Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Kanban
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, mb: 2, letterSpacing: '-0.02em' }}>
          Organize work.<br />Ship faster.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: 420, lineHeight: 1.6 }}>
          A clean, powerful visual workspace for teams that want to stay focused and move quickly.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 400 }}>
          {[
            '🚀 Fast & intuitive drag-and-drop workflow',
            '👥 Real-time board sharing with role permissions',
            '📋 Detailed card comments and live activity logs',
          ].map((feat) => (
            <Box
              key={feat}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {feat}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          width: { xs: '100%', md: 490 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5, md: 6 },
          backgroundColor: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(16px)',
          borderLeft: { md: '1px solid rgba(255,255,255,0.12)' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.8)',
            backgroundColor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.24)',
          }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: 'white',
              }}
            >
              ⬡
            </Box>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
              Kanban
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd(!showPwd)} edge="end">
                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, py: 1.3, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
