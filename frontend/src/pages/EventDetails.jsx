import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Edit, Trash2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get('/events');
      const found = data.find(e => e._id === id);
      if (found) setEvent(found);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };



  if (loading) return <div className="page-center"><div className="loader"></div></div>;
  if (!event) return <div className="page-center"><h2>Event Not Found</h2><Link to="/dashboard" className="btn btn-primary mt-2">Go Back</Link></div>;

  const imageUrl = event.image ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${event.image}` : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231e293b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
  const date = new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const deadline = new Date(event.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isFull = event.registeredCount >= event.capacity;
  const isInactive = event.status !== 'Upcoming';

  return (
    <div className="event-details container animate-fade-in">
      <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Back to Events</Link>
      
      <div className="details-header glass-panel">
        <img src={imageUrl} alt={event.title} className="details-image" />
        <div className="details-content">
          <div className="details-meta" style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
            <span className="badge">{event.category}</span>
            {event.isFeatured && <span className="badge badge-featured">🌟 Featured</span>}
            {event.isDraft && <span className="badge badge-draft">DRAFT</span>}
          </div>
          <div className="status-indicator">
            <span className={`status-dot status-${event.status?.toLowerCase() || 'upcoming'}`}></span>
            {event.status || 'Upcoming'}
          </div>
          <h1 className="details-title" style={{marginTop: '0.5rem'}}>{event.title}</h1>
          
          <div className="details-info-grid">
            <div className="info-item">
              <Calendar className="icon-accent" />
              <div>
                <p className="info-label">Date</p>
                <p className="info-value">{date}</p>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="icon-accent" />
              <div>
                <p className="info-label">Location</p>
                <p className="info-value">{event.location}</p>
              </div>
            </div>
            <div className="info-item">
              <Users className="icon-accent" />
              <div>
                <p className="info-label">Capacity</p>
                <p className="info-value">{event.registeredCount || 0} / {event.capacity}</p>
              </div>
            </div>
          </div>
          
          <div className="details-actions">
            <div className="action-group">
              <Link to={`/edit/${event._id}`} className="btn btn-outline"><Edit size={18} /> Edit</Link>
              <button onClick={handleDelete} className="btn btn-danger"><Trash2 size={18} /> Delete</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-body glass-panel">
        <h2>About this Event</h2>
        <p className="details-description">{event.description}</p>
        <div className="deadline-notice">
          <strong>Registration Deadline:</strong> {deadline}
        </div>
      </div>
    </div>
  );
}
