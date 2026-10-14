import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  IconButton,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  clearColumns,
} from '../features/columns/columnsSlice';
import {
  fetchCards,
  createCard,
  deleteCard,
  moveCard,
  optimisticMoveCard,
  removeColumnCards,
  syncCard,
} from '../features/cards/cardsSlice';

import type { Card } from '../types/card.types';
import { type BoardRole, getPermissions } from '../hooks/usePermissions';

import KanbanCard from '../components/KanbanCard';
import CardDetailDrawer from '../components/CardDetailDrawer';
import AddCardForm from '../components/AddCardForm';
import AddColumnForm from '../components/AddColumnForm';
import ColumnHeader from '../components/ColumnHeader';
import DroppableColumn from '../components/DroppableColumn';
import InviteMemberDialog from '../components/InviteMemberDialog';
import ActivityFeed from '../components/ActivityFeed';

import api from '../api/axios';

export default function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { columns, loading: columnsLoading } = useAppSelector((state) => state.columns);
  const { cardsByColumn } = useAppSelector((state) => state.cards);

  const [boardTitle, setBoardTitle] = useState('Board');
  const [myRole, setMyRole] = useState<BoardRole>(null);
  const [boardLoading, setBoardLoading] = useState(true);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Derive permissions from role once
  const perms = getPermissions(myRole);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
      // Disable sensor entirely for viewers — belt-and-suspenders on top of
      // the handleDragEnd guard below.
    })
  );

  // -------- Load board + columns + cards --------
  useEffect(() => {
    if (!boardId) return;
    dispatch(clearColumns());

    const loadBoard = async () => {
      setBoardLoading(true);
      try {
        const res = await api.get(`/boards/${boardId}`);
        setBoardTitle(res.data.title);
        setMyRole((res.data.role as BoardRole) ?? null);
      } catch {
        navigate('/boards');
      } finally {
        setBoardLoading(false);
      }
    };

    loadBoard();
    dispatch(fetchColumns(boardId));
  }, [boardId, dispatch, navigate]);

  useEffect(() => {
    columns.forEach((col) => dispatch(fetchCards(col._id)));
  }, [columns, dispatch]);

  // -------- Column actions --------
  const handleAddColumn = async (title: string) => {
    if (!boardId || !perms.canManageColumns) return;
    await dispatch(createColumn({ boardId, title }));
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    if (!perms.canManageColumns) return;
    await dispatch(updateColumn({ columnId, title: newTitle }));
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!perms.canManageColumns) return;
    await dispatch(deleteColumn(columnId));
    dispatch(removeColumnCards(columnId));
  };

  // -------- Card actions --------
  const handleAddCard = async (columnId: string, title: string) => {
    if (!perms.canManageCards) return;
    await dispatch(createCard({ columnId, title }));
  };

  const handleCardClick = (card: Card) => {
    // Viewers can open the drawer to read, but it will be read-only
    setSelectedCard(card);
    setDrawerOpen(true);
  };

  const handleCardUpdate = (updatedCard: Card) => {
    dispatch(syncCard({ columnId: updatedCard.columnId, card: updatedCard }));
    setSelectedCard(updatedCard);
  };

  const handleCardDelete = (cardId: string, columnId: string) => {
    dispatch(deleteCard({ cardId, columnId }));
    setDrawerOpen(false);
    setSelectedCard(null);
  };

  // -------- DnD --------
  const handleDragStart = (event: DragStartEvent) => {
    if (!perms.canDragCards) return; // ignore drag start for viewers
    setActiveCardId(event.active.id as string);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragOver = (_event: DragOverEvent) => {};

  const findColumnForCard = (cardId: string): string | null => {
    for (const colId in cardsByColumn) {
      if (cardsByColumn[colId]?.some((c) => c._id === cardId)) return colId;
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCardId(null);

    // Hard gate — viewers must never reach the API
    if (!perms.canDragCards) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumnId = findColumnForCard(activeId);
    if (!sourceColumnId) return;

    let targetColumnId = '';
    let targetPosition = 0;

    if (columns.some((c) => c._id === overId)) {
      targetColumnId = overId;
      targetPosition = cardsByColumn[targetColumnId]?.length ?? 0;
    } else {
      targetColumnId = findColumnForCard(overId) ?? '';
      if (!targetColumnId) return;
      const targetList = cardsByColumn[targetColumnId] ?? [];
      const idx = targetList.findIndex((c) => c._id === overId);
      targetPosition = idx === -1 ? targetList.length : idx;
    }

    if (!targetColumnId) return;

    if (sourceColumnId === targetColumnId) {
      const currentIdx = (cardsByColumn[sourceColumnId] ?? []).findIndex(
        (c) => c._id === activeId
      );
      if (currentIdx === targetPosition) return;
    }

    dispatch(optimisticMoveCard({ cardId: activeId, sourceColumnId, targetColumnId, targetPosition }));
    dispatch(moveCard({ cardId: activeId, sourceColumnId, targetColumnId, targetPosition }));
  };

  function findActiveCard(id: string): Card | null {
    for (const colId in cardsByColumn) {
      const found = cardsByColumn[colId]?.find((c) => c._id === id);
      if (found) return found;
    }
    return null;
  }

  const activeCard = activeCardId ? findActiveCard(activeCardId) : null;
  const isLoading = boardLoading || columnsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1e40af', backgroundImage: 'linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="Back to boards">
            <IconButton color="inherit" onClick={() => navigate('/boards')} edge="start" size="small"
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            {boardTitle}
          </Typography>

          {myRole && (
            <Chip
              label={myRole}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            />
          )}

          <Box sx={{ flex: 1 }} />

          {perms.canInvite && (
            <Button
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteOpen(true)}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' },
              }}
            >
              Invite
            </Button>
          )}

          <Button
            startIcon={<HistoryIcon />}
            onClick={() => setActivityOpen(true)}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' },
            }}
          >
            Activity
          </Button>
        </Toolbar>
      </AppBar>

      {/* Viewer banner */}
      {myRole === 'viewer' && (
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.3)', px: 3, py: 0.75, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
            👁 View-only access — contact the board owner to request edit permissions.
          </Typography>
        </Box>
      )}

      {/* Columns area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2.5,
            overflowX: 'auto',
            alignItems: 'flex-start',
            flex: 1,
            // Custom scrollbar on the board canvas
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.45)' },
          }}
        >
          {columns.map((column) => {
            const columnCards = cardsByColumn[column._id] ?? [];
            return (
              <Box
                key={column._id}
                sx={{
                  minWidth: 290,
                  maxWidth: 290,
                  flexShrink: 0,
                  backgroundColor: 'rgba(241,245,249,0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 2.5,
                  pb: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 110px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                <ColumnHeader
                  title={column.title}
                  canEdit={perms.canManageColumns}
                  onRename={(newTitle) => handleRenameColumn(column._id, newTitle)}
                  onDelete={() => handleDeleteColumn(column._id)}
                />

                <Box
                  sx={{
                    px: 1,
                    overflowY: 'auto',
                    flex: 1,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: 2 },
                  }}
                >
                  <SortableContext
                    id={column._id}
                    items={perms.canDragCards ? columnCards.map((c) => c._id) : []}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn columnId={column._id} isEmpty={columnCards.length === 0} canDrop={perms.canDragCards}>
                      {columnCards.map((card) => (
                        <KanbanCard
                          key={card._id}
                          card={card}
                          onClick={handleCardClick}
                          draggable={perms.canDragCards}
                        />
                      ))}
                    </DroppableColumn>
                  </SortableContext>
                </Box>

                {perms.canManageCards && (
                  <Box sx={{ px: 1, pt: 0.5 }}>
                    <AddCardForm onAdd={(title) => handleAddCard(column._id, title)} />
                  </Box>
                )}
              </Box>
            );
          })}

          {perms.canManageColumns && (
            <AddColumnForm onAdd={handleAddColumn} />
          )}
        </Box>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeCard && perms.canDragCards ? (
            <Box
              sx={{
                p: 1.5,
                backgroundColor: 'white',
                borderRadius: 2,
                width: 274,
                boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                border: '1px solid #e2e8f0',
                transform: 'rotate(2deg)',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {activeCard.title}
              </Typography>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardDetailDrawer
        open={drawerOpen}
        card={selectedCard}
        canEdit={perms.canManageCards}
        canComment={perms.canComment}
        onClose={() => setDrawerOpen(false)}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
      />

      {boardId && (
        <InviteMemberDialog
          open={inviteOpen}
          boardId={boardId}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {boardId && (
        <ActivityFeed
          open={activityOpen}
          boardId={boardId}
          onClose={() => setActivityOpen(false)}
        />
      )}
    </Box>
  );
}
