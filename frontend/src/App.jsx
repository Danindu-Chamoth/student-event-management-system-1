import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import EventForm from './pages/EventForm';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import UserManagement from './pages/UserManagement';
import VerifyEmailInfo from './pages/VerifyEmailInfo';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/register', '/login', '/profile', '/verify-info', '/settings', '/forgot-password', '/reset-password'];
  const profileRoutes = ['/profile', '/settings'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/profile/');
  const isProfilePage = profileRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-info" element={<VerifyEmailInfo />} />
          <Route path="/profile" element={<Profile defaultTab="overview" />} />
          <Route path="/settings" element={<Profile defaultTab="settings" />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
