import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
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
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { signup, clearError } from '../features/auth/authSlice';

const iconSx = { color: '#94a3b8', fontSize: 20 };

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  // Clear any stale error (e.g. from the login page) when this page opens
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    const result = await dispatch(
      signup({ name: name.trim(), email: email.trim(), password })
    );
    if (signup.fulfilled.match(result)) navigate('/boards');
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
      {/* Left panel */}
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
          Start building.<br />Stay organized.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: 420, lineHeight: 1.6 }}>
          Join your team and manage projects visually with custom boards, lists, and cards.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 400 }}>
          {[
            '⚡ Smooth and responsive drag-and-drop',
            '👥 Collaborate with owners, members, and viewers',
            '🔒 Secure, modern, and lightning fast',
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

      {/* Right form */}
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Free forever. No credit card required.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              autoComplete="name"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={iconSx} />
                    </InputAdornment>
                  ),
                },
              }}
            />
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
                      <EmailOutlinedIcon sx={iconSx} />
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
              autoComplete="new-password"
              slotProps={{
                htmlInput: { minLength: 8 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={iconSx} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPwd((v) => !v)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
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
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
            </Button>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}