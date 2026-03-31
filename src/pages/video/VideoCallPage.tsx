import React, { useState, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor,
  MonitorOff, Users, MessageCircle, MoreVertical, Phone
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  initials: string;
}

const CONTACTS: Contact[] = [
  { id: '1', name: 'Michael Rodriguez', role: 'Investor',     status: 'online',  initials: 'MR' },
  { id: '2', name: 'Jennifer Lee',       role: 'Investor',     status: 'online',  initials: 'JL' },
  { id: '3', name: 'Alex Chen',          role: 'Investor',     status: 'busy',    initials: 'AC' },
  { id: '4', name: 'Priya Sharma',       role: 'Investor',     status: 'offline', initials: 'PS' },
  { id: '5', name: 'David Kim',          role: 'Entrepreneur', status: 'online',  initials: 'DK' },
];

type CallState = 'idle' | 'calling' | 'in-call';

export const VideoCallPage: React.FC = () => {
  const [callState, setCallState]       = useState<CallState>('idle');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [videoOn, setVideoOn]           = useState(true);
  const [audioOn, setAudioOn]           = useState(true);
  const [screenShare, setScreenShare]   = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat]         = useState(false);
  const [chatMsg, setChatMsg]           = useState('');
  const [chatHistory, setChatHistory]   = useState<{ from: string; text: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = (contact: Contact) => {
    setActiveContact(contact);
    setCallState('calling');
    setTimeout(() => {
      setCallState('in-call');
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }, 2000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('idle');
    setActiveContact(null);
    setCallDuration(0);
    setVideoOn(true);
    setAudioOn(true);
    setScreenShare(false);
    setShowChat(false);
    setChatHistory([]);
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(h => [...h, { from: 'You', text: chatMsg.trim() }]);
    setChatMsg('');
    setTimeout(() => {
      setChatHistory(h => [...h, { from: activeContact?.name ?? 'Them', text: 'Got it, thanks!' }]);
    }, 1200);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const statusColor = (s: Contact['status']) =>
    s === 'online' ? '#16a34a' : s === 'busy' ? '#d97706' : '#94a3b8';

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexus-text-primary)', margin: 0 }}>
          Video Calls
        </h1>
        <p style={{ color: 'var(--nexus-text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Connect face-to-face with investors and entrepreneurs
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: callState !== 'idle' ? '1fr 320px' : '1fr', gap: '20px' }}>

        {/* ── CALL AREA ── */}
        {callState !== 'idle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Main video */}
            <div style={{
              background: '#0f172a', borderRadius: 16, aspectRatio: '16/9',
              position: 'relative', overflow: 'hidden', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Remote video placeholder */}
              {videoOn ? (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--nexus-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>
                    {activeContact?.initials}
                  </div>
                  {callState === 'calling' && (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Calling {activeContact?.name}…</p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <VideoOff size={40} color="#475569" />
                  <p style={{ color: '#475569', margin: 0, fontSize: '0.85rem' }}>Camera off</p>
                </div>
              )}

              {/* Status badge */}
              {callState === 'in-call' && (
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: 600 }}>{formatDuration(callDuration)}</span>
                </div>
              )}

              {/* Screen share badge */}
              {screenShare && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(37,99,235,0.85)', borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>Sharing screen</span>
                </div>
              )}

              {/* Self video PiP */}
              <div style={{
                position: 'absolute', bottom: 14, right: 14,
                width: 140, height: 90, borderRadius: 10,
                background: '#1e293b', border: '2px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
                    You
                  </div>
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div style={{
              background: 'white', borderRadius: 14, padding: '16px 24px',
              border: '1px solid var(--nexus-border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: 'var(--nexus-shadow)',
            }}>
              {/* Audio */}
              <button onClick={() => setAudioOn(a => !a)} style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: audioOn ? '#f1f5f9' : '#fee2e2',
                color: audioOn ? 'var(--nexus-text-primary)' : 'var(--nexus-danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }} title={audioOn ? 'Mute' : 'Unmute'}>
                {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              {/* Video */}
              <button onClick={() => setVideoOn(v => !v)} style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: videoOn ? '#f1f5f9' : '#fee2e2',
                color: videoOn ? 'var(--nexus-text-primary)' : 'var(--nexus-danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }} title={videoOn ? 'Turn off camera' : 'Turn on camera'}>
                {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              {/* Screen share */}
              <button onClick={() => setScreenShare(s => !s)} style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: screenShare ? '#eff6ff' : '#f1f5f9',
                color: screenShare ? 'var(--nexus-primary)' : 'var(--nexus-text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }} title={screenShare ? 'Stop sharing' : 'Share screen'}>
                {screenShare ? <MonitorOff size={20} /> : <Monitor size={20} />}
              </button>

              {/* Chat toggle */}
              <button onClick={() => setShowChat(c => !c)} style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: showChat ? '#eff6ff' : '#f1f5f9',
                color: showChat ? 'var(--nexus-primary)' : 'var(--nexus-text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }} title="In-call chat">
                <MessageCircle size={20} />
              </button>

              {/* End call */}
              <button onClick={endCall} style={{
                width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'var(--nexus-danger)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
              }} title="End call">
                <PhoneOff size={22} />
              </button>
            </div>

            {/* In-call chat panel */}
            {showChat && (
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--nexus-border)', padding: '16px', boxShadow: 'var(--nexus-shadow)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 12px', color: 'var(--nexus-text-primary)' }}>In-call Chat</p>
                <div style={{ height: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {chatHistory.length === 0 && <p style={{ color: 'var(--nexus-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: 40 }}>No messages yet</p>}
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{ textAlign: m.from === 'You' ? 'right' : 'left' }}>
                      <span style={{
                        display: 'inline-block', padding: '6px 12px', borderRadius: 10, fontSize: '0.82rem',
                        background: m.from === 'You' ? 'var(--nexus-primary)' : '#f1f5f9',
                        color: m.from === 'You' ? 'white' : 'var(--nexus-text-primary)',
                      }}>{m.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message…"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button onClick={sendChat} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (

          /* ── IDLE STATE — contact grid ── */
          <div>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--nexus-border)', padding: '24px', boxShadow: 'var(--nexus-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Users size={18} color="var(--nexus-text-secondary)" />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--nexus-text-primary)', margin: 0 }}>Your Connections</p>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--nexus-text-muted)' }}>
                  {CONTACTS.filter(c => c.status === 'online').length} online
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {CONTACTS.map(contact => (
                  <div key={contact.id} style={{
                    border: '1px solid var(--nexus-border)', borderRadius: 12, padding: '20px 16px',
                    textAlign: 'center', transition: 'box-shadow 0.15s',
                    cursor: contact.status === 'offline' ? 'default' : 'pointer',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--nexus-shadow-md)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--nexus-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--nexus-primary)' }}>
                        {contact.initials}
                      </div>
                      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: statusColor(contact.status), border: '2px solid white' }} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--nexus-text-primary)', margin: '0 0 2px' }}>{contact.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--nexus-text-muted)', margin: '0 0 12px' }}>{contact.role}</p>
                    <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: contact.status === 'online' ? '#dcfce7' : contact.status === 'busy' ? '#fef3c7' : '#f1f5f9', color: statusColor(contact.status) }}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button
                        onClick={() => contact.status !== 'offline' && startCall(contact)}
                        disabled={contact.status === 'offline'}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: contact.status === 'offline' ? 'not-allowed' : 'pointer',
                          background: contact.status === 'offline' ? '#f1f5f9' : 'var(--nexus-primary)',
                          color: contact.status === 'offline' ? 'var(--nexus-text-muted)' : 'white',
                          fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}
                      >
                        <Video size={14} /> Video
                      </button>
                      <button
                        onClick={() => contact.status !== 'offline' && startCall(contact)}
                        disabled={contact.status === 'offline'}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--nexus-border)', cursor: contact.status === 'offline' ? 'not-allowed' : 'pointer',
                          background: 'white', color: contact.status === 'offline' ? 'var(--nexus-text-muted)' : 'var(--nexus-text-secondary)',
                          fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}
                      >
                        <Phone size={14} /> Audio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT PANEL — recent calls (only in idle) ── */}
        {callState === 'idle' && (
          <div style={{ display: 'none' }} /> // hidden in single-col idle layout
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};