import { useState, useEffect } from 'react';
import { getEligibleStaff, sendReminder, EligibleStaff } from '../services/profileReminderService';
import { Mail, Send, AlertCircle, CheckCircle, XCircle, RefreshCw, Users, KeyRound, Loader2 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Eligible</p>
              <p className="text-2xl font-bold">{loading ? '-' : totalStats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <KeyRound className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Must Change Password</p>
              <p className="text-2xl font-bold">{loading ? '-' : totalStats.must_change_password_count}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Incomplete Profile</p>
              <p className="text-2xl font-bold">{loading ? '-' : totalStats.incomplete_profile_count}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overlap</p>
              <p className="text-2xl font-bold text-gray-400">—</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Editor */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Content
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                className="input w-full"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Body <span className="text-gray-400 font-normal">(HTML supported)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Available variables: {'{{name}}'}, {'{{email}}'}, {'{{reason}}'}
              </p>
              <textarea
                className="input w-full font-mono text-sm"
                rows={16}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Email body (HTML)"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Preview & Send */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Eligible Staff ({eligibleStaff.length})
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={fetchEligibleStaff}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : eligibleStaff.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>All staff have complete profiles and have changed their password.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1">
                {eligibleStaff.map(staff => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        staff.must_change_password ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{staff.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {staff.must_change_password && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600">Password</span>
                      )}
                      <span className={`text-xs font-medium ${
                        staff.profile_completion < 50 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {staff.profile_completion}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleSend}
            disabled={sending || loading || eligibleStaff.length === 0}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? 'Sending...' : `Send Reminder${eligibleStaff.length > 0 ? ` (${eligibleStaff.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
