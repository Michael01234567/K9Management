import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { MainApp } from './components/MainApp';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-900"></div>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
