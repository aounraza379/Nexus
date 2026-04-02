import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import {
  Users, Bell, Calendar, TrendingUp, AlertCircle,
  PlusCircle, CreditCard, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { investors } from '../../data/users';

const TOUR_STEPS: Step[] = [
  {
    target: '.tour-dashboard-stats',
    content: 'Your dashboard overview — pending requests, connections, meetings and profile views all at a glance.',
    disableBeacon: true,
    title: '👋 Welcome to Nexus!',
    placement: 'bottom' as const,
  },
  {
    target: '.tour-wallet',
    content: 'Your wallet balance and quick payment actions. Deposit, withdraw or transfer to connections.',
    title: '💳 Wallet',
    placement: 'bottom' as const,
  },
  {
    target: '.tour-collaboration',
    content: 'Investors who want to collaborate appear here. Accept or decline requests directly.',
    title: '🤝 Collaboration Requests',
    placement: 'top' as const,
  },
  {
    target: '.tour-investors',
    content: 'Recommended investors matched to your startup. Click View all to explore more.',
    title: '🔍 Recommended Investors',
    placement: 'left' as const,
  },
  {
    target: 'a[href="/calendar"]',
    content: 'Schedule meetings, add availability slots and manage investor calls.',
    title: '📅 Calendar',
    placement: 'right' as const,
  },
  {
    target: 'a[href="/video"]',
    content: 'Start face-to-face video calls with your investors directly from the platform.',
    title: '🎥 Video Calls',
    placement: 'right' as const,
  },
  {
    target: 'a[href="/payments"]',
    content: 'Full payment management — deposits, withdrawals, transfers and transaction history.',
    title: '💰 Payments',
    placement: 'right' as const,
  },
  {
    target: 'a[href="/security"]',
    content: 'Secure your account with password management, 2FA, and session monitoring.',
    title: '🔒 Security',
    placement: 'right' as const,
  },
];

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors]  = useState(investors.slice(0, 3));
  const [runTour, setRunTour]   = useState(false);
  const [tourKey, setTourKey]   = useState(0);

  useEffect(() => {
    if (user) {
      setCollaborationRequests(getRequestsForEntrepreneur(user.id));
    }
    // Auto-start tour on first visit
    const seen = localStorage.getItem('nexus-tour-seen');
    if (!seen) {
      setTimeout(() => setRunTour(true), 800);
    }
  }, [user]);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('nexus-tour-seen', 'true');
    }
  };

  const restartTour = () => {
    localStorage.removeItem('nexus-tour-seen');
    setTourKey(k => k + 1);
    setRunTour(true);
  };

  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status } : req)
    );
  };

  if (!user) return null;

  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Joyride Tour */}
      <Joyride
      key={tourKey}
      steps={TOUR_STEPS}
      run={runTour}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableScrolling={false}
      scrollOffset={80}
      callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 10000,
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#0f172a',
            overlayColor: 'rgba(0,0,0,0.45)',
          },
          tooltip: { borderRadius: 12, padding: '20px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
          tooltipTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: 8 },
          tooltipContent: { fontSize: '0.875rem', lineHeight: 1.6, color: '#475569' },
          buttonNext: { borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', padding: '8px 18px' },
          buttonBack: { borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', color: '#64748b' },
          buttonSkip: { fontSize: '0.8rem', color: '#94a3b8' },
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={restartTour} title="Restart guided tour" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', color: 'var(--nexus-text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <HelpCircle size={15} /> Tour
          </button>
          <Link to="/investors">
            <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="tour-dashboard-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {collaborationRequests.filter(r => r.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">2</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Profile Views</p>
                <h3 className="text-xl font-semibold text-success-900">24</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Wallet widget */}
      <div className="tour-wallet">
        <Card style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', border: 'none' }}>
          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={24} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1 }}>$82,500</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'Deposit',  to: '/payments' },
                  { label: 'Withdraw', to: '/payments' },
                  { label: 'Transfer', to: '/payments' },
                ].map(a => (
                  <Link key={a.label} to={a.to}>
                    <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
                      {a.label}
                    </button>
                  </Link>
                ))}
                <Link to="/payments">
                  <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'white', color: '#1e40af', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    View All →
                  </button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="tour-collaboration lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">When investors are interested, their requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="tour-investors space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">View all</Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard key={investor.id} investor={investor} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};