import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../api/axios';

interface Props {
  open: boolean;
  boardId: string;
  onClose: () => void;
}

export default function InviteMemberDialog({ open, boardId, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post(`/boards/${boardId}/members`, { email, role });
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            }}
          >
            <PersonAddIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2 }}>
              Invite member
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Share board access with teammates
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Member invited successfully!
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          placeholder="colleague@example.com"
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value as 'member' | 'viewer')}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="member">
              <Box sx={{ py: 0.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Member</Typography>
                <Typography variant="caption" color="text.secondary">
                  Can create, edit, and move cards
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="viewer">
              <Box sx={{ py: 0.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Viewer</Typography>
                <Typography variant="caption" color="text.secondary">
                  Can only view the board
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">Close</Button>
        <Button
          variant="contained"
          onClick={handleInvite}
          disabled={loading || !email.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
        >
          Send invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}
