import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';

interface MeetingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'availability' | 'pending';
  description?: string;
  with?: string;
  status?: 'confirmed' | 'pending' | 'declined';
}

interface MeetingRequest {
  id: string;
  from: string;
  role: string;
  proposedTime: string;
  duration: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
}

const INITIAL_EVENTS: MeetingEvent[] = [
  {
    id: '1',
    title: 'Available',
    start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00',
    end:   new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T12:00:00',
    type: 'availability',
  },
  {
    id: '2',
    title: 'Meeting: Michael Rodriguez',
    start: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] + 'T14:00:00',
    end:   new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] + 'T15:00:00',
    type: 'meeting',
    with: 'Michael Rodriguez',
    status: 'confirmed',
    description: 'Discuss Series A investment terms',
  },
  {
    id: '3',
    title: 'Pending: Jennifer Lee',
    start: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T11:00:00',
    end:   new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T11:30:00',
    type: 'pending',
    with: 'Jennifer Lee',
    status: 'pending',
  },
];

const MEETING_REQUESTS: MeetingRequest[] = [
  {
    id: 'r1',
    from: 'Alex Chen',
    role: 'Investor',
    proposedTime: new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at 3:00 PM',
    duration: '30 min',
    message: 'Would love to discuss your AI platform and explore potential investment opportunities.',
    status: 'pending',
  },
  {
    id: 'r2',
    from: 'Priya Sharma',
    role: 'Investor',
    proposedTime: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at 10:00 AM',
    duration: '45 min',
    message: 'Following up on our last conversation — ready to move forward with due diligence.',
    status: 'pending',
  },
];

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<MeetingEvent[]>(INITIAL_EVENTS);
  const [requests, setRequests] = useState<MeetingRequest[]>(MEETING_REQUESTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '09:00', endTime: '17:00' });
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests'>('calendar');

  const calendarEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    classNames: [
      e.type === 'availability' ? 'fc-availability' :
      e.type === 'pending'      ? 'fc-pending'      : 'fc-meeting'
    ],
    extendedProps: e,
  }));

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setNewSlot(s => ({ ...s, date: arg.dateStr }));
    setShowAddModal(true);
  };

  const handleEventClick = (arg: { event: { extendedProps: { type: string; [key: string]: unknown } } }) => {
    setSelectedEvent(arg.event.extendedProps as MeetingEvent);
    setShowEventModal(true);
  };

  const handleAddSlot = () => {
    if (!newSlot.date) return;
    const ev: MeetingEvent = {
      id: Date.now().toString(),
      title: 'Available',
      start: `${newSlot.date}T${newSlot.startTime}:00`,
      end: `${newSlot.date}T${newSlot.endTime}:00`,
      type: 'availability',
    };
    setEvents(prev => [...prev, ev]);
    setShowAddModal(false);
    setNewSlot({ date: '', startTime: '09:00', endTime: '17:00' });
  };

  const handleRequest = (id: string, action: 'accepted' | 'declined') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (action === 'accepted') {
      const req = requests.find(r => r.id === id);
      if (req) {
        const tomorrow = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
        const ev: MeetingEvent = {
          id: Date.now().toString(),
          title: `Meeting: ${req.from}`,
          start: `${tomorrow}T15:00:00`,
          end:   `${tomorrow}T15:30:00`,
          type: 'meeting',
          with: req.from,
          status: 'confirmed',
          description: req.message,
        };
        setEvents(prev => [...prev, ev]);
      }
    }
  };

  const confirmedMeetings = events.filter(e => e.type === 'meeting' && e.status === 'confirmed');
  const availabilitySlots = events.filter(e => e.type === 'availability');
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexus-text-primary)', margin: 0 }}>
            Meeting Calendar
          </h1>
          <p style={{ color: 'var(--nexus-text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Manage your availability and meeting schedule
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'var(--nexus-primary)', color: 'white', border: 'none',
            borderRadius: 'var(--nexus-radius-sm)', padding: '10px 18px',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          + Add Availability
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Confirmed Meetings', value: confirmedMeetings.length, color: 'var(--nexus-primary)', bg: 'var(--nexus-primary-light)' },
          { label: 'Availability Slots', value: availabilitySlots.length, color: 'var(--nexus-success)', bg: 'var(--nexus-success-light)' },
          { label: 'Pending Requests', value: pendingCount, color: 'var(--nexus-warning)', bg: 'var(--nexus-warning-light)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: 'var(--nexus-radius)', padding: '16px 20px',
            border: '1px solid var(--nexus-border)', boxShadow: 'var(--nexus-shadow)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--nexus-text-secondary)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f1f5f9', borderRadius: 10, padding: '4px', width: 'fit-content' }}>
        {(['calendar', 'requests'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              background: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? 'var(--nexus-text-primary)' : 'var(--nexus-text-secondary)',
              boxShadow: activeTab === tab ? 'var(--nexus-shadow)' : 'none',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            {tab === 'calendar' ? 'Calendar View' : 'Meeting Requests'}
            {tab === 'requests' && pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--nexus-danger)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          {/* Calendar */}
          <div style={{ background: 'white', borderRadius: 'var(--nexus-radius)', padding: '20px', border: '1px solid var(--nexus-border)', boxShadow: 'var(--nexus-shadow)' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              nowIndicator
              editable={false}
              selectable
            />
          </div>

          {/* Upcoming meetings sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Legend */}
            <div style={{ background: 'white', borderRadius: 'var(--nexus-radius)', padding: '16px', border: '1px solid var(--nexus-border)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 12, color: 'var(--nexus-text-primary)' }}>Legend</p>
              {[
                { color: '#16a34a', bg: '#dcfce7', label: 'Available slot' },
                { color: '#2563eb', bg: '#2563eb', label: 'Confirmed meeting', textColor: 'white' },
                { color: '#d97706', bg: '#fef3c7', label: 'Pending request' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.color}` }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--nexus-text-secondary)' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Upcoming */}
            <div style={{ background: 'white', borderRadius: 'var(--nexus-radius)', padding: '16px', border: '1px solid var(--nexus-border)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 12, color: 'var(--nexus-text-primary)' }}>
                Upcoming Confirmed
              </p>
              {confirmedMeetings.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--nexus-text-muted)' }}>No confirmed meetings yet</p>
              ) : confirmedMeetings.map(m => (
                <div key={m.id} style={{
                  padding: '10px 12px', borderRadius: 8, background: 'var(--nexus-primary-light)',
                  border: '1px solid #bfdbfe', marginBottom: 8,
                }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--nexus-primary)', margin: '0 0 2px' }}>{m.with}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--nexus-text-secondary)', margin: 0 }}>
                    {new Date(m.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(m.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  {m.description && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--nexus-text-muted)' }}>No meeting requests</div>
          )}
          {requests.map(req => (
            <div key={req.id} style={{
              background: 'white', borderRadius: 'var(--nexus-radius)', padding: '20px',
              border: '1px solid var(--nexus-border)', boxShadow: 'var(--nexus-shadow)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--nexus-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--nexus-primary)', fontSize: '0.9rem' }}>
                    {req.from.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--nexus-text-primary)', margin: 0 }}>{req.from}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--nexus-text-muted)', margin: 0 }}>{req.role}</p>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    background: req.status === 'pending' ? '#fef3c7' : req.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                    color: req.status === 'pending' ? '#92400e' : req.status === 'accepted' ? '#166534' : '#991b1b',
                  }}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--nexus-text-secondary)', margin: '8px 0 4px' }}>{req.message}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--nexus-text-muted)' }}>
                  <span>📅 {req.proposedTime}</span>
                  <span>⏱ {req.duration}</span>
                </div>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleRequest(req.id, 'declined')}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', color: 'var(--nexus-text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, 'accepted')}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Availability Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px', width: '100%', maxWidth: '420px', boxShadow: 'var(--nexus-shadow-lg)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>Add Availability Slot</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>Date</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot(s => ({ ...s, date: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>Start Time</label>
                  <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>End Time</label>
                  <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Cancel
              </button>
              <button onClick={handleAddSlot}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px', width: '100%', maxWidth: '380px', boxShadow: 'var(--nexus-shadow-lg)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>{selectedEvent.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--nexus-text-secondary)' }}>
              {selectedEvent.with && <p style={{ margin: 0 }}>👤 With: <strong style={{ color: 'var(--nexus-text-primary)' }}>{selectedEvent.with}</strong></p>}
              <p style={{ margin: 0 }}>📅 {new Date(selectedEvent.start).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style={{ margin: 0 }}>🕐 {new Date(selectedEvent.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – {new Date(selectedEvent.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
              {selectedEvent.description && <p style={{ margin: 0 }}>📝 {selectedEvent.description}</p>}
              {selectedEvent.status && (
                <span style={{
                  display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, width: 'fit-content',
                  background: selectedEvent.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                  color: selectedEvent.status === 'confirmed' ? '#166534' : '#92400e',
                }}>{selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}</span>
              )}
            </div>
            <button onClick={() => setShowEventModal(false)}
              style={{ width: '100%', marginTop: 20, padding: '10px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};