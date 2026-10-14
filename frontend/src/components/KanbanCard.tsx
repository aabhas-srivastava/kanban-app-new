import { Box, Typography, Chip, Stack } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { Card } from '../types/card.types';

interface Props {
  card: Card;
  onClick: (card: Card) => void;
  draggable: boolean;
}

const LABEL_COLORS: Record<string, string> = {
  bug:     '#ef4444',
  feature: '#4f46e5',
  design:  '#f59e0b',
  urgent:  '#dc2626',
  low:     '#10b981',
  medium:  '#f59e0b',
  high:    '#ef4444',
};

function getLabelColor(label: string): string {
  return LABEL_COLORS[label.toLowerCase()] ?? '#6366f1';
}

function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export default function KanbanCard({ card, onClick, draggable }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card._id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        backgroundColor: 'white',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(15,23,42,0.1)',
          borderColor: '#c7d2fe',
          '& .drag-handle': { opacity: 1 },
        },
      }}
    >
      {/* Drag grip */}
      {draggable && (
        <Box
          className="drag-handle"
          {...attributes}
          {...listeners}
          sx={{
            width: 20,
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            color: '#cbd5e1',
            opacity: 0,
            flexShrink: 0,
            transition: 'opacity 0.15s',
            '&:active': { cursor: 'grabbing', color: '#94a3b8' },
            borderRight: '1px solid #f1f5f9',
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 14 }} />
        </Box>
      )}

      {/* Card body */}
      <Box
        sx={{ flex: 1, p: 1.5, cursor: 'pointer', minWidth: 0 }}
        onClick={() => !isDragging && onClick(card)}
      >
        {/* Labels */}
        {card.labels?.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {card.labels.map((label) => (
              <Box
                key={label}
                sx={{
                  height: 5,
                  width: 36,
                  borderRadius: 1,
                  backgroundColor: getLabelColor(label),
                }}
              />
            ))}
          </Stack>
        )}

        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: '#0f172a', lineHeight: 1.5, wordBreak: 'break-word' }}
        >
          {card.title}
        </Typography>

        {/* Label text chips */}
        {card.labels?.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {card.labels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: `${getLabelColor(label)}18`,
                  color: getLabelColor(label),
                  border: `1px solid ${getLabelColor(label)}40`,
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        )}

        {/* Due date */}
        {card.dueDate && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: isOverdue(card.dueDate) ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${isOverdue(card.dueDate) ? '#fecaca' : '#e2e8f0'}`,
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 11, color: isOverdue(card.dueDate) ? '#ef4444' : '#64748b' }} />
            <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, color: isOverdue(card.dueDate) ? '#ef4444' : '#64748b' }}>
              {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
