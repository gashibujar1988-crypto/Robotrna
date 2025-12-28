import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-white min-h-screen text-gray-900 selection:bg-purple-100 selection:text-purple-900">
          <Routes>
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <><Navbar /><Dashboard /><Footer /></>
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

            <Route path="/agent/:id" element={<><Navbar /><AgentInfo /><Footer /></>} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            <Route path="/mother" element={<><Navbar /><MotherPage /><Footer /></>} />
            <Route path="/pricing" element={<><Navbar /><PricingPage /><Footer /></>} />
            <Route path="/developers" element={<><Navbar /><DevelopersPage /><Footer /></>} />
            <Route path="/settings" element={<SettingsPage />} />


            <Route path="/solutions" element={<><Navbar /><SolutionsPage /><Footer /></>} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/brain" element={<BrainPage />} />
            <Route
              path="/support"
              element={
                <PrivateRoute>
                  <SupportPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <CookieConsent />
      </AuthProvider>
    </Router>
  );
}

export default App;
