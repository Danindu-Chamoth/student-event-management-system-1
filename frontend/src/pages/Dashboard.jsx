import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import './Dashboard.css';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => {
    if (!showDrafts && e.isDraft) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      if (!e.title.toLowerCase().includes(lowerSearch)) {
        return false;
      }
    }
    return true;
  });

  const uniqueCategories = [...new Set(events.map(e => e.category))].filter(Boolean);

  if (loading) return <div className="page-center"><div className="loader"></div></div>;
  if (error) return <div className="page-center text-error">{error}</div>;

  return (
    <div className="dashboard container animate-fade-in">
      <div className="dashboard-header">
        <h2>Event Dashboard</h2>
        <p className="text-muted">Discover and manage amazing events happening around you.</p>
      </div>

      <div className="filters-container glass-panel">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search events by title..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <label className="draft-toggle">
            <input type="checkbox" checked={showDrafts} onChange={e => setShowDrafts(e.target.checked)} />
            <span>Show Drafts</span>
          </label>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="page-center" style={{ minHeight: '40vh' }}>
          <h2>No Events Found</h2>
          <p className="text-muted text-center mt-2">Get started by creating a new event.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="page-center" style={{ minHeight: '40vh' }}>
          <h3>No events match your filters.</h3>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
