/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Card } from '../../types/card.types';

// Cards are stored as a map: columnId → Card[]
interface CardsState {
  cardsByColumn: Record<string, Card[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cardsByColumn: {},
  loading: false,
  error: null,
};

// -------- Thunks --------

export const fetchCards = createAsyncThunk(
  'cards/fetchByColumn',
  async (columnId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/columns/${columnId}/cards`);
      return { columnId, cards: res.data as Card[] };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cards');
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/create',
  async ({ columnId, title }: { columnId: string; title: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/columns/${columnId}/cards`, { title });
      return { columnId, card: res.data as Card };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/update',
  async (
    {
      cardId,
      columnId,
      data,
    }: {
      cardId: string;
      columnId: string;
      data: Partial<Pick<Card, 'title' | 'description' | 'dueDate' | 'labels'>>;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/cards/${cardId}`, data);
      return { columnId, card: res.data as Card };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/delete',
  async ({ cardId, columnId }: { cardId: string; columnId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/cards/${cardId}`);
      return { cardId, columnId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete card');
    }
  }
);

export const moveCard = createAsyncThunk(
  'cards/move',
  async (
    {
      cardId,
      sourceColumnId,
      targetColumnId,
      targetPosition,
      // optimistic snapshot already applied before dispatch
    }: {
      cardId: string;
      sourceColumnId: string;
      targetColumnId: string;
      targetPosition: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/cards/${cardId}/move`, {
        targetColumnId,
        targetPosition,
      });
      return {
        cardId,
        sourceColumnId,
        targetColumnId,
        updatedCard: res.data as Card,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to move card');
    }
  }
);

// -------- Slice --------

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearCards: (state) => {
      state.cardsByColumn = {};
    },
    clearCardsError: (state) => {
      state.error = null;
    },
    // Sync a card that was already saved externally (e.g. from CardDetailDrawer)
    syncCard: (
      state,
      action: PayloadAction<{ columnId: string; card: Card }>
    ) => {
      const { columnId, card } = action.payload;
      const list = state.cardsByColumn[columnId] || [];
      const idx = list.findIndex((c) => c._id === card._id);
      if (idx !== -1) state.cardsByColumn[columnId][idx] = card;
    },
    // Used for optimistic drag-and-drop updates
    optimisticMoveCard: (
      state,
      action: PayloadAction<{
        cardId: string;
        sourceColumnId: string;
        targetColumnId: string;
        targetPosition: number;
      }>
    ) => {
      const { cardId, sourceColumnId, targetColumnId, targetPosition } = action.payload;

      const sourceList = state.cardsByColumn[sourceColumnId] || [];
      const cardIndex = sourceList.findIndex((c) => c._id === cardId);
      if (cardIndex === -1) return;

      const card = sourceList[cardIndex];

      // Remove from source
      const newSource = sourceList.filter((c) => c._id !== cardId);
      state.cardsByColumn[sourceColumnId] = newSource;

      // Insert into target
      const newTarget = [...(state.cardsByColumn[targetColumnId] || [])];
      const updatedCard = { ...card, columnId: targetColumnId };
      const insertAt = Math.min(targetPosition, newTarget.length);
      newTarget.splice(insertAt, 0, updatedCard);
      state.cardsByColumn[targetColumnId] = newTarget;
    },
    // Remove all cards for a deleted column
    removeColumnCards: (state, action: PayloadAction<string>) => {
      delete state.cardsByColumn[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCards.fulfilled,
        (state, action: PayloadAction<{ columnId: string; cards: Card[] }>) => {
          state.loading = false;
          state.cardsByColumn[action.payload.columnId] = action.payload.cards;
        }
      )
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder.addCase(
      createCard.fulfilled,
      (state, action: PayloadAction<{ columnId: string; card: Card }>) => {
        const { columnId, card } = action.payload;
        if (!state.cardsByColumn[columnId]) state.cardsByColumn[columnId] = [];
        state.cardsByColumn[columnId].push(card);
      }
    );

    // Update
    builder.addCase(
      updateCard.fulfilled,
      (state, action: PayloadAction<{ columnId: string; card: Card }>) => {
        const { columnId, card } = action.payload;
        const list = state.cardsByColumn[columnId] || [];
        const idx = list.findIndex((c) => c._id === card._id);
        if (idx !== -1) state.cardsByColumn[columnId][idx] = card;
      }
    );

    // Delete
    builder.addCase(
      deleteCard.fulfilled,
      (state, action: PayloadAction<{ cardId: string; columnId: string }>) => {
        const { cardId, columnId } = action.payload;
        state.cardsByColumn[columnId] = (state.cardsByColumn[columnId] || []).filter(
          (c) => c._id !== cardId
        );
      }
    );

    // Move — sync the server-side position back after optimistic update
    builder.addCase(
      moveCard.fulfilled,
      (
        state,
        action: PayloadAction<{
          cardId: string;
          sourceColumnId: string;
          targetColumnId: string;
          updatedCard: Card;
        }>
      ) => {
        const { updatedCard, targetColumnId } = action.payload;
        const list = state.cardsByColumn[targetColumnId] || [];
        const idx = list.findIndex((c) => c._id === updatedCard._id);
        if (idx !== -1) state.cardsByColumn[targetColumnId][idx] = updatedCard;
      }
    );
  },
});

export const { clearCards, clearCardsError, syncCard, optimisticMoveCard, removeColumnCards } =
  cardsSlice.actions;
export default cardsSlice.reducer;
