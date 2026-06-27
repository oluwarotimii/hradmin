import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, AlertCircle, Check, X, Users, Gift, Building, Eye, UserMinus } from 'lucide-react';
import { shiftSchedulingService } from '../services/shiftSchedulingService';
import { getAllStaff } from '../services/staffManagementService';

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

const btnDanger: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: T.danger, color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '0.82rem',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: `0 1px 3px rgba(220,38,38,0.25)`,
  transition: 'background 0.13s', whiteSpace: 'nowrap' as const,
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

const StatusBadge = ({ label }: { label: string }) => {
  const palette: Record<string, [string, string, string]> = {
    Active:   [T.success, T.successPale, T.successBorder],
    Upcoming: [T.warning, T.warningPale, T.warningBorder],
    Expired:  [T.textMuted, T.surfaceMuted, T.border],
  };
  const [dot, bg, border] = palette[label] || [T.textMuted, T.surfaceMuted, T.border];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.6rem', borderRadius:'100px', fontSize:'0.72rem', fontWeight:600, background:bg, color:dot, border:`1px solid ${border}` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:dot, display:'inline-block' }}/>
      {label}
    </span>
  );
};

const programStatus = (p: any): { label: string } => {
  const now = new Date();
  const fromS = p.valid_from?.includes('T') ? p.valid_from.split('T')[0] : p.valid_from;
  const toS = p.valid_to?.includes('T') ? p.valid_to.split('T')[0] : p.valid_to;
  const from = new Date(fromS + 'T00:00:00');
  const to = new Date(toS + 'T00:00:00');
  if (now < from) return { label: 'Upcoming' };
  if (now > to) return { label: 'Expired' };
  return { label: 'Active' };
};

const initials2 = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const avatarBg = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size > 36 ? '10px' : '8px', background: avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size > 36 ? '0.9rem' : '0.65rem', fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
    {initials2(name)}
  </div>
);

type ModalType = 'create' | 'edit' | 'assign' | 'viewAssignments' | null;

export default function TimeOffBankManagementView() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<ModalType>(null);
  const [editing, setEditing] = useState<any>(null);
  const [assigningTo, setAssigningTo] = useState<any>(null);
  const [viewingAssignments, setViewingAssignments] = useState<any>(null);
  const [viewAssignmentList, setViewAssignmentList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [totalDays, setTotalDays] = useState('1');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [preAssignedIds, setPreAssignedIds] = useState<number[]>([]);
  const [bulkSearch, setBulkSearch] = useState('');

  const limit = 10;

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shiftSchedulingService.getTimeOffPrograms({ page, limit, search: search || undefined });
      if (res.success) {
        const d = res.data;
        setPrograms(d.programs || []);
        if (d.pagination) setTotalPages(d.pagination.totalPages || 1);
      } else {
        setError(res.message || 'Failed to load programs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await getAllStaff(1, 1000);
      if (res.success && res.staff) {
        setStaffMembers(res.staff);
      }
    } catch {
      // staff loading is optional
    }
  };

  useEffect(() => { fetchPrograms(); fetchStaff(); }, [page]);

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(null), 3000); return () => clearTimeout(t); }
  }, [successMessage]);

  useEffect(() => {
    if (search) {
      const t = setTimeout(() => { setPage(1); fetchPrograms(); }, 300);
      return () => clearTimeout(t);
    }
  }, [search]);

  const resetForm = () => {
    setProgramName(''); setDescription(''); setTotalDays('1'); setValidFrom(''); setValidTo('');
    setEditing(null); setAssigningTo(null); setViewingAssignments(null); setViewAssignmentList([]);
    setBulkSelectedIds([]); setPreAssignedIds([]); setBulkSearch('');
  };

  const closeModal = () => { setModal(null); resetForm(); };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName || !totalDays || !validFrom || !validTo) {
      setError('Please fill in all required fields'); return;
    }
    setSubmitting(true); setError(null);
    try {
      const res = await shiftSchedulingService.createTimeOffProgram({
        program_name: programName,
        description: description || undefined,
        total_entitled_days: parseFloat(totalDays),
        valid_from: validFrom,
        valid_to: validTo,
      });
      if (res.success) {
        setSuccessMessage('Program created successfully');
        closeModal(); fetchPrograms();
      } else {
        setError(res.message || 'Failed to create');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create');
    } finally { setSubmitting(false); }
  };

  const handleEditProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true); setError(null);
    try {
      const payload: any = {};
      if (programName) payload.program_name = programName;
      if (description !== undefined) payload.description = description;
      if (totalDays) payload.total_entitled_days = parseFloat(totalDays);
      if (validFrom) payload.valid_from = validFrom;
      if (validTo) payload.valid_to = validTo;
      const res = await shiftSchedulingService.updateTimeOffProgram(editing.id, payload);
      if (res.success) {
        setSuccessMessage('Program updated successfully');
        closeModal(); fetchPrograms();
      } else {
        setError(res.message || 'Failed to update');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally { setSubmitting(false); }
  };

  const handleDeleteProgram = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This will also unassign all employees from this program.`)) return;
    setError(null);
    try {
      const res = await shiftSchedulingService.deleteTimeOffProgram(id);
      if (res.success) {
        setSuccessMessage('Program deleted');
        fetchPrograms();
      } else {
        setError(res.message || 'Failed to delete');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  const openEdit = (program: any) => {
    setEditing(program);
    setProgramName(program.program_name || '');
    setDescription(program.description || '');
    setTotalDays(String(program.total_entitled_days || ''));
    setValidFrom(program.valid_from ? program.valid_from.split('T')[0] : '');
    setValidTo(program.valid_to ? program.valid_to.split('T')[0] : '');
    setModal('edit');
  };

  const openAssign = async (program: any) => {
    setAssigningTo(program);
    setBulkSelectedIds([]);
    setPreAssignedIds([]);
    setBulkSearch('');
    setModal('assign');
    try {
      const res = await shiftSchedulingService.getProgramAssignments(program.id);
      if (res.success) {
        const ids = (res.data?.assignments || []).map((a: any) => a.user_id);
        setPreAssignedIds(ids);
        setBulkSelectedIds([...ids]);
      }
    } catch {
      // silent
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTo) return;
    setSubmitting(true); setError(null);
    try {
      const res = await shiftSchedulingService.assignEmployeesToProgram(assigningTo.id, { user_ids: bulkSelectedIds });
      if (res.success) {
        setSuccessMessage(res.message || 'Assignments updated successfully');
        closeModal(); fetchPrograms();
      } else {
        setError(res.message || 'Failed to assign');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign');
    } finally { setSubmitting(false); }
  };

  const openViewAssignments = async (program: any) => {
    setViewingAssignments(program);
    setViewAssignmentList([]);
    setModal('viewAssignments');
    try {
      const res = await shiftSchedulingService.getProgramAssignments(program.id);
      if (res.success) {
        setViewAssignmentList(res.data?.assignments || []);
      }
    } catch {
      // silent
    }
  };

  const handleRemoveAssignment = async (programId: number, userId: number, userName: string) => {
    if (!window.confirm(`Remove ${userName} from this program? This cannot be undone if they haven't used any days.`)) return;
    try {
      const res = await shiftSchedulingService.removeEmployeeFromProgram(programId, userId);
      if (res.success) {
        setSuccessMessage(`${userName} removed from program`);
        const updated = viewAssignmentList.filter((a: any) => a.user_id !== userId);
        setViewAssignmentList(updated);
      } else {
        setError(res.message || 'Failed to remove');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove');
    }
  };

  const stats = {
    total: programs.length,
    active: programs.filter((p: any) => programStatus(p).label === 'Active').length,
    totalAvailable: programs.reduce((s: number, p: any) => s + Number(p.total_available_days || 0), 0),
    totalAssigned: programs.reduce((s: number, p: any) => s + Number(p.assigned_count || 0), 0),
  };

  const staffDisplayName = (s: any) => {
    if (s.full_name) return s.full_name;
    const parts = [s.firstName || s.first_name || '', s.lastName || s.last_name || ''].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : `User #${s.user_id || s.id}`;
  };

  const renderBulkStaffPicker = () => {
    const query = bulkSearch.toLowerCase();
    const filtered = staffMembers.filter((s: any) =>
      staffDisplayName(s).toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query) ||
      (s.department || '').toLowerCase().includes(query)
    );

    const grouped: Record<string, any[]> = {};
    filtered.forEach((s: any) => {
      const dept = s.department || 'Other';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(s);
    });

    return (
      <div>
        <label style={labelS}>Select Employees <span style={{ color: T.danger }}>*</span></label>
        <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.72rem', color: T.textMuted }}>
          {bulkSelectedIds.length} employee(s) selected
        </p>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={bulkSearch}
            onChange={e => setBulkSearch(e.target.value)}
            style={inputS}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button type="button"
            onClick={() => setBulkSelectedIds(filtered.map((s: any) => s.user_id || s.id))}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: T.primaryPale, color: T.primary, border: `1px solid ${T.primaryBorder}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            Select All
          </button>
          <button type="button"
            onClick={() => setBulkSelectedIds([])}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: T.surfaceMuted, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            Deselect All
          </button>
        </div>
        <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '0.5rem', border: `1px solid ${T.border}`, borderRadius: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: T.textMuted, fontSize: '0.875rem' }}>
              No employees found
            </div>
          ) : (
            Object.entries(grouped).map(([dept, staffs]) => (
              <div key={dept} style={{ marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.35rem 0.5rem', background: T.primaryPale, borderRadius: '6px', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={12} color={T.primary} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.primary, textTransform: 'uppercase' }}>{dept}</span>
                  <span style={{ fontSize: '0.65rem', color: T.textMuted, marginLeft: 'auto' }}>{staffs.length}</span>
                </div>
                {staffs.map((staff: any) => {
                  const staffId = staff.user_id || staff.id;
                  const isSelected = bulkSelectedIds.includes(staffId);
                  const isPreAssigned = preAssignedIds.includes(staffId);
                  return (
                    <label key={staffId}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', borderRadius: '6px', cursor: 'pointer', background: isSelected ? T.primaryPale : 'transparent', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.surfaceAlt; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setBulkSelectedIds(bulkSelectedIds.filter(id => id !== staffId));
                          } else {
                            setBulkSelectedIds([...bulkSelectedIds, staffId]);
                          }
                        }}
                        style={{ width: '1rem', height: '1rem', cursor: 'pointer', flexShrink: 0 }} />
                      <Avatar name={staffDisplayName(staff)} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: T.text, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {staffDisplayName(staff)}
                          {isPreAssigned && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: T.primary, background: T.primaryPale, border: `1px solid ${T.primaryBorder}`, borderRadius: '4px', padding: '0.1rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Assigned
                            </span>
                          )}
                        </div>
                        {staff.email && <div style={{ fontSize: '0.7rem', color: T.textMuted }}>{staff.email}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const modalContent = () => {
    if (modal === 'assign') return renderAssignModal();
    if (modal === 'viewAssignments') return renderViewAssignmentsModal();
    return renderCreateEditModal();
  };

  const renderCreateEditModal = () => {
    const isCreate = modal === 'create';
    const title = isCreate ? 'Create Time Off Bank Program' : 'Edit Program';
    const subtitle = isCreate
      ? 'Define a new day-off program. After creating, assign employees to it.'
      : 'Update the program details. Changes apply to all existing assignments.';
    const submitLabel = isCreate ? 'Create Program' : 'Update';
    const handler = isCreate ? handleCreateProgram : handleEditProgram;

    return (
      <>
        <div style={overlayS} onClick={closeModal} />
        <div style={modalShell}>
          <div style={mHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isCreate ? <Plus size={18} color="#fff" /> : <Edit size={18} color="#fff" />}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>{title}</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>{subtitle}</p>
              </div>
            </div>
            <button onClick={closeModal}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted, borderRadius: '6px' }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handler}>
            <div style={mBody}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelS}>Program Name <span style={{ color: T.danger }}>*</span></label>
                <input style={inputS} value={programName} onChange={e => setProgramName(e.target.value)} placeholder="e.g. Democracy Day, Eid El Kabir" required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelS}>Description</label>
                <textarea style={{ ...inputS, minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelS}>Total Entitled Days (per employee) <span style={{ color: T.danger }}>*</span></label>
                <input style={inputS} type="number" step="0.5" min="0.5" value={totalDays} onChange={e => setTotalDays(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelS}>Valid From <span style={{ color: T.danger }}>*</span></label>
                  <input style={inputS} type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} required />
                </div>
                <div>
                  <label style={labelS}>Valid To <span style={{ color: T.danger }}>*</span></label>
                  <input style={inputS} type="date" value={validTo} onChange={e => setValidTo(e.target.value)} required />
                </div>
              </div>
            </div>
            <div style={mFoot}>
              <button type="button" style={btnOutline} onClick={closeModal} disabled={submitting}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={submitting}>
                {submitting ? 'Processing...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  const renderAssignModal = () => (
    <>
      <div style={overlayS} onClick={closeModal} />
      <div style={{ ...modalShell, width: 'min(38rem, calc(100vw - 2rem))' }}>
        <div style={mHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>
                Assign Employees to "{assigningTo?.program_name}"
              </p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                Select employees who can use this day-off program
              </p>
            </div>
          </div>
          <button onClick={closeModal}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted, borderRadius: '6px' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleAssign}>
          <div style={mBody}>
            {renderBulkStaffPicker()}
          </div>
          <div style={mFoot}>
            <button type="button" style={btnOutline} onClick={closeModal} disabled={submitting}>Cancel</button>
            <button type="submit" style={btnPrimary} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  const renderViewAssignmentsModal = () => (
    <>
      <div style={overlayS} onClick={closeModal} />
      <div style={{ ...modalShell, width: 'min(36rem, calc(100vw - 2rem))' }}>
        <div style={mHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>
                Assigned Employees — "{viewingAssignments?.program_name}"
              </p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                {viewAssignmentList.length} employee(s) assigned
              </p>
            </div>
          </div>
          <button onClick={closeModal}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted, borderRadius: '6px' }}>
            <X size={16} />
          </button>
        </div>
        <div style={mBody}>
          {viewAssignmentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>
              No employees assigned yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {viewAssignmentList.map((a: any) => (
                <div key={a.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.surface }}>
                  <Avatar name={a.user_name || `User ${a.user_id}`} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: T.text }}>{a.user_name || `User #${a.user_id}`}</div>
                    <div style={{ fontSize: '0.72rem', color: T.textMuted, display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                      <span>Used: <strong style={{ color: a.used_days > 0 ? T.warning : T.textMuted }}>{a.used_days || 0}</strong></span>
                      <span>Available: <strong style={{ color: T.success }}>{a.available_days}</strong></span>
                    </div>
                  </div>
                  {a.used_days === 0 && (
                    <button type="button" onClick={() => handleRemoveAssignment(viewingAssignments.id, a.user_id, a.user_name || `User #${a.user_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem', background: 'transparent', color: T.danger, border: `1px solid ${T.dangerBorder}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit' }}>
                      <UserMinus size={12} /> Remove
                    </button>
                  )}
                  {a.used_days > 0 && (
                    <span style={{ fontSize: '0.68rem', color: T.textMuted, fontStyle: 'italic' }}>In use</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={mFoot}>
          <button type="button" style={btnPrimary} onClick={closeModal}>Close</button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: T.successPale, border: `1px solid ${T.successBorder}`, borderRadius: '8px', color: T.success, fontSize: '0.875rem', fontWeight: 500 }}>
          <Check size={16} /> {successMessage}
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
          <Gift size={14} color="#fff" />
        </div>
        <div style={{ flex: 1, fontSize: '0.82rem', color: T.textSub }}>
          <p style={{ margin: 0, fontWeight: 700, color: T.text, marginBottom: '0.25rem' }}>How Time Off Banks work with Day Off</p>
          <p style={{ margin: '0 0 0.3rem' }}>
            <strong>Time Off Programs</strong> are day-off programs (e.g. Democracy Day, Eid El Kabir). 
            Create a program first, then <strong>assign employees</strong> to it. Only assigned employees see it in the FemPWA app.
          </p>
          <p style={{ margin: 0 }}>
            When an employee requests a <strong>Day Off</strong>, they pick one of their assigned programs. 
            After manager clearance + HR approval, the system deducts 1 day from that employee's balance.
          </p>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Time Off Programs</h2>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: T.textMuted }}>Create and manage day-off programs, then assign employees to them</p>
        </div>
        <button style={btnPrimary} onClick={() => { resetForm(); setModal('create'); }}><Plus size={14} /> New Program</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Programs', count: stats.total, color: T.primary },
          { label: 'Active', count: stats.active, color: T.success },
          { label: 'Assigned Employees', count: stats.totalAssigned, color: T.purple },
          { label: 'Total Available Days', count: stats.totalAvailable, color: T.warning },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ ...card, padding: '0.875rem 1rem' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={13} color={T.textMuted} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search programs…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputS, paddingLeft: '2.1rem' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th ch="Program" />
                <Th ch="Days" />
                <Th ch="Valid Period" />
                <Th ch="Assigned" />
                <Th ch="Available" />
                <Th ch="Status" />
                <Th ch="Actions" right />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>
                  <Loader2 size={20} style={{ margin: '0 auto 0.5rem' }} className="animate-spin" />
                  Loading...
                </td></tr>
              ) : programs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>
                  <Gift size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>No programs found</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Click "New Program" to create your first day-off program, then assign employees to it.</p>
                </td></tr>
              ) : (
                programs.map((program: any) => {
                  const status = programStatus(program);
                  return (
                    <tr key={program.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Td ch={
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{program.program_name}</span>
                          {program.description && <div style={{ fontSize: '0.72rem', color: T.textMuted, marginTop: '0.1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{program.description}</div>}
                        </div>
                      } />
                      <Td ch={<span style={{ fontWeight: 600 }}>{program.total_entitled_days}</span>} />
                      <Td ch={<span style={{ fontSize: '0.78rem', color: T.textSub }}>{formatDate(program.valid_from)} — {formatDate(program.valid_to)}</span>} />
                      <Td ch={
                        <button onClick={() => openViewAssignments(program)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem', color: T.primary, fontSize: '0.875rem', fontWeight: 600 }}>
                          <Users size={13} />
                          {program.assigned_count || 0}
                        </button>
                      } />
                      <Td ch={<span style={{ fontWeight: 700, color: T.success }}>{program.total_available_days || 0}</span>} />
                      <Td ch={<StatusBadge label={status.label} />} />
                      <Td ch={
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button style={{ ...btnOutline, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openAssign(program)} title="Assign Employees">
                            <Users size={12} />
                          </button>
                          <button style={{ ...btnOutline, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openViewAssignments(program)} title="View Assignments">
                            <Eye size={12} />
                          </button>
                          <button style={{ ...btnOutline, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openEdit(program)} title="Edit">
                            <Edit size={12} />
                          </button>
                          <button style={{ ...btnDanger, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteProgram(program.id, program.program_name)} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      } right />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.4rem 0.75rem', border: `1px solid ${T.border}`, borderRadius: '6px', background: T.surface, cursor: page > 1 ? 'pointer' : 'default', fontSize: '0.78rem', color: page > 1 ? T.text : T.textMuted, fontFamily: 'inherit' }}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '0.4rem 0.75rem', border: 'none', borderRadius: '6px', background: page === p ? T.primary : 'transparent', color: page === p ? '#fff' : T.textSub, fontWeight: page === p ? 700 : 400, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.4rem 0.75rem', border: `1px solid ${T.border}`, borderRadius: '6px', background: T.surface, cursor: page < totalPages ? 'pointer' : 'default', fontSize: '0.78rem', color: page < totalPages ? T.text : T.textMuted, fontFamily: 'inherit' }}>
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {modal && modalContent()}
    </div>
  );
}
