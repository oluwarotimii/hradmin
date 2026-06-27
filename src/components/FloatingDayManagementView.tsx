import { useState, useEffect } from 'react';
import { Search, Calendar, Check, X, Clock, User, Filter, CheckCircle, AlertCircle, Umbrella } from 'lucide-react';
import { API_ENDPOINT } from '../config/config';
import { floatingDayService, type FloatingDayRequest } from '../services/floatingDayService';

const T = {
  primary:       '#1e40af',
  primaryLight:  '#3b82f6',
  primaryPale:   '#eff6ff',
  primaryBorder: '#bfdbfe',
  success:       '#059669',
  successPale:   '#ecfdf5',
  successBorder: '#a7f3d0',
  warning:       '#d97706',
  warningPale:   '#fffbeb',
  warningBorder: '#fde68a',
  danger:        '#dc2626',
  dangerPale:    '#fef2f2',
  dangerBorder:  '#fecaca',
  purple:        '#7c3aed',
  purplePale:    '#f5f3ff',
  purpleBorder:  '#ddd6fe',
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
  surfaceMuted:  '#f1f5f9',
  border:        '#e2e8f0',
  borderStrong:  '#cbd5e1',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
};

const card: React.CSSProperties = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

const inputS: React.CSSProperties = {
  width: '100%', padding: '0.575rem 0.875rem',
  border: `1.5px solid ${T.border}`, borderRadius: '8px',
  fontSize: '0.875rem', color: T.text, background: T.surface,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelS: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  color: T.textSub, marginBottom: '0.4rem',
  letterSpacing: '0.05em', textTransform: 'uppercase',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: T.primary, color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '0.82rem',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: `0 1px 3px rgba(30,64,175,0.28)`,
  transition: 'background 0.13s', whiteSpace: 'nowrap' as const,
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: T.surface, color: T.textSub,
  border: `1.5px solid ${T.border}`, borderRadius: '8px',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'background 0.13s', whiteSpace: 'nowrap' as const,
};

const btnSuccess: React.CSSProperties = {
  ...btnPrimary, background: T.success, boxShadow: `0 1px 3px rgba(5,150,105,0.28)`,
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary, background: T.danger, boxShadow: `0 1px 3px rgba(220,38,38,0.25)`,
};

const modalShell: React.CSSProperties = {
  position: 'fixed', top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  width: 'min(34rem, calc(100vw - 2rem))', maxHeight: '90vh',
  display: 'flex', flexDirection: 'column', background: T.surface,
  borderRadius: '16px', boxShadow: '0 20px 60px rgba(15,23,42,0.22)',
  zIndex: 50, overflow: 'hidden',
};

const mHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1.1rem 1.4rem', borderBottom: `1px solid ${T.border}`,
  background: T.surfaceAlt, flexShrink: 0,
};

const mBody: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '1.4rem' };
const mFoot: React.CSSProperties = {
  display: 'flex', gap: '0.6rem', justifyContent: 'flex-end',
  padding: '1rem 1.4rem', borderTop: `1px solid ${T.border}`,
  background: T.surfaceAlt, flexShrink: 0,
};

const overlayS: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  backdropFilter: 'blur(3px)', zIndex: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, [string, string, string]> = {
    approved:  [T.success, T.successPale, T.successBorder],
    cleared:   [T.primary, T.primaryPale, T.primaryBorder],
    pending:   [T.warning, T.warningPale, T.warningBorder],
    rejected:  [T.danger,  T.dangerPale,  T.dangerBorder],
    cancelled: [T.textMuted, T.surfaceMuted, T.border],
  };
  const [dot, bg, border] = map[status] || [T.textMuted, T.surfaceMuted, T.border];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.6rem', borderRadius:'100px', fontSize:'0.72rem', fontWeight:600, background:bg, color:dot, border:`1px solid ${border}` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:dot, display:'inline-block' }}/>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const initials2 = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const avatarBg = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size > 36 ? '10px' : '8px', background: avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size > 36 ? '0.9rem' : '0.65rem', fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
    {initials2(name)}
  </div>
);

const Th = ({ ch, right }: { ch: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: '0.7rem 1rem', textAlign: right ? 'right' : 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
    {ch}
  </th>
);

const Td = ({ ch, right }: { ch: React.ReactNode; right?: boolean }) => (
  <td style={{ padding: '0.85rem 1rem', textAlign: right ? 'right' : 'left', borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle', fontSize: '0.875rem', color: T.text }}>
    {ch}
  </td>
);

const formatDate = (d: string | null | undefined) => {
  if (!d) return '-';
  try {
    const ds = d.includes('T') ? d.split('T')[0] : d;
    return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
};

const FloatingDayManagementView = () => {
  const [activeTab, setActiveTab] = useState<'cleared' | 'all'>('cleared');
  const [requests, setRequests] = useState<FloatingDayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FloatingDayRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'cleared') {
        const res = await floatingDayService.getCleared();
        if (res.success && res.data) {
          setRequests(res.data.requests);
        } else {
          setError(res.message || 'Failed to fetch cleared requests');
        }
      } else {
        const params: { status?: string } = {};
        if (filterStatus !== 'all') params.status = filterStatus;
        const res = await floatingDayService.getAll(params);
        if (res.success && res.data) {
          setRequests(res.data.requests);
        } else {
          setError(res.message || 'Failed to fetch requests');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, filterStatus]);

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    setProcessing(true);
    setError(null);
    try {
      let res;
      if (actionType === 'approve') {
        res = await floatingDayService.approve(selectedRequest.id);
      } else {
        if (!rejectionReason.trim()) {
          setError('Rejection reason is required');
          setProcessing(false);
          return;
        }
        res = await floatingDayService.reject(selectedRequest.id, rejectionReason);
      }
      if (res.success) {
        setSuccessMessage(res.message || `Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowActionModal(false);
        setSelectedRequest(null);
        setActionType(null);
        setRejectionReason('');
        fetchData();
      } else {
        setError(res.message || `Failed to ${actionType}`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (req: FloatingDayRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setActionType(type);
    setRejectionReason('');
    setShowActionModal(true);
  };

  const filtered = searchTerm
    ? requests.filter(r =>
        (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.date.includes(searchTerm)
      )
    : requests;

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    cleared: requests.filter(r => r.status === 'cleared').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: T.successPale, border: `1px solid ${T.successBorder}`, borderRadius: '8px', color: T.success, fontSize: '0.875rem', fontWeight: 500 }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: T.dangerPale, border: `1px solid ${T.dangerBorder}`, borderRadius: '8px', color: T.danger, fontSize: '0.875rem', fontWeight: 500 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Guide */}
      <div style={{ ...card, padding: '0.875rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: T.primaryPale, borderColor: T.primaryBorder }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Umbrella size={14} color="#fff" />
        </div>
        <div style={{ flex: 1, fontSize: '0.82rem', color: T.textSub }}>
          <p style={{ margin: 0, fontWeight: 700, color: T.text, marginBottom: '0.25rem' }}>How Day Off works</p>
          <p style={{ margin: '0 0 0.3rem' }}>
            Staff select a day-off type (e.g. Democracy Day, Eid El Kabir) from their available programs and pick a date.
            <strong> Two-step approval:</strong> their <strong>manager clears</strong> it first, then <strong>HR approves</strong> it.
          </p>
          <p style={{ margin: 0 }}>
            <strong>HR Approval Queue</strong> shows requests already cleared by managers — review and approve/reject here.
            <strong> All Requests</strong> lets you see every request and act on pending ones directly.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${T.border}`, paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('cleared')}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
            background: activeTab === 'cleared' ? T.primary : 'transparent',
            color: activeTab === 'cleared' ? '#fff' : T.textSub,
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'inherit', transition: 'background 0.13s',
          }}
        >
          <CheckCircle size={14} />
          HR Approval Queue
          {stats.cleared > 0 && (
            <span style={{ background: activeTab === 'cleared' ? 'rgba(255,255,255,0.2)' : T.warningPale, color: activeTab === 'cleared' ? '#fff' : T.warning, padding: '0.1rem 0.5rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700 }}>{stats.cleared}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
            background: activeTab === 'all' ? T.primary : 'transparent',
            color: activeTab === 'all' ? '#fff' : T.textSub,
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: 'inherit', transition: 'background 0.13s',
          }}
        >
          <Umbrella size={14} />
          All Requests
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Pending', count: stats.pending, color: T.warning },
          { label: 'Cleared', count: stats.cleared, color: T.primary },
          { label: 'Approved', count: stats.approved, color: T.success },
          { label: 'Total', count: stats.total, color: T.textSub },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      {activeTab === 'all' && (
        <div style={{ ...card, padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 230px', minWidth: '200px' }}>
              <Search size={13} color={T.textMuted} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search by name or date…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputS, paddingLeft: '2.1rem' }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ ...inputS, width: 'auto', minWidth: '140px', paddingRight: '2rem', cursor: 'pointer', appearance: 'auto' as any }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="cleared">Cleared</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th ch="Employee" />
                <Th ch="Type" />
                <Th ch="Date" />
                <Th ch="Reason" />
                <Th ch="Status" />
                <Th ch="Cleared By" />
                <Th ch="Actions" right />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>
                  <Umbrella size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>No day off requests found</p>
                  {activeTab === 'cleared' && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Requests from managers will appear here after they clear them.</p>}
                </td></tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Td ch={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Avatar name={req.user_name || `User ${req.user_id}`} size={34} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{req.user_name || `User #${req.user_id}`}</span>
                      </div>
                    } />
                    <Td ch={<span style={{ fontSize: '0.82rem', color: T.text }}>{req.program_name || 'Day Off'}</span>} />
                    <Td ch={formatDate(req.date)} />
                    <Td ch={<span style={{ color: T.textSub, fontSize: '0.82rem', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.reason || '-'}</span>} />
                    <Td ch={<StatusBadge status={req.status} />} />
                    <Td ch={<span style={{ color: T.textSub, fontSize: '0.82rem' }}>{req.cleared_by_name || '-'}</span>} />
                    <Td ch={
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {(req.status === 'cleared' || (req.status === 'pending' && activeTab === 'all')) && (
                          <>
                            <button style={{ ...btnSuccess, padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openActionModal(req, 'approve')}>
                              <Check size={12} /> Approve
                            </button>
                            <button style={{ ...btnDanger, padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openActionModal(req, 'reject')}>
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && <span style={{ color: T.success, fontSize: '0.75rem', fontWeight: 600 }}>Completed</span>}
                        {req.status === 'rejected' && <span style={{ color: T.danger, fontSize: '0.75rem', fontWeight: 600 }}>Rejected</span>}
                        {req.status === 'cancelled' && <span style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600 }}>Cancelled</span>}
                        {req.status === 'pending' && activeTab === 'cleared' && <span style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 600 }}>Awaiting clearance</span>}
                      </div>
                    } />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <>
          <div style={overlayS} onClick={() => { if (!processing) { setShowActionModal(false); setSelectedRequest(null); setActionType(null); } }} />
          <div style={modalShell}>
            <div style={mHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: actionType === 'approve' ? T.success : T.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {actionType === 'approve' ? <Check size={15} color="#fff" /> : <X size={15} color="#fff" />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>
                    {actionType === 'approve' ? 'Approve' : 'Reject'} Day Off Request
                  </p>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                    {actionType === 'approve' ? 'This will deduct balance and create a day off exception' : 'This will notify the employee'}
                  </p>
                </div>
              </div>
              <button onClick={() => { if (!processing) { setShowActionModal(false); setSelectedRequest(null); setActionType(null); } }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted, borderRadius: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={mBody}>
              {selectedRequest && (
                <div style={{ border: `1px solid ${T.border}`, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <Avatar name={selectedRequest.user_name || `User ${selectedRequest.user_id}`} size={40} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text }}>{selectedRequest.user_name || `User #${selectedRequest.user_id}`}</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: T.textSub }}>{selectedRequest.program_name || 'Day Off'} · {formatDate(selectedRequest.date)}</p>
                    </div>
                  </div>
                  {selectedRequest.reason && (
                    <div style={{ background: T.surfaceAlt, padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: T.textSub }}>
                      <span style={{ fontWeight: 600, color: T.text }}>Reason:</span> {selectedRequest.reason}
                    </div>
                  )}
                  {selectedRequest.cleared_by_name && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: T.textSub }}>
                      <span style={{ fontWeight: 600 }}>Cleared by:</span> {selectedRequest.cleared_by_name}
                      {selectedRequest.cleared_at && <> on {new Date(selectedRequest.cleared_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>}
                    </div>
                  )}
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label style={labelS}>Rejection Reason <span style={{ color: T.danger }}>*</span></label>
                  <textarea
                    style={{ ...inputS, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div style={mFoot}>
              <button style={btnOutline} onClick={() => { if (!processing) { setShowActionModal(false); setSelectedRequest(null); setActionType(null); } }} disabled={processing}>
                Cancel
              </button>
              <button
                style={actionType === 'approve' ? btnSuccess : btnDanger}
                onClick={handleAction}
                disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
              >
                {processing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingDayManagementView;
