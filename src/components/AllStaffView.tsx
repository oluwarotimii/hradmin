// This component displays a comprehensive staff directory view
// It provides filtering, searching, and detailed staff profile access

import { useState, useEffect } from 'react';
import { Search, Users, UserX, Plus, Mail, Phone, MapPin, Briefcase, Calendar, UserCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { isStaffOnActiveOffDay } from '../data/staffData';
import { StaffProfileView } from './StaffProfileViewSimple';
import StaffInvitationView from './StaffInvitationView';
import { StaffMember, getAllStaff, activateStaff, deactivateStaff } from '../services/staffManagementService';
import { API_ENDPOINT } from '../config/config';

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
  surfaceMuted:  '#f1f5f9',
  border:        '#e2e8f0',
  borderStrong:  '#cbd5e1',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
};

// Accent palette per department — richer, more distinct
const DEPT_ACCENTS = [
  { dot: '#3b82f6', pale: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },   // blue
  { dot: '#059669', pale: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },   // green
  { dot: '#d97706', pale: '#fffbeb', border: '#fde68a', text: '#92400e' },   // amber
  { dot: '#7c3aed', pale: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },   // purple
  { dot: '#db2777', pale: '#fdf2f8', border: '#fbcfe8', text: '#831843' },   // pink
  { dot: '#0891b2', pale: '#ecfeff', border: '#a5f3fc', text: '#164e63' },   // cyan
  { dot: '#0d9488', pale: '#f0fdfa', border: '#99f6e4', text: '#134e4a' },   // teal
  { dot: '#ea580c', pale: '#fff7ed', border: '#fed7aa', text: '#7c2d12' },   // orange
];

const getDeptAccent = (dept: string) => {
  if (!dept || dept === 'N/A') return DEPT_ACCENTS[0];
  let h = 0;
  for (let i = 0; i < dept.length; i++) { h = ((h << 5) - h) + dept.charCodeAt(i); h = h & h; }
  return DEPT_ACCENTS[Math.abs(h) % DEPT_ACCENTS.length];
};

const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const getAvatarColor = (name?: string) => {
  const charCode = name && name.length > 0 ? name.charCodeAt(0) : 0;
  return avatarPalette[charCode % avatarPalette.length];
};

// ─── Shared style objects ─────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

const inputS: React.CSSProperties = {
  padding: '0.55rem 0.875rem',
  border: `1.5px solid ${T.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: T.text,
  background: T.surface,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const pillBtn = (active: boolean): React.CSSProperties => ({
  padding: '0.4rem 0.9rem',
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontWeight: 600,
  border: active ? 'none' : `1.5px solid ${T.border}`,
  background: active ? T.primary : T.surface,
  color: active ? '#fff' : T.textSub,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.13s',
  boxShadow: active ? `0 1px 4px rgba(30,64,175,0.25)` : 'none',
  whiteSpace: 'nowrap' as const,
});

// ─── Component ────────────────────────────────────────────────────────────────
export function AllStaffView({ initialSelectedStaff }: { initialSelectedStaff?: StaffMember | null }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [minYearsFilter, setMinYearsFilter] = useState<number | ''>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(initialSelectedStaff || null);
  const [showStaffInvitation, setShowStaffInvitation] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, departmentFilter, searchTerm, minYearsFilter]);

  useEffect(() => { loadStaffList(); }, [currentPage, activeFilter, departmentFilter, searchTerm, minYearsFilter]);

  useEffect(() => { if (initialSelectedStaff) setSelectedStaff(initialSelectedStaff); }, [initialSelectedStaff]);


  const loadStaffList = async () => {
    try {
      setLoading(true);
      const filters: { status?: string; department?: string; search?: string; minYears?: number } = {};
      if (activeFilter !== 'all') filters.status = activeFilter === 'active' ? 'active' : 'inactive';
      if (departmentFilter) filters.department = departmentFilter;
      if (searchTerm) filters.search = searchTerm;
      if (minYearsFilter !== '' && minYearsFilter !== null) filters.minYears = Number(minYearsFilter);
      const response = await getAllStaff(currentPage, itemsPerPage, filters);
      if (response.success) {
        const mappedStaff = response.staff || [];
        setStaffList(mappedStaff);
        if (response.pagination) {
          setTotalItems(response.pagination.totalItems);
          setTotalPages(response.pagination.totalPages);
        } else {
          setTotalItems(mappedStaff.length);
          setTotalPages(Math.ceil(mappedStaff.length / itemsPerPage));
        }
        setError(null);
      } else {
        setError(response.message || 'Failed to load staff members');
      }
    } catch (err) {
      setError('An error occurred while loading staff members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffInvited = () => { loadStaffList(); setShowStaffInvitation(false); };

  const handleActivateStaff = async (staffId: string) => {
    setActionLoading(`activate-${staffId}`);
    try {
      const response = await activateStaff(staffId);
      if (response.success) { setError(null); loadStaffList(); }
      else setError(response.message || 'Failed to activate staff member');
    } catch (err) { setError('An error occurred while activating staff member'); console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDeactivateStaff = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;
    setActionLoading(`deactivate-${staffId}`);
    try {
      const response = await deactivateStaff(staffId);
      if (response.success) { setError(null); loadStaffList(); }
      else setError(response.message || 'Failed to deactivate staff member');
    } catch (err) { setError('An error occurred while deactivating staff member'); console.error(err); }
    finally { setActionLoading(null); }
  };

  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr); if (isNaN(start.getTime())) return 0;
    const now = new Date(); let years = now.getFullYear() - start.getFullYear();
    const md = now.getMonth() - start.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < start.getDate())) years -= 1;
    return years >= 0 ? years : 0;
  };

  const departmentOptions = Array.from(new Set(staffList.map(s => s.department))).filter(Boolean) as string[];
  const filteredStaff = staffList;
  const totalStaff = totalItems;
  const activeCount = staffList.filter(s => s.status === 'Active').length;
  const inactiveCount = staffList.filter(s => s.status === 'Inactive').length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff;

  if (selectedStaff) {
    return (
      <StaffProfileView
        staff={selectedStaff}
        onBack={() => { setSelectedStaff(null); loadStaffList(); }}
        onUpdate={(updatedStaff) => { setSelectedStaff(updatedStaff); loadStaffList(); }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .staff-card-item { animation: fadeUp 0.22s ease both; }
        .staff-card-item:nth-child(1)  { animation-delay: 0.02s; }
        .staff-card-item:nth-child(2)  { animation-delay: 0.04s; }
        .staff-card-item:nth-child(3)  { animation-delay: 0.06s; }
        .staff-card-item:nth-child(4)  { animation-delay: 0.08s; }
        .staff-card-item:nth-child(5)  { animation-delay: 0.10s; }
        .staff-card-item:nth-child(6)  { animation-delay: 0.12s; }
        .staff-card-item:nth-child(7)  { animation-delay: 0.14s; }
        .staff-card-item:nth-child(8)  { animation-delay: 0.16s; }
        .staff-card-item:nth-child(n+9){ animation-delay: 0.18s; }

        .staff-card-item:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(15,23,42,0.1) !important; }
        .filter-pill:hover { background: #f1f5f9 !important; }
        .input-focus:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
        .fab-btn:hover { transform: scale(1.08) !important; box-shadow: 0 10px 28px rgba(30,64,175,0.38) !important; }
        .page-btn:hover { background: #eff6ff !important; border-color: #bfdbfe !important; color: #1e40af !important; }
      `}</style>

      {/* ── Floating Action Button ─────────────────────────────────── */}
      <button
        className="fab-btn"
        onClick={() => setShowStaffInvitation(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '3.25rem', height: '3.25rem', borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.primaryLight}, ${T.primary})`,
          border: 'none', cursor: 'pointer', zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px rgba(30,64,175,0.32)`,
          transition: 'transform 0.18s, box-shadow 0.18s',
          color: '#fff',
        }}
        title="Invite New Staff"
      >
        <Plus size={20} />
      </button>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: '0.875rem' }}>
        {[
          { label: 'Total Staff',  value: totalStaff,       icon: Users,     accent: T.primary,  pale: T.primaryPale,  border: T.primaryBorder },
          { label: 'Active',       value: activeCount,      icon: UserCheck, accent: T.success,  pale: T.successPale,  border: T.successBorder },
          { label: 'Inactive',     value: inactiveCount,    icon: UserX,     accent: T.warning,  pale: T.warningPale,  border: T.warningBorder },
          { label: 'Departments',  value: departmentOptions.length, icon: Briefcase, accent: T.purple, pale: T.purplePale, border: '#ddd6fe' },
        ].map(({ label, value, icon: Icon, accent, pale, border }) => (
          <div key={label} style={{
            ...card,
            padding: '1.1rem 1.25rem',
            borderTop: `3px solid ${accent}`,
            background: pale,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            transition: 'box-shadow 0.15s',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{loading ? '—' : value}</p>
            </div>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={accent} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: T.dangerPale, border: `1px solid ${T.dangerBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserX size={15} color={T.danger} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', flex: 1 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.danger, display: 'flex' }}><X size={15} /></button>
        </div>
      )}

      {/* ── Search + Filters ──────────────────────────────────────── */}
      <div style={{ ...card, padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <Search size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="input-focus"
            type="text"
            placeholder="Search name, email, department…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputS, width: '100%', paddingLeft: '2.2rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all','active','inactive'] as const).map(f => (
            <button
              key={f}
              className={activeFilter !== f ? 'filter-pill' : ''}
              style={pillBtn(activeFilter === f)}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' ? `All · ${totalStaff}` : f === 'active' ? `Active · ${activeCount}` : `Inactive · ${inactiveCount}`}
            </button>
          ))}
        </div>

        {/* Department select */}
        <select
          className="input-focus"
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          style={{ ...inputS, minWidth: '150px', cursor: 'pointer' }}
        >
          <option value="">All Departments</option>
          {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Min years */}
        <input
          className="input-focus"
          type="number"
          placeholder="Min years"
          min={0}
          value={minYearsFilter === '' ? '' : String(minYearsFilter)}
          onChange={e => { const v = e.target.value; setMinYearsFilter(v === '' ? '' : Math.max(0, Number(v))); }}
          style={{ ...inputS, width: '110px' }}
        />
      </div>

      {/* ── Staff Directory ───────────────────────────────────────── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Section header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Staff Directory</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>
              {loading ? 'Loading…' : `Showing ${paginatedStaff.length} of ${totalItems} members${totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}`}
            </p>
          </div>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: T.textMuted, fontSize: '0.8rem' }}>
              <div style={{ width: '14px', height: '14px', border: `2px solid ${T.primaryBorder}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Loading
            </div>
          )}
        </div>

        {/* Grid */}
        <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.875rem' }}>
          {paginatedStaff.map((staff, idx) => {
            const accent = getDeptAccent(staff.department);
            const avatarColor = getAvatarColor(staff.firstName);
            const isActive = staff.status === 'Active';
            const onOffDay = isStaffOnActiveOffDay(staff);

            return (
              <div
                key={staff.id}
                className="staff-card-item"
                onClick={() => setSelectedStaff(staff)}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: '12px',
                  padding: '1rem 1.1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                }}
              >
                {/* Coloured left accent stripe */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: accent.dot, borderRadius: '12px 0 0 12px' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '2.75rem', height: '2.75rem', borderRadius: '10px',
                    background: staff.avatar?.includes('http') ? 'transparent' : avatarColor, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                    letterSpacing: '0.02em', boxShadow: staff.avatar?.includes('http') ? 'none' : `0 2px 8px ${avatarColor}55`,
                    overflow: 'hidden'
                  }}>
                    {staff.avatar?.includes('http') ? (
                      <img src={staff.avatar} alt={staff.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      staff.avatar || `${(staff.firstName || '?')[0]}${(staff.lastName || '?')[0]}`.toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + status row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {staff.firstName} {staff.middleName} {staff.lastName}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                        <span style={{
                          padding: '0.15rem 0.55rem', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700,
                          background: isActive ? T.successPale : T.warningPale,
                          color: isActive ? T.success : T.warning,
                          border: `1px solid ${isActive ? T.successBorder : T.warningBorder}`,
                          letterSpacing: '0.02em',
                        }}>{staff.status}</span>
                        {onOffDay && (
                          <span style={{ padding: '0.12rem 0.5rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 600, background: T.warningPale, color: T.warning, border: `1px solid ${T.warningBorder}` }}>
                            Off Day
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role */}
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {staff.departmentRole}
                    </p>

                    {/* Dept tag */}
                    <div style={{ marginBottom: '0.65rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                        background: accent.pale, color: accent.text, border: `1px solid ${accent.border}`,
                      }}>
                        <Briefcase size={10} />
                        {staff.department}
                      </span>
                    </div>

                    {/* Contact row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={11} color={T.textMuted} />
                        <span style={{ fontSize: '0.75rem', color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{staff.email}</span>
                      </div>
                      {staff.phoneNumber && staff.phoneNumber !== 'N/A' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={11} color={T.textMuted} />
                          <span style={{ fontSize: '0.75rem', color: T.textSub }}>{staff.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {!loading && filteredStaff.length === 0 && (
          <div style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: T.primaryPale, border: `1px solid ${T.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color={T.primary} />
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: T.text }}>No staff members found</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: T.textMuted }}>Try adjusting your search or filters</p>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: T.surfaceAlt }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: T.textMuted }}>
              Showing <strong style={{ color: T.text }}>{startIndex + 1}</strong>–<strong style={{ color: T.text }}>{Math.min(endIndex, totalItems)}</strong> of <strong style={{ color: T.text }}>{totalItems}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {/* Prev */}
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: `1px solid ${T.border}`, background: T.surface, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
              >
                <ChevronLeft size={14} color={T.textSub} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    className={!isActive ? 'page-btn' : ''}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: isActive ? 'none' : `1px solid ${T.border}`, background: isActive ? T.primary : T.surface, color: isActive ? '#fff' : T.textSub, cursor: 'pointer', fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', boxShadow: isActive ? `0 1px 4px rgba(30,64,175,0.25)` : 'none', fontFamily: 'inherit' }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span style={{ color: T.textMuted, fontSize: '0.8rem', padding: '0 0.2rem' }}>…</span>
              )}

              {/* Next */}
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: `1px solid ${T.border}`, background: T.surface, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
              >
                <ChevronRight size={14} color={T.textSub} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Staff Invitation Modal ─────────────────────────────────── */}
      {showStaffInvitation && (
        <div
          onClick={() => setShowStaffInvitation(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: T.surface, borderRadius: '16px', boxShadow: '0 20px 60px rgba(15,23,42,0.22)', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal header */}
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceAlt, borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={15} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.text }}>Invite New Staff</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Send an invitation to a new team member</p>
                </div>
              </div>
              <button
                onClick={() => setShowStaffInvitation(false)}
                style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.surfaceMuted)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <StaffInvitationView onSuccess={handleStaffInvited} />
            </div>
          </div>
        </div>
      )}

      {/* spin keyframe */}
      <style>{` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
