import { useEffect, useState, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton, CircularProgress,
  Avatar, Chip, Tooltip, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../api/axios';
import type { Activity } from '../types/activity.types';

interface Props {
  open: boolean;
  boardId: string;
  onClose: () => void;
}

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
  created_card: { label: 'created',  color: '#10b981', bg: '#d1fae5' },
  updated_card: { label: 'updated',  color: '#4f46e5', bg: '#e0e7ff' },
  moved_card:   { label: 'moved',    color: '#f59e0b', bg: '#fef3c7' },
  deleted_card: { label: 'deleted',  color: '#ef4444', bg: '#fee2e2' },
};

const AVATAR_COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeed({ open, boardId, onClose }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!boardId) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/boards/${boardId}/activity`);
      setActivities(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activity');
    } finally { setLoading(false); }
  }, [boardId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) load(); }, [open, load]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 400 },
            border: 'none',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-8px 0 32px rgba(15,23,42,0.08)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ── Header ── */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Activity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last 50 actions on this board
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={load} disabled={loading}
                sx={{ color: '#94a3b8', '&:hover': { color: '#4f46e5' } }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}
              sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: 2 },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>{error}</Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress sx={{ color: '#4f46e5' }} />
            </Box>
          ) : activities.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 1.5 }}>
              <Typography sx={{ fontSize: 36 }}>📭</Typography>
              <Typography sx={{ fontWeight: 600, color: '#475569' }}>No activity yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 240 }}>
                Actions like creating, moving, or editing cards will appear here.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              {activities.map((activity, idx) => {
                const meta = ACTION_META[activity.action] ?? { label: activity.action, color: '#64748b', bg: '#f1f5f9' };
                const name = activity.userId?.name ?? 'Unknown';
                const cardTitle = (activity.meta?.title as string) || activity.cardId?.title;
                const isLast = idx === activities.length - 1;

                return (
                  <Box
                    key={activity._id}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      px: 3,
                      py: 1.75,
                      position: 'relative',
                      '&:hover': { backgroundColor: '#f8fafc' },
                      // Timeline line
                      '&::before': !isLast ? {
                        content: '""',
                        position: 'absolute',
                        left: 42,
                        top: 48,
                        bottom: 0,
                        width: 1,
                        backgroundColor: '#f1f5f9',
                      } : {},
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        backgroundColor: avatarColor(name),
                        zIndex: 1,
                      }}
                    >
                      {name[0]?.toUpperCase() ?? '?'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + action badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                          {name}
                        </Typography>
                        <Chip
                          label={meta.label}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            borderRadius: 1,
                            backgroundColor: meta.bg,
                            color: meta.color,
                            border: 'none',
                          }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>a card</Typography>
                      </Box>

                      {/* Card title */}
                      {cardTitle && (
                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: '0.8rem',
                            color: '#475569',
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          "{cardTitle}"
                        </Typography>
                      )}

                      <Typography sx={{ mt: 0.25, fontSize: '0.68rem', color: '#94a3b8' }}>
                        {timeAgo(activity.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
