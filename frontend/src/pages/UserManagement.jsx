import { useState, useEffect } from 'react';
import { 
  Search, Filter, UserPlus, Edit2, 
  Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './UserManagement.css';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Users');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to access this page.');
      } else {
        setError('Failed to load users. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to completely delete ${userName}? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesFilter = true;
    if (filterType === 'Active') matchesFilter = user.status === 'active';
    else if (filterType === 'Disabled') matchesFilter = user.status === 'disabled';
    else if (filterType === 'Admins') matchesFilter = user.role === 'admin';
    else if (filterType === 'Students') matchesFilter = user.role === 'student';

    return matchesSearch && matchesFilter;
  });

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Never';

    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 2) return Math.floor(interval) + " days ago";
    if (interval >= 1 && interval < 2) return "Yesterday";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) return (
    <div className="loading-screen glass-panel">
      <div className="loader"></div>
      <p>Loading Users...</p>
    </div>
  );

  if (error) return (
    <div className="page-center text-error glass-panel" style={{ padding: '3rem', margin: '2rem auto', maxWidth: '600px' }}>
      <h2>Access Error</h2>
      <p>{error}</p>
      <button className="btn btn-outline mt-4" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
    </div>
  );

  return (
    <div className="admin-user-management container animate-fade-in">
      <div className="admin-header">
        <div>
          <div className="admin-subtitle">System Administration</div>
          <h1 className="admin-title">User Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-add-user" onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            <ChevronLeft size={18} />
            Go to Home
          </button>
          <button className="btn-add-user" onClick={() => navigate('/register')}>
            <UserPlus size={18} />
            Add New User
          </button>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <Filter className="filter-icon" size={18} />
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1); // Reset to page 1 on filter
            }}
          >
            <option value="All Users">All Users</option>
            <option value="Active">Active Users</option>
            <option value="Disabled">Disabled Users</option>
            <option value="Admins">Admins</option>
            <option value="Students">Students</option>
          </select>
        </div>
      </div>

      <div className="users-table-container glass-panel">
        <table className="users-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name & Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <img 
                      src={user.profileImage && user.profileImage !== 'default-avatar.png'
                        ? (user.profileImage.startsWith('http') 
                            ? user.profileImage 
                            : `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profileImage}`)
                        : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80'} 
                      alt={user.name} 
                      className="table-avatar"
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`table-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <div className={`status-dot ${user.status}`}></div>
                      <span className={`status-text ${user.status}`}>
                        {user.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {timeAgo(user.lastLogin)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <label className="toggle-switch" title={user.status === 'active' ? "Disable User" : "Activate User"}>
                        <input 
                          type="checkbox" 
                          checked={user.status === 'active'}
                          onChange={() => handleToggleStatus(user._id, user.status)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button className="action-btn edit" title="Edit User">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Delete User"
                        onClick={() => handleDeleteUser(user._id, user.name)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredUsers.length > 0 && (
          <div className="pagination">
            <div className="pagination-text">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                // Keep pagination window small (showing +/- 1 around current)
                if (
                  totalPages <= 5 || 
                  idx === 0 || 
                  idx === totalPages - 1 || 
                  Math.abs(currentPage - (idx + 1)) <= 1
                ) {
                  return (
                    <button 
                      key={idx + 1}
                      className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  );
                } else if (idx === 1 && currentPage > 3) {
                  return <span key="ellipsis1" style={{ color: 'var(--text-muted)' }}>...</span>;
                } else if (idx === totalPages - 2 && currentPage < totalPages - 2) {
                  return <span key="ellipsis2" style={{ color: 'var(--text-muted)' }}>...</span>;
                }
                return null;
              })}

              <button 
                className="page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
