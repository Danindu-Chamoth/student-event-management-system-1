import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import EventForm from './pages/EventForm';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/register', '/login'];
  const profileRoutes = ['/profile'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const isProfilePage = profileRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
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
