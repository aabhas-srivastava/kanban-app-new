import { useEffect, useState, useCallback } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, IconButton,
  Divider, Chip, Stack, Avatar, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import api from '../api/axios';
import type { Card } from '../types/card.types';
import type { Comment } from '../types/comment.types';
import { useAppSelector } from '../hooks/redux';

interface Props {
  open: boolean;
  card: Card | null;
  canEdit: boolean;
  canComment: boolean;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: string, columnId: string) => void;
}

const LABEL_PRESETS = ['bug', 'feature', 'design', 'urgent', 'low', 'medium', 'high'];
const LABEL_COLORS: Record<string, string> = {
  bug: '#ef4444', feature: '#4f46e5', design: '#f59e0b',
  urgent: '#dc2626', low: '#10b981', medium: '#f59e0b', high: '#ef4444',
};
function getLabelColor(l: string) { return LABEL_COLORS[l.toLowerCase()] ?? '#6366f1'; }

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, mt: 2.5 }}>
      <Box sx={{ color: '#94a3b8', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
        {text}
      </Typography>
    </Box>
  );
}

export default function CardDetailDrawer({ open, card, canEdit, canComment, onClose, onUpdate, onDelete }: Props) {
  const { user } = useAppSelector((s) => s.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
      setLabels(card.labels || []);
      setSaveError(null);
    }
  }, [card]);

  const loadComments = useCallback(async () => {
    if (!card) return;
    setCommentsLoading(true);
    try {
      const res = await api.get(`/cards/${card._id}/comments`);
      setComments(res.data);
    } catch { /* non-fatal */ } finally { setCommentsLoading(false); }
  }, [card]);

  useEffect(() => { if (open && card) loadComments(); }, [open, card, loadComments]);

  if (!card) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true); setSaveError(null);
    try {
      const res = await api.patch(`/cards/${card._id}`, { title, description, dueDate: dueDate || null, labels });
      onUpdate(res.data);
      onClose();
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to update card');
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this card? This cannot be undone.')) return;
    onDelete(card._id, card.columnId);
    onClose();
  };

  const toggleLabel = (l: string) =>
    setLabels((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const res = await api.post(`/cards/${card._id}/comments`, { text: newComment });
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
    } catch { /* non-fatal */ } finally { setPostingComment(false); }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch { /* non-fatal */ }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 480 },
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
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            {canEdit ? 'Edit card' : 'Card details'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && (
              <Tooltip title="Delete card">
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>{saveError}</Alert>
          )}

          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => canEdit && setTitle(e.target.value)}
            size="small"
            margin="dense"
            slotProps={{ input: { readOnly: !canEdit } }}
            sx={{ '& .MuiInputBase-input': { fontWeight: 600, fontSize: '0.95rem' } }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => canEdit && setDescription(e.target.value)}
            size="small"
            margin="dense"
            multiline
            rows={3}
            placeholder={canEdit ? 'Add a more detailed description…' : 'No description'}
            slotProps={{ input: { readOnly: !canEdit } }}
          />

          {/* Due date */}
          <SectionLabel icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />} text="Due date" />
          <TextField
            type="date"
            value={dueDate}
            onChange={(e) => canEdit && setDueDate(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true }, input: { readOnly: !canEdit } }}
          />

          {/* Labels */}
          <SectionLabel icon={<LabelOutlinedIcon sx={{ fontSize: 15 }} />} text="Labels" />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {LABEL_PRESETS.map((label) => {
              const active = labels.includes(label);
              const color = getLabelColor(label);
              return (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  onClick={() => canEdit && toggleLabel(label)}
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    cursor: canEdit ? 'pointer' : 'default',
                    backgroundColor: active ? color : `${color}14`,
                    color: active ? 'white' : color,
                    border: `1.5px solid ${active ? color : `${color}40`}`,
                    transition: 'all 0.15s',
                    '&:hover': canEdit ? { backgroundColor: active ? color : `${color}28` } : {},
                  }}
                />
              );
            })}
          </Stack>

          {/* Save */}
          {canEdit && (
            <Button
              fullWidth variant="contained" size="large"
              sx={{ mt: 3, borderRadius: 2 }}
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
            </Button>
          )}

          <Divider sx={{ my: 3 }} />

          {/* ── Comments ── */}
          <SectionLabel icon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />} text={`Comments${comments.length ? ` (${comments.length})` : ''}`} />

          {canComment ? (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', fontSize: 13, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth multiline rows={2} size="small"
                  placeholder="Write a comment… (Ctrl+Enter to post)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePostComment(); }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  size="small" variant="contained"
                  sx={{ mt: 0.75, borderRadius: 1.5 }}
                  onClick={handlePostComment}
                  disabled={postingComment || !newComment.trim()}
                >
                  {postingComment ? <CircularProgress size={14} color="inherit" /> : 'Post'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 2, px: 2, py: 1.25, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                🔒 View-only — you need member access to post comments.
              </Typography>
            </Box>
          )}

          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
          ) : comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.8rem' }}>
              No comments yet
            </Typography>
          ) : (
            <Stack spacing={2}>
              {comments.map((comment) => (
                <Box key={comment._id} sx={{ display: 'flex', gap: 1.5 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: '#e2e8f0', color: '#475569', fontSize: 12, flexShrink: 0 }}>
                    {comment.userId?.name?.[0]?.toUpperCase() ?? '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>
                        {comment.userId?.name ?? 'Unknown'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                        {comment.userId?._id === user?.id && (
                          <IconButton size="small" onClick={() => handleDeleteComment(comment._id)}
                            sx={{ p: 0.25, color: '#cbd5e1', '&:hover': { color: '#ef4444' } }}>
                            <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ p: 1.25, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', fontSize: '0.83rem', lineHeight: 1.55, wordBreak: 'break-word' }}
                    >
                      {comment.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
