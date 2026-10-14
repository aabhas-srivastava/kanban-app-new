import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  AppBar,
  Toolbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBoards, createBoard, deleteBoard } from '../features/boards/boardsSlice';
import { logout } from '../features/auth/authSlice';

const ROLE_META: Record<string, { color: string; bg: string; label: string }> = {
  owner:  { color: '#4f46e5', bg: '#eef2ff', label: 'Owner' },
  member: { color: '#0369a1', bg: '#e0f2fe', label: 'Member' },
  viewer: { color: '#475569', bg: '#f1f5f9', label: 'Viewer' },
};

// Deterministic but visually varied board accent colours
const BOARD_ACCENTS = [
  'linear-gradient(135deg,#4f46e5,#818cf8)',
  'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#ef4444,#f87171)',
  'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
  'linear-gradient(135deg,#14b8a6,#2dd4bf)',
];

function getBoardAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return BOARD_ACCENTS[Math.abs(hash) % BOARD_ACCENTS.length];
}

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { boards, loading } = useAppSelector((state) => state.boards);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Per-card "…" menu
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; boardId: string; boardTitle: string } | null>(null);

  // User menu
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => { dispatch(fetchBoards()); }, [dispatch]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    const result = await dispatch(createBoard({ title, description }));
    if (createBoard.fulfilled.match(result)) {
      setCreateOpen(false);
      setTitle('');
      setDescription('');
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!menuAnchor) return;
    const { boardId, boardTitle } = menuAnchor;
    setMenuAnchor(null);
    if (!window.confirm(`Delete "${boardTitle}"? This cannot be undone.`)) return;
    const result = await dispatch(deleteBoard(boardId));
    if (deleteBoard.rejected.match(result)) {
      alert((result.payload as string) || 'Failed to delete board');
    }
  };

  const handleLogout = () => {
    setUserAnchor(null);
    dispatch(logout());
    navigate('/login');
  };

  const visible = boards.filter((b) => !b.isArchived);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1e40af',
        backgroundImage: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Topbar ── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 56, px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              ⬡
            </Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              Kanban
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* User section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              borderRadius: 2,
              px: 1.25,
              py: 0.5,
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              transition: 'background-color 0.15s',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' },
            }}
            onClick={(e) => setUserAnchor(e.currentTarget)}
          >
            <Avatar sx={{ width: 26, height: 26, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', fontSize: 12, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
            <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.85rem', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
          </Box>
          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 190,
                  borderRadius: 2.5,
                  mt: 1,
                  p: 0.5,
                },
              },
            }}
          >
            <MenuItem disabled sx={{ fontSize: '0.8rem', color: 'text.secondary', py: 0.5 }}>
              {user?.email}
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1, fontSize: '0.875rem' }}>
              <ListItemIcon sx={{ minWidth: 0 }}><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ── Main content ── */}
      <Box sx={{ flex: 1, px: { xs: 2, sm: 3, md: 4 }, py: 3.5, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        {/* Section header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              Your boards
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
              {visible.length} board{visible.length !== 1 ? 's' : ''} available
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(6px)',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderColor: 'rgba(255,255,255,0.4)',
              },
            }}
          >
            New board
          </Button>
        </Box>

        {/* Loading */}
        {loading && visible.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : visible.length === 0 ? (
          /* Empty state */
          <Box
            sx={{
              mt: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 5,
              borderRadius: 2.5,
              backgroundColor: 'rgba(241,245,249,0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              textAlign: 'center',
              maxWidth: 440,
              mx: 'auto',
            }}
          >
            <Box sx={{ fontSize: 44 }}>📋</Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>No boards yet</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>Create your first board to start organizing cards and tasks.</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ mt: 1, borderRadius: 2 }}
            >
              Create a board
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {visible.map((board) => {
              const role = ROLE_META[board.role ?? 'viewer'] ?? ROLE_META.viewer;
              const accent = getBoardAccent(board._id);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={board._id}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(241,245,249,0.94)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2.5,
                      border: '1px solid rgba(255,255,255,0.65)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      '&:hover': {
                        boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
                        transform: 'translateY(-3px)',
                        borderColor: 'rgba(255,255,255,0.95)',
                        '& .board-arrow': { opacity: 1, transform: 'translateX(3px)' },
                      },
                    }}
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    {/* Colour bar */}
                    <Box sx={{ height: 6, background: accent }} />

                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Title row */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3, flex: 1, pr: 1 }}>
                          {board.title}
                        </Typography>
                        {board.role === 'owner' && (
                          <IconButton
                            size="small"
                            sx={{ mt: -0.5, mr: -0.5, color: '#94a3b8', '&:hover': { color: '#0f172a', backgroundColor: 'rgba(15,23,42,0.06)' } }}
                            onClick={(e) => { e.stopPropagation(); setMenuAnchor({ el: e.currentTarget, boardId: board._id, boardTitle: board.title }); }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem', lineHeight: 1.4, minHeight: 34 }}>
                        {board.description || 'No description'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                        <Chip
                          label={role.label}
                          size="small"
                          sx={{
                            backgroundColor: role.bg,
                            color: role.color,
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 20,
                            borderRadius: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            border: `1px solid ${role.color}30`,
                          }}
                        />
                        <KeyboardArrowRightIcon
                          className="board-arrow"
                          sx={{ color: '#64748b', fontSize: 18, opacity: 0, transition: 'opacity 0.18s, transform 0.18s' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}

            {/* Create new card in grid */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 140,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2.5,
                  border: '2px dashed rgba(255,255,255,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  p: 2.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.6)',
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => setCreateOpen(true)}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
                  New board
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Board "…" menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 160, borderRadius: 2 } } }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main', gap: 1.5, fontSize: '0.875rem' }}>
          <DeleteOutlineIcon fontSize="small" />
          Delete board
        </MenuItem>
      </Menu>

      {/* Create board dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: '1.1rem' }}>Create new board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Board name"
            placeholder="e.g. Sprint Roadmap"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Description (optional)"
            placeholder="What will this board track?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="dense"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating || !title.trim()}>
            {creating ? <CircularProgress size={18} color="inherit" /> : 'Create board'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
