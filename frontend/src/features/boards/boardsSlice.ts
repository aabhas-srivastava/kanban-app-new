/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Board, CreateBoardDto } from '../../types/board.types';

interface BoardsState {
  boards: Board[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  boards: [],
  loading: false,
  error: null,
};

// -------- Thunks --------

export const fetchBoards = createAsyncThunk(
  'boards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/boards');
      return response.data as Board[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/create',
  async (dto: CreateBoardDto, { rejectWithValue }) => {
    try {
      const response = await api.post('/boards', dto);
      return response.data as Board;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/delete',
  async (boardId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${boardId}`);
      return boardId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete board');
    }
  }
);

// -------- Slice --------

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearBoardsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch boards
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create board
    builder
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false;
        state.boards.unshift(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete board
    builder
      .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<string>) => {
        state.boards = state.boards.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearBoardsError } = boardsSlice.actions;
export default boardsSlice.reducer;
