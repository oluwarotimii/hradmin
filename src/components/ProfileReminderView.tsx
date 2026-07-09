import { useState, useEffect } from 'react';
import { getEligibleStaff, sendReminder, EligibleStaff } from '../services/profileReminderService';
import { Mail, Send, AlertCircle, CheckCircle, XCircle, RefreshCw, Users, KeyRound } from 'lucide-react';

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
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
};

const inputS: React.CSSProperties = {
  width: '100%',
  padding: '0.575rem 0.875rem',
  border: `1.5px solid ${T.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: T.text,
  background: T.surface,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box' as const,
};

const labelS: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: T.textSub,
  marginBottom: '0.4rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.575rem 1.1rem',
  background: T.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.13s',
  boxShadow: `0 1px 3px rgba(30,64,175,0.28)`,
  whiteSpace: 'nowrap' as const,
  justifyContent: 'center',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  padding: '0.5rem',
  background: 'transparent',
  color: T.textMuted,
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.13s',
};

const hintS: React.CSSProperties = {
  margin: '0.3rem 0 0',
  fontSize: '0.75rem',
  color: T.textMuted,
  lineHeight: 1.5,
};

export function ProfileReminderView() {
  const [eligibleStaff, setEligibleStaff] = useState<EligibleStaff[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, must_change_password_count: 0, incomplete_profile_count: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [subject, setSubject] = useState('Action Required: Complete Your Profile');
  const [message, setMessage] = useState(`<p>Hi {{name}},</p>
<p>This is a reminder that your profile is currently <strong>incomplete</strong> ({{reason}}).</p>
<p>Please log in to the FemTMS portal at your earliest convenience to update your information.</p>
<p>If you have any questions, please contact the HR department.</p>
<p>Best regards,<br/>HR Team</p>`);

  const fetchEligibleStaff = async () => {
    setLoading(true);
    try {
      const response = await getEligibleStaff();
      if (response.success) {
        setEligibleStaff(response.data.staff);
        setTotalStats({
          total: response.data.total,
          must_change_password_count: response.data.must_change_password_count,
          incomplete_profile_count: response.data.incomplete_profile_count
        });
      }
    } catch (error) {
      console.error('Error fetching eligible staff:', error);
      setResult({ type: 'error', message: 'Failed to load eligible staff data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleStaff();
  }, []);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const response = await sendReminder(subject, message);
      if (response.success) {
        setResult({ type: 'success', message: response.message });
        fetchEligibleStaff();
      } else {
        setResult({ type: 'error', message: response.message || 'Failed to send reminders' });
      }
    } catch (error: any) {
      setResult({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to send reminders' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Mail size={14} color={T.primary}/>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Profile Reminders</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Send email reminders to staff with incomplete profiles or pending password changes</p>
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* ── Stats Cards ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${T.border}` }}>
            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '8px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={14} color={T.primary} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Eligible</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.text }}>{loading ? '-' : totalStats.total}</p>
            </div>
          </div>

          <div style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${T.border}` }}>
            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '8px', background: T.dangerPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <KeyRound size={14} color={T.danger} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Must Change Password</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.text }}>{loading ? '-' : totalStats.must_change_password_count}</p>
            </div>
          </div>

          <div style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${T.border}` }}>
            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '8px', background: T.warningPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={14} color={T.warning} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Incomplete Profile</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.text }}>{loading ? '-' : totalStats.incomplete_profile_count}</p>
            </div>
          </div>

          <div style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${T.border}` }}>
            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '8px', background: T.successPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={14} color={T.success} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overlap</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: T.textMuted }}>—</p>
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ───────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* ── Left: Email Editor ────────────────────────────────── */}
          <div style={{ ...card, border: `1px solid ${T.border}`, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Mail size={14} color={T.primary} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text }}>Email Content</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelS}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                style={inputS}
              />
            </div>

            <div>
              <label style={labelS}>
                Message Body <span style={{ fontWeight: 400, color: T.textMuted }}>(HTML supported)</span>
              </label>
              <p style={{ ...hintS, marginBottom: '0.5rem' }}>
                Available variables: {'{{name}}'}, {'{{email}}'}, {'{{reason}}'}
              </p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Email body (HTML)"
                rows={18}
                style={{ ...inputS, resize: 'vertical', fontFamily: "'DM Sans','Geist',system-ui,sans-serif", fontSize: '0.82rem', lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* ── Right: Staff List + Send ──────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...card, border: `1px solid ${T.border}`, padding: '1.25rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={14} color={T.textSub} />
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text }}>
                    Eligible Staff
                    {!loading && <span style={{ fontWeight: 500, color: T.textMuted, fontSize: '0.82rem' }}> ({eligibleStaff.length})</span>}
                  </p>
                </div>
                <button onClick={fetchEligibleStaff} disabled={loading} style={btnGhost} title="Refresh">
                  <RefreshCw size={14} style={loading ? { animation: 'sv-spin 0.7s linear infinite' } : undefined} />
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: T.textMuted, fontSize: '0.875rem' }}>
                  <div style={{ width: 16, height: 16, border: `2px solid ${T.primaryBorder}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'sv-spin 0.7s linear infinite' }}/>
                  Loading staff...
                </div>
              ) : eligibleStaff.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <CheckCircle size={40} color={T.successBorder} style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: T.textSub, fontWeight: 500 }}>All staff have complete profiles</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>No reminders need to be sent at this time.</p>
                </div>
              ) : (
                <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {eligibleStaff.map(staff => (
                    <div key={staff.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.65rem', borderRadius: '8px', background: T.surfaceAlt, fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: staff.must_change_password ? T.danger : T.warning }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{staff.full_name}</p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{staff.email}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {staff.must_change_password && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: T.dangerPale, color: T.danger, border: `1px solid ${T.dangerBorder}` }}>Password</span>
                        )}
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: staff.profile_completion < 50 ? T.warning : T.success }}>
                          {staff.profile_completion}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Result toast */}
            {result && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '10px', background: result.type === 'success' ? T.successPale : T.dangerPale, border: `1px solid ${result.type === 'success' ? T.successBorder : T.dangerBorder}` }}>
                {result.type === 'success'
                  ? <CheckCircle size={15} color={T.success} style={{ flexShrink: 0, marginTop: 1 }} />
                  : <XCircle size={15} color={T.danger} style={{ flexShrink: 0, marginTop: 1 }} />}
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500, color: result.type === 'success' ? '#065f46' : '#7f1d1d' }}>{result.message}</p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || loading || eligibleStaff.length === 0}
              style={{ ...btnPrimary, width: '100%', opacity: (sending || loading || eligibleStaff.length === 0) ? 0.65 : 1, cursor: (sending || loading || eligibleStaff.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {sending ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'sv-spin 0.7s linear infinite' }}/> Sending...</>
              ) : (
                <><Send size={14}/> Send Reminder{eligibleStaff.length > 0 ? ` (${eligibleStaff.length})` : ''}</>
              )}
            </button>
          </div>
        </div>

        <style>{`@keyframes sv-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
