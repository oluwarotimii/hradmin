import { useState, useEffect } from 'react';
import { Clock, Trash2, Plus, Building, Users, User, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

interface Mapping {
  id: number;
  staff_id: number | null;
  department_id: number | null;
  branch_id: number;
  created_by: number;
  created_at: string;
  staff_name?: string;
  department_name?: string;
  branch_name: string;
  target_name: string;
}

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

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
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: T.danger,
  boxShadow: `0 1px 3px rgba(220,38,38,0.28)`,
};

const hintS: React.CSSProperties = {
  margin: '0.3rem 0 0',
  fontSize: '0.75rem',
  color: T.textMuted,
  lineHeight: 1.5,
};

export function BranchTimeMappingView() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [mappingType, setMappingType] = useState<'staff' | 'department'>('staff');
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  };

  const fetchMappings = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/attendance/time-mappings`, getAuthHeaders());
      setMappings(res.data?.data?.mappings || []);
    } catch (err) {
      console.error('Failed to load mappings', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/staff?limit=1000`, getAuthHeaders());
      const data = res.data?.data?.staff || res.data?.staff || [];
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/departments`, getAuthHeaders());
      setDepartments(res.data?.data?.departments || res.data?.departments || []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/branches`, getAuthHeaders());
      setBranches(res.data?.data?.branches || res.data?.branches || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMappings(), fetchStaff(), fetchDepartments(), fetchBranches()]).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (selectedBranchId === '') return;
    if (mappingType === 'staff' && selectedStaffId === '') return;
    if (mappingType === 'department' && selectedDepartmentId === '') return;

    setSubmitting(true);
    try {
      const payload = {
        branch_id: selectedBranchId,
        staff_id: mappingType === 'staff' ? selectedStaffId : null,
        department_id: mappingType === 'department' ? selectedDepartmentId : null,
      };
      await axios.post(`${API_ENDPOINT}/attendance/time-mappings`, payload, getAuthHeaders());
      setSelectedStaffId('');
      setSelectedDepartmentId('');
      setSelectedBranchId('');
      await fetchMappings();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this time mapping?')) return;
    try {
      await axios.delete(`${API_ENDPOINT}/attendance/time-mappings/${id}`, getAuthHeaders());
      await fetchMappings();
    } catch (err) {
      console.error('Failed to delete mapping', err);
    }
  };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building size={14} color={T.primary}/>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Branch Time Mapping</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Assign staff or departments to use a specific branch's resumption time</p>
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* ── Add New Mapping ───────────────────────────────────── */}
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '6px', background: T.successPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={12} color={T.success} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text }}>Add New Mapping</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.875rem', alignItems: 'end' }}>
            <div>
              <label style={labelS}>Type</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={mappingType}
                  onChange={e => setMappingType(e.target.value as 'staff' | 'department')}
                  style={{ ...inputS, appearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}
                >
                  <option value="staff">Staff Member</option>
                  <option value="department">Department</option>
                </select>
                <ChevronDown size={13} color={T.textMuted} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              </div>
            </div>

            <div>
              <label style={labelS}>{mappingType === 'staff' ? 'Staff Member' : 'Department'}</label>
              <div style={{ position: 'relative' }}>
                {mappingType === 'staff' ? (
                  <select
                    value={selectedStaffId}
                    onChange={e => setSelectedStaffId(e.target.value ? Number(e.target.value) : '')}
                    style={{ ...inputS, appearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}
                  >
                    <option value="">Select staff...</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || `${s.first_name} ${s.last_name}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedDepartmentId}
                    onChange={e => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : '')}
                    style={{ ...inputS, appearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                <ChevronDown size={13} color={T.textMuted} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              </div>
            </div>

            <div>
              <label style={labelS}>Target Branch</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value ? Number(e.target.value) : '')}
                  style={{ ...inputS, appearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}
                >
                  <option value="">Select branch...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} color={T.textMuted} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={submitting || selectedBranchId === '' || (mappingType === 'staff' && selectedStaffId === '') || (mappingType === 'department' && selectedDepartmentId === '')}
              style={{ ...btnPrimary, opacity: (submitting || selectedBranchId === '' || (mappingType === 'staff' && selectedStaffId === '') || (mappingType === 'department' && selectedDepartmentId === '')) ? 0.65 : 1, cursor: (submitting || selectedBranchId === '' || (mappingType === 'staff' && selectedStaffId === '') || (mappingType === 'department' && selectedDepartmentId === '')) ? 'not-allowed' : 'pointer', height: 'fit-content' }}
            >
              <Plus size={14} />
              {submitting ? 'Adding...' : 'Add Mapping'}
            </button>
          </div>
        </div>

        {/* ── Existing Mappings Table ───────────────────────────── */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 60px', gap: '0.5rem 0.75rem', padding: '0 0.25rem 0.5rem', borderBottom: `1px solid ${T.border}`, marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Uses Branch</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Created</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: T.textMuted, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ width: 16, height: 16, border: `2px solid ${T.primaryBorder}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'sv-spin 0.7s linear infinite' }}/>
              Loading mappings...
            </div>
          ) : mappings.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: T.textMuted }}>
              <Building size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>No branch time mappings configured</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem' }}>Add a mapping above to assign a staff member or department to a specific branch.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {mappings.map(m => (
                <div key={m.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 60px', gap: '0.5rem 0.75rem', alignItems: 'center', padding: '0.75rem 0.85rem', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: '10px', transition: 'box-shadow 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '1.6rem', height: '1.6rem', borderRadius: '6px', background: m.staff_id ? T.primaryPale : T.warningPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.staff_id ? <User size={12} color={T.primary} /> : <Users size={12} color={T.warning} />}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: T.textSub }}>{m.staff_id ? 'Staff' : 'Department'}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: T.text }}>{m.target_name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building size={12} color={T.textMuted} />
                    <span style={{ fontSize: '0.82rem', color: T.textSub }}>{m.branch_name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: T.textMuted }}>{new Date(m.created_at).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => handleDelete(m.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', color: T.textMuted, transition: 'background 0.13s, color 0.13s' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`@keyframes sv-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
