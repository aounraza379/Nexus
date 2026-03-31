import React, { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle, XCircle, Smartphone, Key, Lock, AlertTriangle } from 'lucide-react';

const getStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (pw.length >= 12)             score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  if (score <= 1) return { score, label: 'Weak',      color: '#dc2626' };
  if (score <= 2) return { score, label: 'Fair',      color: '#d97706' };
  if (score <= 3) return { score, label: 'Good',      color: '#2563eb' };
  if (score <= 4) return { score, label: 'Strong',    color: '#16a34a' };
  return                { score, label: 'Very Strong', color: '#15803d' };
};

export const SecurityPage: React.FC = () => {
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaved, setPwSaved]       = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep]   = useState<'off' | 'qr' | 'otp' | 'done'>('off');
  const [otpInput, setOtpInput]     = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]     = useState(false);

  // Session / activity (mock)
  const sessions = [
    { device: 'Chrome · Windows 11',   location: 'Karachi, PK', time: 'Active now',    current: true },
    { device: 'Safari · iPhone 15',    location: 'Karachi, PK', time: '2 hours ago',   current: false },
    { device: 'Firefox · MacBook Pro', location: 'Lahore, PK',  time: '3 days ago',    current: false },
  ];

  const strength = getStrength(newPw);
  const pwMatch  = newPw && confirmPw && newPw === confirmPw;
  const canSave  = currentPw && newPw.length >= 8 && pwMatch;

  const handleSavePw = () => {
    if (!canSave) return;
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 3000);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpInput];
    next[i] = val;
    setOtpInput(next);
    setOtpError(false);
    if (val && i < 5) {
      const nextEl = document.getElementById(`otp-${i + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpVerify = () => {
    const code = otpInput.join('');
    if (code === '123456') {
      setTwoFAStep('done');
      setTwoFAEnabled(true);
    } else {
      setOtpError(true);
      setOtpInput(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const disableTwoFA = () => {
    setTwoFAEnabled(false);
    setTwoFAStep('off');
    setOtpInput(['', '', '', '', '', '']);
  };

  const PasswordInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string }> =
    ({ label, value, onChange, show, onToggle, placeholder }) => (
      <div>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
        <div style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--nexus-text-muted)' }} />
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder ?? '••••••••'}
            style={{ width: '100%', padding: '9px 40px 9px 34px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
          />
          <button type="button" onClick={onToggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nexus-text-muted)' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    );

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexus-text-primary)', margin: 0 }}>Security</h1>
        <p style={{ color: 'var(--nexus-text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>Manage your account security settings</p>
      </div>

      {/* ── Password Section ── */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--nexus-border)', padding: '24px', marginBottom: 20, boxShadow: 'var(--nexus-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--nexus-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={18} color="var(--nexus-primary)" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--nexus-text-primary)' }}>Change Password</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--nexus-text-muted)', margin: 0 }}>Use a strong, unique password</p>
          </div>
          {pwSaved && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nexus-success)', fontSize: '0.82rem', fontWeight: 600 }}>
              <CheckCircle size={14} /> Saved!
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PasswordInput label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordInput label="New Password"     value={newPw}     onChange={setNewPw}     show={showNew}     onToggle={() => setShowNew(v => !v)}     placeholder="Min. 8 characters" />

          {/* Strength meter */}
          {newPw.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--nexus-text-secondary)' }}>Password strength</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>{strength.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 0.3s', background: i <= strength.score ? strength.color : '#e2e8f0' }} />
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { label: '8+ chars',       ok: newPw.length >= 8 },
                  { label: 'Uppercase',       ok: /[A-Z]/.test(newPw) },
                  { label: 'Number',          ok: /[0-9]/.test(newPw) },
                  { label: 'Special char',   ok: /[^A-Za-z0-9]/.test(newPw) },
                ].map(c => (
                  <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: c.ok ? '#dcfce7' : '#f1f5f9', color: c.ok ? '#166534' : 'var(--nexus-text-muted)' }}>
                    {c.ok ? <CheckCircle size={11} /> : <XCircle size={11} />} {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <PasswordInput label="Confirm Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          {confirmPw && (
            <p style={{ fontSize: '0.78rem', margin: '-8px 0 0', color: pwMatch ? 'var(--nexus-success)' : 'var(--nexus-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {pwMatch ? <><CheckCircle size={13} /> Passwords match</> : <><XCircle size={13} /> Passwords don't match</>}
            </p>
          )}
        </div>

        <button onClick={handleSavePw} disabled={!canSave} style={{
          marginTop: 20, padding: '10px 24px', borderRadius: 10, border: 'none',
          background: canSave ? 'var(--nexus-primary)' : '#e2e8f0',
          color: canSave ? 'white' : 'var(--nexus-text-muted)',
          fontWeight: 700, fontSize: '0.875rem', cursor: canSave ? 'pointer' : 'not-allowed',
        }}>
          Update Password
        </button>
      </div>

      {/* ── 2FA Section ── */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--nexus-border)', padding: '24px', marginBottom: 20, boxShadow: 'var(--nexus-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: twoFAEnabled ? 'var(--nexus-success-light)' : 'var(--nexus-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={18} color={twoFAEnabled ? 'var(--nexus-success)' : 'var(--nexus-warning)'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--nexus-text-primary)' }}>Two-Factor Authentication</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--nexus-text-muted)', margin: 0 }}>Add an extra layer of security via OTP</p>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: twoFAEnabled ? '#dcfce7' : '#fee2e2', color: twoFAEnabled ? '#166534' : '#991b1b' }}>
            {twoFAEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Step: off */}
        {twoFAStep === 'off' && !twoFAEnabled && (
          <button onClick={() => setTwoFAStep('qr')} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
            Enable 2FA
          </button>
        )}

        {/* Step: QR */}
        {twoFAStep === 'qr' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--nexus-text-secondary)', marginBottom: 16 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {/* Mock QR */}
            <div style={{ width: 160, height: 160, background: '#f8fafc', border: '1px solid var(--nexus-border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, padding: 12 }}>
              <svg width="136" height="136" viewBox="0 0 136 136">
                {/* Simple QR-like pattern mock */}
                {[...Array(17)].map((_, r) =>
                  [...Array(17)].map((_, c) => {
                    const isCorner = (r < 7 && c < 7) || (r < 7 && c > 9) || (r > 9 && c < 7);
                    const fill = isCorner ? (r === 0 || r === 6 || c === 0 || c === 6 ? '#000' : r > 0 && r < 6 && c > 0 && c < 6 ? (r > 1 && r < 5 && c > 1 && c < 5 ? '#000' : '#fff') : '#fff') : Math.random() > 0.55 ? '#000' : '#fff';
                    return <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width={7} height={7} fill={fill} />;
                  })
                )}
              </svg>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--nexus-text-muted)', marginBottom: 16 }}>
              Manual key: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>NEXUS-2FA-DEMO-KEY</code>
            </p>
            <button onClick={() => setTwoFAStep('otp')} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              I've scanned it →
            </button>
          </div>
        )}

        {/* Step: OTP input */}
        {twoFAStep === 'otp' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--nexus-text-secondary)', marginBottom: 16 }}>
              Enter the 6-digit code from your authenticator app.
              <br /><span style={{ color: 'var(--nexus-text-muted)', fontSize: '0.78rem' }}>Demo: use <strong>123456</strong></span>
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {otpInput.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
                  }}
                  style={{
                    width: 44, height: 52, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
                    borderRadius: 10, border: `2px solid ${otpError ? 'var(--nexus-danger)' : digit ? 'var(--nexus-primary)' : 'var(--nexus-border)'}`,
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                />
              ))}
            </div>
            {otpError && <p style={{ color: 'var(--nexus-danger)', fontSize: '0.8rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={13} /> Incorrect code. Try 123456.</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setTwoFAStep('off'); setOtpInput(['', '', '', '', '', '']); }} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleOtpVerify} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Verify</button>
            </div>
          </div>
        )}

        {/* Step: done */}
        {(twoFAStep === 'done' || twoFAEnabled) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--nexus-success-light)', borderRadius: 10, marginBottom: 16 }}>
              <CheckCircle size={16} color="var(--nexus-success)" />
              <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, fontWeight: 600 }}>Two-factor authentication is active on your account.</p>
            </div>
            <button onClick={disableTwoFA} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--nexus-danger)', background: 'white', color: 'var(--nexus-danger)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      {/* ── Active Sessions ── */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--nexus-border)', padding: '24px', boxShadow: 'var(--nexus-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#7c3aed" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--nexus-text-primary)' }}>Active Sessions</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--nexus-text-muted)', margin: 0 }}>Devices currently logged into your account</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--nexus-border)', background: s.current ? 'var(--nexus-primary-light)' : 'white' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0 0 2px', color: 'var(--nexus-text-primary)' }}>{s.device}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--nexus-text-muted)', margin: 0 }}>{s.location} · {s.time}</p>
              </div>
              {s.current
                ? <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--nexus-primary)', color: 'white' }}>Current</span>
                : <button style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 8, border: '1px solid var(--nexus-danger)', background: 'white', color: 'var(--nexus-danger)', cursor: 'pointer' }}>Revoke</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};