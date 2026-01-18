import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { OnboardingFlow } from '@/components/onboarding';
import { AuthProvider, AuthGuard, GuestGuard } from '@/components/auth';
import { Dashboard, Skills, Connections, Settings, Login, SignUp } from '@/pages';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useGraphStore } from '@/store/graphStore';
import { isRealBackend } from '@/services/backend';

function AppContent() {
  const { user, hasCompletedOnboarding, loadMockUser, careerGoals, isLoading, syncStatus } = useUserStore();
  const { authUser } = useAuthStore();
  const { generateGraph, currentGraph } = useGraphStore();

  // Auto-load mock user when not using Firebase backend
  useEffect(() => {
    if (!isRealBackend() && !user) {
      loadMockUser();
    }
  }, [user, loadMockUser]);

  // Generate graph when user is loaded and has career goals
  useEffect(() => {
    if (user && careerGoals.length > 0 && !currentGraph) {
      const primaryGoal = careerGoals.find(g => g.timeframe === 'long') || careerGoals[0];
      generateGraph(primaryGoal.targetRoleId);
    }
  }, [user, careerGoals, currentGraph, generateGraph]);

  // For Firebase mode: Show onboarding for authenticated users who haven't completed it
  // This includes new users (user might be null while syncing, or has hasCompletedOnboarding=false)
  if (isRealBackend() && authUser) {
    // Wait for sync to initialize - syncStatus 'idle' means initializeSync hasn't run yet
    // Also check isLoading or actively syncing
    if (syncStatus === 'idle' || isLoading || syncStatus === 'syncing') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-warm-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-2xl">🎮</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-game">Loading your adventure...</p>
          </div>
        </div>
      );
    }

    // User profile loaded but hasn't completed onboarding
    if (!hasCompletedOnboarding) {
      return <OnboardingFlow />;
    }
  }

  // For mock mode, also show onboarding if user exists but hasn't completed it
  if (!isRealBackend() && user && !hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes - only accessible when NOT logged in */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <Login />
              </GuestGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestGuard>
                <SignUp />
              </GuestGuard>
            }
          />

          {/* Protected routes - require auth when Firebase is configured */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <AppContent />
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
