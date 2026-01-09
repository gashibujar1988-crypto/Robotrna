import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RobotWorkspace from './pages/RobotWorkspace';

import AgentInfo from './pages/AgentInfo';
import BrainPage from './pages/BrainPage';
import SolutionsPage from './pages/SolutionsPage';
import AgentsPage from './pages/AgentsPage';
import SupportPage from './pages/SupportPage';
import HowItWorksPage from './pages/HowItWorksPage';

import MotherPage from './pages/MotherPage';
import PricingPage from './pages/PricingPage';
import DevelopersPage from './pages/DevelopersPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import N8nDemoPage from './pages/N8nDemoPage';
import SystemArchitecture from './pages/SystemArchitecture';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Page transition wrapper for smooth animations
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

import GlobalNotifications from './components/GlobalNotifications';

// Animated routes component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Navbar /><Home /><Footer /></PageWrapper>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PageWrapper><Navbar /><Dashboard /><Footer /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route
          path="/system"
          element={
            <PrivateRoute>
              <PageWrapper><Navbar /><SystemArchitecture /><Footer /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route
          path="/robot/:id"
          element={
            <PrivateRoute>
              <RobotWorkspace />
            </PrivateRoute>
          }
        />
        {/* Alias route for Dashboard Concierge links */}
        <Route
          path="/workspace/:id"
          element={
            <PrivateRoute>
              <RobotWorkspace />
            </PrivateRoute>
          }
        />

        <Route path="/n8n-demo" element={<PageWrapper><N8nDemoPage /></PageWrapper>} />
        <Route path="/agent/:id" element={<PageWrapper><Navbar /><AgentInfo /><Footer /></PageWrapper>} />
        <Route path="/how-it-works" element={<PageWrapper><HowItWorksPage /></PageWrapper>} />

        <Route path="/mother" element={<PageWrapper><Navbar /><MotherPage /><Footer /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Navbar /><PricingPage /><Footer /></PageWrapper>} />
        <Route path="/developers" element={<PageWrapper><Navbar /><DevelopersPage /><Footer /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><AnalyticsPage /></PageWrapper>} />

        <Route path="/solutions" element={<PageWrapper><Navbar /><SolutionsPage /><Footer /></PageWrapper>} />
        <Route path="/agents" element={<PageWrapper><AgentsPage /></PageWrapper>} />
        <Route path="/brain" element={<PageWrapper><BrainPage /></PageWrapper>} />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <PageWrapper>
                <Navbar />
                <SupportPage />
                <Footer />
              </PageWrapper>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalNotifications />
        <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 selection:bg-purple-100 dark:selection:bg-purple-900 selection:text-purple-900 dark:selection:text-purple-100 transition-colors duration-300">
          <AnimatedRoutes />
        </div>
        <CookieConsent />
      </AuthProvider>
    </Router>
  );
}

export default App;
