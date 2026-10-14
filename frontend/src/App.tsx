import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { getMe } from './features/auth/authSlice';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BoardsPage from './pages/BoardsPage';
import BoardDetailPage from './pages/BoardDetailPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAppSelector((state) => state.auth);
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);

  // Rehydrate user from stored token on first load
  useEffect(() => {
    if (accessToken && !user) {
      dispatch(getMe());
    }
  }, [accessToken, user, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/boards"
          element={
            <PrivateRoute>
              <BoardsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <PrivateRoute>
              <BoardDetailPage />
            </PrivateRoute>
          }
        />
        {/* Wildcard must come last */}
        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
