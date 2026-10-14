import { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  onAdd: (title: string) => Promise<void>;
}

export default function AddColumnForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onAdd(trimmed);
      setTitle('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { setTitle(''); setOpen(false); }
  };

  if (!open) {
    return (
      <Box sx={{ minWidth: 200, flexShrink: 0 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            color: 'rgba(255,255,255,0.85)',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
            px: 2,
            py: 0.9,
            fontSize: '0.85rem',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' },
          }}
        >
          Add list
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minWidth: 290,
        maxWidth: 290,
        flexShrink: 0,
        backgroundColor: 'rgba(241,245,249,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2.5,
        p: 1.5,
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder="List name..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: 1.5,
            fontSize: '0.875rem',
            fontWeight: 600,
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}
        >
          Add list
        </Button>
        <IconButton
          size="small"
          onClick={() => { setTitle(''); setOpen(false); }}
          sx={{ color: '#64748b', '&:hover': { color: '#0f172a' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
