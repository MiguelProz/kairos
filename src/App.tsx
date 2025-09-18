import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoginForm } from "./pages/Login";
import { RegisterForm } from "./pages/Register";
import AccountPage from "./pages/Account";
import DashboardPage from "./pages/Dashboard";
import StackedLayout from "./components/StackedLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={
          <StackedLayout>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </StackedLayout>
        }
      />
      <Route
        path="/account"
        element={
          <StackedLayout>
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          </StackedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
