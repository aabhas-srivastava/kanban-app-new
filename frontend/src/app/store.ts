import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import boardsReducer from '../features/boards/boardsSlice';
import columnsReducer from '../features/columns/columnsSlice';
import cardsReducer from '../features/cards/cardsSlice';

export const store = configureStore({
  reducer: {
    
    auth: authReducer,
    boards: boardsReducer,
    columns: columnsReducer,
    cards: cardsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
