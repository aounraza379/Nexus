import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'investment';
  amount: number;
  sender: string;
  receiver: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  note?: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'deposit',    amount: 50000,  sender: 'Bank Account',     receiver: 'My Wallet',       status: 'completed', date: '2026-03-25', note: 'Initial deposit' },
  { id: 't2', type: 'investment', amount: 25000,  sender: 'Michael Rodriguez', receiver: 'TechWave AI',    status: 'completed', date: '2026-03-24', note: 'Series A - Tranche 1' },
  { id: 't3', type: 'transfer',   amount: 5000,   sender: 'My Wallet',        receiver: 'Jennifer Lee',    status: 'completed', date: '2026-03-22', note: 'Due diligence fee' },
  { id: 't4', type: 'deposit',    amount: 10000,  sender: 'Bank Account',     receiver: 'My Wallet',       status: 'pending',   date: '2026-03-21' },
  { id: 't5', type: 'withdrawal', amount: 2500,   sender: 'My Wallet',        receiver: 'Bank Account',    status: 'completed', date: '2026-03-20' },
  { id: 't6', type: 'investment', amount: 15000,  sender: 'Alex Chen',        receiver: 'TechWave AI',     status: 'failed',    date: '2026-03-19', note: 'Payment declined' },
  { id: 't7', type: 'transfer',   amount: 3000,   sender: 'My Wallet',        receiver: 'Priya Sharma',    status: 'pending',   date: '2026-03-18' },
];

type ModalType = 'deposit' | 'withdraw' | 'transfer' | null;

export const PaymentsPage: React.FC = () => {
  const [balance]            = useState(82500);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [amount, setAmount]  = useState('');
  const [note, setNote]      = useState('');
  const [recipient, setRecipient] = useState('');
  const [txns, setTxns]      = useState<Transaction[]>(TRANSACTIONS);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleAction = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const now = new Date().toISOString().split('T')[0];
    const newTxn: Transaction = {
      id: Date.now().toString(),
      type: activeModal === 'deposit' ? 'deposit' : activeModal === 'withdraw' ? 'withdrawal' : 'transfer',
      amount: amt,
      sender: activeModal === 'deposit' ? 'Bank Account' : 'My Wallet',
      receiver: activeModal === 'deposit' ? 'My Wallet' : activeModal === 'withdraw' ? 'Bank Account' : (recipient || 'Unknown'),
      status: 'pending',
      date: now,
      note: note || undefined,
    };
    setTxns(prev => [newTxn, ...prev]);
    showSuccess(
      activeModal === 'deposit' ? `Deposit of $${amt.toLocaleString()} initiated` :
      activeModal === 'withdraw' ? `Withdrawal of $${amt.toLocaleString()} initiated` :
      `Transfer of $${amt.toLocaleString()} to ${recipient} initiated`
    );
    setActiveModal(null);
    setAmount('');
    setNote('');
    setRecipient('');
  };

  const filtered = txns.filter(t => filterStatus === 'all' || t.status === filterStatus);
  const totalIn  = txns.filter(t => t.status === 'completed' && (t.type === 'deposit' || (t.type === 'investment' && t.receiver === 'TechWave AI'))).reduce((a, t) => a + t.amount, 0);
  const totalOut = txns.filter(t => t.status === 'completed' && (t.type === 'withdrawal' || t.type === 'transfer')).reduce((a, t) => a + t.amount, 0);
  const pending  = txns.filter(t => t.status === 'pending').length;

  const typeIcon = (type: Transaction['type']) => {
    if (type === 'deposit')    return <ArrowDownLeft size={16} color="#16a34a" />;
    if (type === 'withdrawal') return <ArrowUpRight size={16} color="#dc2626" />;
    if (type === 'transfer')   return <RefreshCw size={16} color="#2563eb" />;
    return <TrendingUp size={16} color="#7c3aed" />;
  };

  const statusBadge = (status: Transaction['status']) => {
    const map = {
      completed: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={12} />, label: 'Completed' },
      pending:   { bg: '#fef3c7', color: '#92400e', icon: <Clock size={12} />,        label: 'Pending' },
      failed:    { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={12} />,      label: 'Failed' },
    };
    const s = map[status];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 600 }}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Success toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: '#16a34a', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', boxShadow: 'var(--nexus-shadow-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexus-text-primary)', margin: 0 }}>Payments</h1>
        <p style={{ color: 'var(--nexus-text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>Manage your wallet, transactions and deal funding</p>
      </div>

      {/* Wallet + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Wallet balance */}
        <div style={{ gridColumn: 'span 1', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: 16, padding: '24px', color: 'white', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.8, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 4px' }}>${balance.toLocaleString()}</p>
          <p style={{ fontSize: '0.78rem', opacity: 0.7, margin: 0 }}>Available funds</p>
        </div>
        {/* Stats */}
        {[
          { label: 'Total In',        value: `$${totalIn.toLocaleString()}`,  color: 'var(--nexus-success)', bg: 'var(--nexus-success-light)', icon: <ArrowDownLeft size={20} /> },
          { label: 'Total Out',       value: `$${totalOut.toLocaleString()}`, color: 'var(--nexus-danger)',  bg: 'var(--nexus-danger-light)',  icon: <ArrowUpRight size={20} /> },
          { label: 'Pending',         value: pending,                         color: 'var(--nexus-warning)', bg: 'var(--nexus-warning-light)', icon: <AlertCircle size={20} /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid var(--nexus-border)', boxShadow: 'var(--nexus-shadow)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--nexus-text-primary)', margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--nexus-text-secondary)', margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Deposit',  modal: 'deposit'  as ModalType, color: 'var(--nexus-success)', icon: <ArrowDownLeft size={16} /> },
          { label: 'Withdraw', modal: 'withdraw' as ModalType, color: 'var(--nexus-danger)',  icon: <ArrowUpRight size={16} /> },
          { label: 'Transfer', modal: 'transfer' as ModalType, color: 'var(--nexus-primary)', icon: <RefreshCw size={16} /> },
        ].map(a => (
          <button key={a.label} onClick={() => setActiveModal(a.modal)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: a.color, color: 'white', fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer', boxShadow: 'var(--nexus-shadow)',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Transaction table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--nexus-border)', boxShadow: 'var(--nexus-shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--nexus-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--nexus-text-primary)', margin: 0 }}>Transaction History</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'completed', 'pending', 'failed'] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} style={{
                padding: '5px 12px', borderRadius: 8, border: '1px solid',
                borderColor: filterStatus === f ? 'var(--nexus-primary)' : 'var(--nexus-border)',
                background: filterStatus === f ? 'var(--nexus-primary-light)' : 'white',
                color: filterStatus === f ? 'var(--nexus-primary)' : 'var(--nexus-text-secondary)',
                fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--nexus-surface)' }}>
                {['Type', 'Amount', 'Sender', 'Receiver', 'Date', 'Status', 'Note'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--nexus-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--nexus-border)', background: i % 2 === 0 ? 'white' : 'var(--nexus-surface)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--nexus-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {typeIcon(t.type)}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--nexus-text-primary)', textTransform: 'capitalize' }}>{t.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: t.type === 'deposit' ? 'var(--nexus-success)' : 'var(--nexus-text-primary)' }}>
                    {t.type === 'deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--nexus-text-secondary)' }}>{t.sender}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--nexus-text-secondary)' }}>{t.receiver}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--nexus-text-muted)', whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(t.status)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--nexus-text-muted)', fontSize: '0.78rem' }}>{t.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--nexus-text-muted)' }}>No transactions found</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px', width: '100%', maxWidth: '400px', boxShadow: 'var(--nexus-shadow-lg)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>{activeModal} Funds</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>Amount (USD)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--nexus-text-muted)' }} />
                  <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                    style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              {activeModal === 'transfer' && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>Recipient</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Name or email"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--nexus-text-secondary)', display: 'block', marginBottom: 6 }}>Note (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--nexus-border)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => { setActiveModal(null); setAmount(''); setNote(''); setRecipient(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={handleAction}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: activeModal === 'deposit' ? 'var(--nexus-success)' : activeModal === 'withdraw' ? 'var(--nexus-danger)' : 'var(--nexus-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {activeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};