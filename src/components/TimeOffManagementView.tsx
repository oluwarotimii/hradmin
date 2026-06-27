import { useState } from 'react';
import { Umbrella, Gift } from 'lucide-react';
import FloatingDayManagementView from './FloatingDayManagementView';
import TimeOffBankManagementView from './TimeOffBankManagementView';

const T = {
  primary:       '#1e40af',
  primaryPale:   '#eff6ff',
  primaryBorder: '#bfdbfe',
  border:        '#e2e8f0',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
};

const tabBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600,
  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  borderRadius: '8px 8px 0 0', transition: 'all 0.13s',
};

export default function TimeOffManagementView() {
  const [tab, setTab] = useState<'programs' | 'requests'>('programs');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: `2px solid ${T.border}` }}>
        <button
          style={{
            ...tabBase,
            background: tab === 'programs' ? T.surface : 'transparent',
            color: tab === 'programs' ? T.primary : T.textSub,
            borderBottom: tab === 'programs' ? `2px solid ${T.primary}` : '2px solid transparent',
            marginBottom: '-2px',
          }}
          onClick={() => setTab('programs')}
        >
          <Gift size={15} />
          Time Off Programs
        </button>
        <button
          style={{
            ...tabBase,
            background: tab === 'requests' ? T.surface : 'transparent',
            color: tab === 'requests' ? T.primary : T.textSub,
            borderBottom: tab === 'requests' ? `2px solid ${T.primary}` : '2px solid transparent',
            marginBottom: '-2px',
          }}
          onClick={() => setTab('requests')}
        >
          <Umbrella size={15} />
          Day Off Requests
        </button>
      </div>

      {/* Content */}
      {tab === 'programs' ? <TimeOffBankManagementView /> : <FloatingDayManagementView />}
    </div>
  );
}
