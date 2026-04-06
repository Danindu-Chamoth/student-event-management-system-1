import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import './EventCard.css';

export default function EventCard({ event }) {
  const imageUrl = event.image 
    ? `http://localhost:5000/uploads/${event.image}` 
    : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231e293b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

  const date = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const statusCode = event.status ? event.status.toLowerCase() : 'upcoming';

  return (
    <div className="event-card glass-panel animate-fade-in">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={event.title} className="card-image" />
        <span className="card-category">{event.category}</span>
        {event.isFeatured && <span className="card-featured">🌟 Featured</span>}
        {event.isDraft && <span className="card-draft">DRAFT</span>}
      </div>
      <div className="card-content">
        <div className="status-indicator">
          <span className={`status-dot status-${statusCode}`}></span>
          {event.status || 'Upcoming'}
        </div>
        <h3 className="card-title">{event.title}</h3>
        
        <div className="card-details">
          <div className="detail-item">
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div className="detail-item">
            <Users size={16} />
            <span>{event.registeredCount || 0} / {event.capacity} Registered</span>
          </div>
        </div>

        <Link to={`/events/${event._id}`} className="btn btn-outline card-action">
          View Details
        </Link>
      </div>
    </div>
  );
}
