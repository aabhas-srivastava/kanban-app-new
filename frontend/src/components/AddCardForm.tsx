import { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  onAdd: (title: string) => Promise<void>;
}

export default function AddCardForm({ onAdd }: Props) {
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
      <Button
        fullWidth
        startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
        onClick={() => setOpen(true)}
        sx={{
          justifyContent: 'flex-start',
          color: '#64748b',
          fontSize: '0.8rem',
          fontWeight: 500,
          py: 0.75,
          borderRadius: 1.5,
          '&:hover': { backgroundColor: 'rgba(15,23,42,0.06)', color: '#334155' },
        }}
      >
        Add a card
      </Button>
    );
  }

  return (
    <Box>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        multiline
        maxRows={3}
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: 1.5,
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
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
          Add card
        </Button>
        <IconButton
          size="small"
          onClick={() => { setTitle(''); setOpen(false); }}
          sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
