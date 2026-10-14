import { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

interface Props {
  title: string;
  canEdit: boolean;
  onRename: (newTitle: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function ColumnHeader({ title, canEdit, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleCommit = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) await onRename(trimmed);
    else setEditValue(title);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommit();
    if (e.key === 'Escape') { setEditValue(title); setEditing(false); }
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    if (window.confirm(`Delete list "${title}" and all its cards?`)) await onDelete();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        pt: 1.5,
        pb: 0.75,
        gap: 0.5,
      }}
    >
      {editing ? (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          size="small"
          autoFocus
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { backgroundColor: 'white', borderRadius: 1.5 },
            '& .MuiInputBase-input': { fontWeight: 700, fontSize: '0.875rem', py: 0.6 },
          }}
        />
      ) : (
        <Tooltip title={canEdit ? 'Click to rename' : ''} placement="top" enterDelay={900} disableHoverListener={!canEdit}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#1e293b',
              flex: 1,
              cursor: canEdit ? 'pointer' : 'default',
              px: 0.5,
              py: 0.25,
              borderRadius: 1,
              letterSpacing: '-0.01em',
              '&:hover': canEdit ? { backgroundColor: 'rgba(15,23,42,0.05)' } : {},
            }}
            onClick={() => canEdit && setEditing(true)}
          >
            {title}
          </Typography>
        </Tooltip>
      )}

      {canEdit && (
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: '#94a3b8', p: 0.5, '&:hover': { color: '#475569', backgroundColor: 'rgba(15,23,42,0.06)' } }}
        >
          <MoreHorizIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 170, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' } } }}
      >
        <MenuItem
          onClick={() => { setAnchorEl(null); setEditing(true); }}
          sx={{ fontSize: '0.875rem', gap: 1.5, py: 1 }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
          Rename list
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ fontSize: '0.875rem', gap: 1.5, py: 1, color: 'error.main' }}
        >
          <DeleteOutlineIcon fontSize="small" />
          Delete list
        </MenuItem>
      </Menu>
    </Box>
  );
}
