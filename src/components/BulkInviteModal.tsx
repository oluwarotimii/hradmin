import React, { useState, useCallback } from 'react';
import { X, Plus, Trash2, Upload, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { bulkInviteStaff, BulkInviteInvitation, BulkInviteResult } from '../services/staffManagementService';
import { Role } from '../services/roleManagementService';
import { Branch } from '../services/branchManagementService';
import { Department } from '../services/departmentManagementService';

interface BulkInviteModalProps {
  roles: Role[];
  branches: Branch[];
  departments: Department[];
  onSuccess: () => void;
  onClose: () => void;
}

const T = {
  primary: '#1e40af', primaryLight: '#3b82f6', primaryPale: '#eff6ff', primaryBorder: '#bfdbfe',
  success: '#059669', successPale: '#ecfdf5', successBorder: '#a7f3d0',
  warning: '#d97706', warningPale: '#fffbeb', warningBorder: '#fde68a',
  danger: '#dc2626', dangerPale: '#fef2f2', dangerBorder: '#fecaca',
  surface: '#ffffff', surfaceAlt: '#f8fafc', surfaceMuted: '#f1f5f9',
  border: '#e2e8f0', borderStrong: '#cbd5e1',
  text: '#0f172a', textSub: '#475569', textMuted: '#94a3b8',
};

const inputS: React.CSSProperties = {
  padding: '0.45rem 0.7rem', border: `1.5px solid ${T.border}`, borderRadius: '6px',
  fontSize: '0.82rem', color: T.text, background: T.surface, outline: 'none', fontFamily: 'inherit',
};

const selectS: React.CSSProperties = { ...inputS, cursor: 'pointer' };

const btnP: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
  border: 'none', cursor: 'pointer', transition: 'all 0.12s',
};

const btnOutline: React.CSSProperties = {
  ...btnP, background: T.surface, border: `1.5px solid ${T.border}`, color: T.textSub,
};

interface BulkRow extends BulkInviteInvitation {
  _id: string;
  error?: string;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export default function BulkInviteModal({ roles, branches, departments, onSuccess, onClose }: BulkInviteModalProps) {
  const [rows, setRows] = useState<BulkRow[]>([
    { _id: generateId(), firstName: '', lastName: '', personalEmail: '', roleId: '', branchId: '', departmentId: '' },
    { _id: generateId(), firstName: '', lastName: '', personalEmail: '', roleId: '', branchId: '', departmentId: '' },
    { _id: generateId(), firstName: '', lastName: '', personalEmail: '', roleId: '', branchId: '', departmentId: '' },
  ]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ sent: boolean; successCount: number; failureCount: number; details: BulkInviteResult[] } | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const updateRow = useCallback((id: string, field: keyof BulkInviteInvitation, value: string) => {
    setRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value, error: undefined } : r));
  }, []);

  const addRow = () => {
    setRows(prev => [...prev, { _id: generateId(), firstName: '', lastName: '', personalEmail: '', roleId: '', branchId: '', departmentId: '' }]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev);
  };

  const handleSend = async () => {
    const validRows = rows.filter(r => r.firstName.trim() && r.lastName.trim() && r.personalEmail.trim() && r.roleId);
    if (validRows.length === 0) return;

    setSending(true);
    try {
      const payload = validRows.map(r => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        personalEmail: r.personalEmail.trim(),
        phone: r.phone?.trim() || undefined,
        roleId: r.roleId,
        branchId: r.branchId || undefined,
        departmentId: r.departmentId || undefined,
      }));

      const result = await bulkInviteStaff(payload);
      setResults({
        sent: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        details: result.results,
      });
    } finally {
      setSending(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { setCsvError('CSV must have a header row and at least one data row.'); return; }

        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const firstNameIdx = header.findIndex(h => h.includes('first'));
        const lastNameIdx = header.findIndex(h => h.includes('last'));
        const emailIdx = header.findIndex(h => h.includes('email'));
        const roleIdx = header.findIndex(h => h.includes('role'));
        const branchIdx = header.findIndex(h => h.includes('branch'));
        const deptIdx = header.findIndex(h => h.includes('department'));

        if (firstNameIdx < 0 || lastNameIdx < 0 || emailIdx < 0) {
          setCsvError('CSV must have columns: first_name, last_name, email (and optionally role, branch, department)');
          return;
        }

        const newRows: BulkRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const firstName = cols[firstNameIdx] || '';
          const lastName = cols[lastNameIdx] || '';
          const personalEmail = cols[emailIdx] || '';

          // Match role by name
          let roleId = '';
          if (roleIdx >= 0 && cols[roleIdx]) {
            const matchedRole = roles.find(r => r.name.toLowerCase().includes(cols[roleIdx].toLowerCase()));
            if (matchedRole) roleId = matchedRole.id;
          }

          // Match branch by name
          let branchId = '';
          if (branchIdx >= 0 && cols[branchIdx]) {
            const matchedBranch = branches.find(b => b.name.toLowerCase().includes(cols[branchIdx].toLowerCase()));
            if (matchedBranch) branchId = matchedBranch.id;
          }

          // Match department by name
          let departmentId = '';
          if (deptIdx >= 0 && cols[deptIdx]) {
            const matchedDept = departments.find(d => d.name.toLowerCase().includes(cols[deptIdx].toLowerCase()));
            if (matchedDept) departmentId = matchedDept.id;
          }

          newRows.push({ _id: generateId(), firstName, lastName, personalEmail, roleId, branchId, departmentId });
        }

        setRows(prev => [...prev, ...newRows]);
      } catch {
        setCsvError('Failed to parse CSV. Please check the format.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const validCount = rows.filter(r => r.firstName.trim() && r.lastName.trim() && r.personalEmail.trim() && r.roleId).length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div
        style={{ background: T.surface, borderRadius: '16px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: T.text }}>Bulk Invite Staff</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: T.textMuted }}>Invite multiple staff members at once</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: T.textMuted }}><X size={20} /></button>
        </div>

        {/* CSV Upload */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ ...btnOutline, cursor: 'pointer', fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>
              <Upload size={14} />
              Upload CSV
              <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.75rem', color: T.textMuted }}>CSV columns: first_name, last_name, email, role (optional), branch (optional), department (optional)</span>
          </div>
          {csvError && <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: T.danger }}>{csvError}</p>}
        </div>

        {/* Results */}
        {results && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${T.border}`, background: results.failureCount === 0 ? T.successPale : T.warningPale }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {results.failureCount === 0 ? <CheckCircle size={16} color={T.success} /> : <AlertCircle size={16} color={T.warning} />}
              <span>{results.successCount} sent, {results.failureCount} failed</span>
            </div>
            {results.details.filter(d => !d.success).length > 0 && (
              <div style={{ marginTop: '0.5rem', maxHeight: '120px', overflow: 'auto' }}>
                {results.details.filter(d => !d.success).map(d => (
                  <p key={d.index} style={{ margin: '0.15rem 0', fontSize: '0.75rem', color: T.danger }}>
                    {d.email}: {d.message}
                  </p>
                ))}
              </div>
            )}
            <button onClick={onSuccess} style={{ ...btnP, background: T.primary, color: '#fff', marginTop: '0.5rem' }}>Done</button>
          </div>
        )}

        {/* Rows Table */}
        {!results && (
          <div style={{ padding: '1rem 1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    {['First Name', 'Last Name', 'Personal Email', 'Role', 'Branch', 'Department', ''].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row._id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <input style={{ ...inputS, width: '100px' }} value={row.firstName} onChange={e => updateRow(row._id, 'firstName', e.target.value)} placeholder="First" />
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <input style={{ ...inputS, width: '100px' }} value={row.lastName} onChange={e => updateRow(row._id, 'lastName', e.target.value)} placeholder="Last" />
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <input style={{ ...inputS, width: '160px' }} type="email" value={row.personalEmail} onChange={e => updateRow(row._id, 'personalEmail', e.target.value)} placeholder="email@example.com" />
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <select style={{ ...selectS, width: '120px' }} value={row.roleId} onChange={e => updateRow(row._id, 'roleId', e.target.value)}>
                          <option value="">Select</option>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <select style={{ ...selectS, width: '110px' }} value={row.branchId} onChange={e => updateRow(row._id, 'branchId', e.target.value)}>
                          <option value="">Select</option>
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem' }}>
                        <select style={{ ...selectS, width: '120px' }} value={row.departmentId} onChange={e => updateRow(row._id, 'departmentId', e.target.value)}>
                          <option value="">Select</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.35rem 0.35rem', textAlign: 'center' }}>
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(row._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: '0.25rem' }}><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRow} style={{ ...btnOutline, marginTop: '0.75rem', fontSize: '0.78rem' }}><Plus size={14} /> Add Row</button>
          </div>
        )}

        {/* Footer */}
        {!results && (
          <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: T.textMuted }}>{validCount} of {rows.length} rows ready</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={onClose} style={btnOutline}>Cancel</button>
              <button
                onClick={handleSend}
                disabled={sending || validCount === 0}
                style={{
                  ...btnP, background: validCount > 0 ? T.primary : T.borderStrong, color: '#fff',
                  opacity: sending || validCount === 0 ? 0.6 : 1, cursor: sending || validCount === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Sending...</> : <><Send size={14} /> Send {validCount} Invitation{validCount !== 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
