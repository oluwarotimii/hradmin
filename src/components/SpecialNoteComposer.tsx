// Compact modal for HR/Admin to send an ad-hoc "special note" announcement
// (real push + notification_logs entry) to everyone or specific staff.

import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { getAllStaff } from '../services/staffManagementService';
import { sendSpecialNote } from '../services/notificationService';

interface StaffOption {
  user_id: number;
  name: string;
}

interface SpecialNoteComposerProps {
  onClose: () => void;
}

export function SpecialNoteComposer({ onClose }: SpecialNoteComposerProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState<'all' | 'specific'>('all');
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (scope !== 'specific' || staffOptions.length > 0) return;
    setLoadingStaff(true);
    getAllStaff(1, 500).then((res) => {
      if (res.success && res.staff) {
        setStaffOptions(
          res.staff.map((s) => ({
            user_id: s.user_id,
            name: [s.first_name || s.firstName, s.last_name || s.lastName].filter(Boolean).join(' '),
          }))
        );
      }
      setLoadingStaff(false);
    });
  }, [scope, staffOptions.length]);

  const toggleStaff = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredStaff = staffOptions.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setResult('Title and message are required.');
      return;
    }
    if (scope === 'specific' && selectedIds.size === 0) {
      setResult('Select at least one staff member, or switch to "Everyone".');
      return;
    }

    setSending(true);
    setResult(null);
    const res = await sendSpecialNote(
      title.trim(),
      message.trim(),
      scope === 'specific' ? Array.from(selectedIds) : undefined
    );
    setSending(false);

    if (res.success) {
      setResult(res.message || `Sent to ${res.sentCount} people.`);
      setTimeout(onClose, 1200);
    } else {
      setResult(res.message || 'Failed to send note.');
    }
  };

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      <div className="notification-panel" style={{ width: '24rem' }}>
        <div className="notification-header">
          <h3>New Special Note</h3>
          <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
          <div>
            <label className="text-xs text-muted">Title</label>
            <input
              className="input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office closed Friday"
            />
          </div>

          <div>
            <label className="text-xs text-muted">Message</label>
            <textarea
              className="input w-full"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do staff need to know?"
            />
          </div>

          <div>
            <label className="text-xs text-muted">Send to</label>
            <div className="flex gap-2" style={{ marginTop: '0.25rem' }}>
              <button
                className={`btn btn-sm ${scope === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setScope('all')}
              >
                Everyone
              </button>
              <button
                className={`btn btn-sm ${scope === 'specific' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setScope('specific')}
              >
                Specific staff
              </button>
            </div>
          </div>

          {scope === 'specific' && (
            <div>
              <input
                className="input w-full"
                placeholder="Search staff…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ maxHeight: '12rem', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                {loadingStaff ? (
                  <p className="text-xs text-muted" style={{ padding: '0.75rem' }}>Loading staff…</p>
                ) : filteredStaff.length === 0 ? (
                  <p className="text-xs text-muted" style={{ padding: '0.75rem' }}>No matches</p>
                ) : (
                  filteredStaff.map((s) => (
                    <label
                      key={s.user_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.user_id)}
                        onChange={() => toggleStaff(s.user_id)}
                      />
                      {s.name}
                    </label>
                  ))
                )}
              </div>
              {selectedIds.size > 0 && (
                <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{selectedIds.size} selected</p>
              )}
            </div>
          )}

          {result && <p className="text-xs" style={{ color: result.includes('Sent') || /^\d/.test(result) ? '#16a34a' : '#dc2626' }}>{result}</p>}

          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            <Send className="w-3.5 h-3.5 mr-1" />
            {sending ? 'Sending…' : 'Send Note'}
          </button>
        </div>
      </div>
    </>
  );
}
