/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Column } from '../../types/column.types';

interface ColumnsState {
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: ColumnsState = {
  columns: [],
  loading: false,
  error: null,
};

// -------- Thunks --------

export const fetchColumns = createAsyncThunk(
  'columns/fetchAll',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/boards/${boardId}/columns`);
      return res.data as Column[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch columns');
    }
  }
);

export const createColumn = createAsyncThunk(
  'columns/create',
  async ({ boardId, title }: { boardId: string; title: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/boards/${boardId}/columns`, { title });
      return res.data as Column;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'columns/update',
  async (
    { columnId, title }: { columnId: string; title: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/columns/${columnId}`, { title });
      return res.data as Column;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/delete',
  async (columnId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/columns/${columnId}`);
      return columnId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete column');
    }
  }
);

// -------- Slice --------

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    clearColumnsError: (state) => {
      state.error = null;
    },
    clearColumns: (state) => {
      state.columns = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action: PayloadAction<Column[]>) => {
        state.loading = false;
        state.columns = action.payload;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createColumn.fulfilled, (state, action: PayloadAction<Column>) => {
        state.columns.push(action.payload);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateColumn.fulfilled, (state, action: PayloadAction<Column>) => {
        const idx = state.columns.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.columns[idx] = action.payload;
      });

    // Delete
    builder
      .addCase(deleteColumn.fulfilled, (state, action: PayloadAction<string>) => {
        state.columns = state.columns.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearColumnsError, clearColumns } = columnsSlice.actions;
export default columnsSlice.reducer;
