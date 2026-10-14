import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  columnId: string;
  isEmpty: boolean;
  canDrop: boolean;
  children: ReactNode;
}

export default function DroppableColumn({ columnId, isEmpty, canDrop, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId, disabled: !canDrop });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: isEmpty ? 60 : 8,
        borderRadius: 1,
        transition: 'background-color 0.15s, min-height 0.15s',
        ...(isOver && {
          backgroundColor: 'rgba(0, 121, 191, 0.12)',
        }),
        ...(isEmpty && {
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'rgba(0,0,0,0.15)',
          mx: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }),
      }}
    >
      {isEmpty && canDrop && !isOver ? (
        <Box
          sx={{
            color: 'rgba(0,0,0,0.3)',
            fontSize: '0.75rem',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          Drop card here
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
