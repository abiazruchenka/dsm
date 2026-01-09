import './Events.css';
import { useTranslation } from 'react-i18next';
import Divider from '../common/Divider';
import { getEvents } from '../../services/eventData';

export default function Events() {
  const { t } = useTranslation();
  const events = getEvents();

  return (
    <section className="events-page">
      <div className="events-inner">
        <Divider className="brown" />
        <h2 className="events-title">{t('events.title')}</h2>
        <Divider className="brown" />
        
        <ul className="events-list">
          {events.map((ev) => (
            <li className="event-item" key={ev.id}>
              <div className="event-image">
                <img src={ev.image} alt={ev.title} loading="lazy" />
              </div>
              <div className="event-content">
                <h3 className="event-title">{ev.title}</h3>
                <time className="event-date">{ev.date}</time>
                <p className="event-desc">{ev.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
