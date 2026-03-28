// StaffLocationAssignmentView.tsx
// Admin interface for managing staff location assignments
// Redesigned with new design system + multiple locations support

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Building,
  Search,
  Filter,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Map,
  ChevronDown,
  Info
} from 'lucide-react';
import { getAllStaff } from '../services/staffManagementService';
import { getAllAttendanceLocations, AttendanceLocation } from '../services/attendanceService';
import { getAllBranches } from '../services/branchManagementService';
import axios from 'axios';
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

// ─── Shared styles ────────────────────────────────────────────────────────────
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

const labelS: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: T.text,
  marginBottom: '0.4rem',
};

const btnP: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: 'none',
  background: T.primary,
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
  boxShadow: '0 2px 8px rgba(30,64,175,0.2)',
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  border: `1.5px solid ${T.border}`,
  background: T.surface,
  color: T.textSub,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
};

const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const getAvatarColor = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

interface StaffMember {
  user_id: number;
  employee_id?: string;
  full_name: string;
  email: string;
  branch_id?: number;
  branch_name?: string;
  department?: string;
  assigned_location_id?: number;
  location_name?: string;
  location_assignments?: number[] | string;
  location_notes?: string;
  status: string;
}

const StaffLocationAssignmentView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [filterHasLocation, setFilterHasLocation] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Selection state
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [bulkLocationId, setBulkLocationId] = useState<number | ''>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Edit state
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    assigned_location_id: 0,
    secondary_locations: [] as number[],
    location_notes: ''
  });

  // Location dropdown hover state
  const [hoveredStaffId, setHoveredStaffId] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from staff-location-assignments endpoint which has all the data we need
      const [assignmentsRes, locationsRes, branchesRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/staff-location-assignments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }),
        getAllAttendanceLocations(),
        getAllBranches()
      ]);

      if (assignmentsRes.data.success && assignmentsRes.data.data.assignments) {
        setStaffMembers(assignmentsRes.data.data.assignments.map((s: any) => ({
          user_id: s.user_id,
          employee_id: s.employee_id,
          full_name: s.full_name,
          email: s.email,
          branch_id: s.branch_id,
          branch_name: s.branch_name,
          department: s.department,
          assigned_location_id: s.assigned_location_id,
          location_name: s.location_name,
          location_assignments: s.location_assignments,
          location_notes: s.location_notes,
          status: s.status
        })));
      }

      if (locationsRes.success && locationsRes.locations) {
        setLocations(locationsRes.locations);
      }

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches.map((b: any) => ({
          id: b.id,
          name: b.name
        })));
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter staff
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = searchTerm === '' ||
      staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || staff.branch_id === selectedBranch;

    const hasAnyLocation = staff.assigned_location_id || 
      (staff.location_assignments && 
        (Array.isArray(staff.location_assignments) ? staff.location_assignments.length > 0 : staff.location_assignments !== '[]'));
    
    const matchesLocationFilter = filterHasLocation === 'all' ||
      (filterHasLocation === 'assigned' && hasAnyLocation) ||
      (filterHasLocation === 'unassigned' && !hasAnyLocation);

    return matchesSearch && matchesBranch && matchesLocationFilter;
  });

  // Parse location assignments
  const parseLocationAssignments = (staff: StaffMember): number[] => {
    if (!staff.location_assignments) return [];
    if (Array.isArray(staff.location_assignments)) return staff.location_assignments;
    try {
      const parsed = JSON.parse(staff.location_assignments);
      // Handle both array format and object format with secondary_locations
      if (Array.isArray(parsed)) return parsed;
      if (parsed && parsed.secondary_locations && Array.isArray(parsed.secondary_locations)) {
        return parsed.secondary_locations;
      }
      return [];
    } catch {
      return [];
    }
  };

  // Get all location names for a staff member
  const getLocationNames = (staff: StaffMember): string[] => {
    const assignmentIds = parseLocationAssignments(staff);
    
    // If no secondary locations but has primary, return just primary
    if (assignmentIds.length === 0 && staff.assigned_location_id) {
      const loc = locations.find(l => l.id === staff.assigned_location_id);
      return loc ? [loc.name] : ['Unknown location'];
    }
    
    // Map IDs to names, including primary if it's not in the array
    const allIds = new Set(assignmentIds);
    if (staff.assigned_location_id) {
      allIds.add(staff.assigned_location_id);
    }
    
    const names = Array.from(allIds)
      .map(id => {
        const loc = locations.find(l => l.id === id);
        return loc ? loc.name : null;
      })
      .filter(Boolean) as string[];
    
    return names.length > 0 ? names : ['No location assigned'];
  };

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / pageSize);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, filterHasLocation]);

  // Calculate statistics
  const totalStaff = staffMembers.length;
  const assignedCount = staffMembers.filter(s => 
    s.assigned_location_id || 
    (s.location_assignments && 
      (Array.isArray(s.location_assignments) ? s.location_assignments.length > 0 : s.location_assignments !== '[]'))
  ).length;
  const unassignedCount = totalStaff - assignedCount;
  const assignmentRate = totalStaff > 0 ? Math.round((assignedCount / totalStaff) * 100) : 0;

  // Handle individual assignment update
  const handleUpdateAssignment = async (userId: number) => {
    setSaving(true);
    setError(null);

    try {
      // Prepare payload with location_assignments in JSON format
      const payload = {
        assigned_location_id: editForm.assigned_location_id,
        location_notes: editForm.location_notes,
        location_assignments: {
          primary_location: editForm.assigned_location_id,
          secondary_locations: editForm.secondary_locations
        }
      };

      const response = await axios.put(
        `${API_ENDPOINT}/staff-location-assignments/${userId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Location assignment updated successfully');
        setEditingStaffId(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data.message || 'Failed to update assignment');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk assignment
  const handleBulkAssignment = async () => {
    if (!bulkLocationId || selectedStaff.length === 0) {
      setError('Please select a location and at least one staff member');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Get current staff data to append to existing locations
      const currentStaffData = staffMembers.filter(s => selectedStaff.includes(s.user_id));
      
      const assignments = currentStaffData.map(staff => {
        // Get existing locations
        const existingLocations = parseLocationAssignments(staff);
        
        // Add new location if not already assigned
        const updatedLocations = existingLocations.includes(bulkLocationId as number)
          ? existingLocations
          : [...existingLocations, bulkLocationId as number];
        
        return {
          user_id: staff.user_id,
          assigned_location_id: staff.assigned_location_id || bulkLocationId,
          location_assignments: updatedLocations,
          location_notes: staff.location_notes
        };
      });

      const response = await axios.post(
        `${API_ENDPOINT}/staff-location-assignments/bulk-update`,
        { assignments },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(`Successfully assigned ${selectedStaff.length} staff member(s)`);
        setSelectedStaff([]);
        setBulkLocationId('');
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data.message || 'Failed to update assignments');
      }
    } catch (err: any) {
      console.error('Bulk update error:', err);
      setError(err.response?.data?.message || 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  // Toggle staff selection
  const toggleStaffSelection = (userId: number) => {
    setSelectedStaff(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all on current page
  const toggleSelectAll = () => {
    if (selectedStaff.length === paginatedStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(paginatedStaff.map(s => s.user_id));
    }
  };

  // Get unique branches for filter (from loaded branches state)
  const branchOptions = branches;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .staff-row { animation: fadeUp 0.22s ease both; }
        .staff-row:hover { background: ${T.surfaceMuted} !important; }
        .input-focus:focus { border-color: ${T.primaryLight} !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
        .btn-primary-hover:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(30,64,175,0.3) !important; }
        .btn-outline-hover:hover { background: ${T.surfaceMuted} !important; border-color: ${T.borderStrong} !important; }
        
        /* Location dropdown */
        .location-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 50;
          min-width: 280px;
          max-height: 280px;
          overflow-y: auto;
          background: ${T.surface};
          border: 1px solid ${T.borderStrong};
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(15,23,42,0.15);
          padding: 0.5rem;
          animation: fadeUp 0.15s ease;
        }
        .location-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.6rem;
          border-radius: 6px;
          font-size: 0.8rem;
          color: ${T.text};
          transition: background 0.12s;
        }
        .location-dropdown-item:hover {
          background: ${T.surfaceMuted};
        }
        .location-dropdown-icon {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: T.dangerPale, 
          border: `1px solid ${T.dangerBorder}`, 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem' 
        }}>
          <AlertCircle size={16} color={T.danger} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', flex: 1 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.danger, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Success banner ───────────────────────────────────────── */}
      {successMessage && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: T.successPale, 
          border: `1px solid ${T.successBorder}`, 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem' 
        }}>
          <CheckCircle size={16} color={T.success} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', flex: 1 }}>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.success, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: T.text }}>Staff Location Assignments</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: T.textMuted }}>
          Assign specific attendance locations to staff members for controlled check-in
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Staff', value: totalStaff, icon: Users, accent: T.primary, pale: T.primaryPale },
          { label: 'Assigned', value: assignedCount, icon: UserCheck, accent: T.success, pale: T.successPale },
          { label: 'Unassigned', value: unassignedCount, icon: MapPin, accent: T.warning, pale: T.warningPale },
          { label: 'Assignment Rate', value: `${assignmentRate}%`, icon: Map, accent: T.purple, pale: T.purplePale },
        ].map(({ label, value, icon: Icon, accent, pale }) => (
          <div key={label} style={{
            ...card,
            padding: '1.1rem 1.25rem',
            borderTop: `3px solid ${accent}`,
            background: pale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ 
              width: '2.75rem', 
              height: '2.75rem', 
              borderRadius: '10px', 
              background: `${accent}1a`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0 
            }}>
              <Icon size={18} color={accent} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div style={{ ...card, padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ ...btnOutline, padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
          className="btn-outline-hover"
        >
          <Filter size={14} />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          style={{ 
            ...btnOutline, 
            padding: '0.5rem 0.875rem', 
            fontSize: '0.8rem',
            opacity: loading ? 0.6 : 1 
          }}
          className="btn-outline-hover"
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      {showFilters && (
        <div style={{ ...card, padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Search */}
            <div>
              <label style={labelS}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  className="input-focus"
                  type="text"
                  placeholder="Name, email, or employee ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputS, width: '100%', boxSizing: 'border-box', paddingLeft: '2.2rem' }}
                />
              </div>
            </div>

            {/* Branch filter */}
            <div>
              <label style={labelS}>Branch</label>
              <select
                className="input-focus"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
                style={{ ...inputS, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                <option value="">All Branches</option>
                {branchOptions.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Location assignment filter */}
            <div>
              <label style={labelS}>Location Status</label>
              <select
                className="input-focus"
                value={filterHasLocation}
                onChange={(e) => setFilterHasLocation(e.target.value as any)}
                style={{ ...inputS, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                <option value="all">All Staff</option>
                <option value="assigned">With Location</option>
                <option value="unassigned">Without Location</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ─────────────────────────────────────────── */}
      {selectedStaff.length > 0 && (
        <div style={{ 
          ...card, 
          padding: '1rem 1.25rem', 
          background: T.primaryPale,
          border: `1px solid ${T.primaryBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: T.primary, fontSize: '0.85rem', fontWeight: 600 }}>
            <Users size={16} />
            {selectedStaff.length} staff member(s) selected
          </div>
          <select
            className="input-focus"
            value={bulkLocationId}
            onChange={(e) => setBulkLocationId(e.target.value ? Number(e.target.value) : '')}
            style={{ ...inputS, minWidth: '200px', cursor: 'pointer' }}
          >
            <option value="">Select location to assign...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <button
            onClick={handleBulkAssignment}
            disabled={saving || !bulkLocationId}
            style={{ 
              ...btnP, 
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              opacity: saving || !bulkLocationId ? 0.7 : 1,
              cursor: saving || !bulkLocationId ? 'not-allowed' : 'pointer'
            }}
            className="btn-primary-hover"
          >
            <Save size={14} />
            {saving ? 'Assigning...' : 'Assign to All'}
          </button>
          <button
            onClick={() => setSelectedStaff([])}
            style={{ ...btnOutline, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            className="btn-outline-hover"
          >
            <X size={14} />
            Clear Selection
          </button>
        </div>
      )}

      {/* ── Staff Table ──────────────────────────────────────────── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Staff Directory</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>
              {loading ? 'Loading...' : `Showing ${paginatedStaff.length} of ${filteredStaff.length} members`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selectedStaff.length === paginatedStaff.length && paginatedStaff.length > 0}
                    onChange={toggleSelectAll}
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: T.primary }}
                  />
                </th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Member</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Locations</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.map((staff) => {
                const avatarColor = getAvatarColor(staff.full_name);
                const locationNames = getLocationNames(staff);
                const isEditing = editingStaffId === staff.user_id;
                const isHovered = hoveredStaffId === staff.user_id;

                return (
                  <tr
                    key={staff.user_id}
                    className="staff-row"
                    style={{ 
                      borderBottom: `1px solid ${T.border}`,
                      transition: 'background 0.12s',
                      position: 'relative'
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(staff.user_id)}
                        onChange={() => toggleStaffSelection(staff.user_id)}
                        style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: T.primary }}
                      />
                    </td>

                    {/* Staff info */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '10px',
                          background: avatarColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: `0 2px 8px ${avatarColor}5`,
                        }}>
                          {staff.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: T.text }}>
                            {staff.full_name}
                          </p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                            {staff.employee_id || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: T.textSub }}>
                        <Building size={14} color={T.textMuted} />
                        {staff.branch_name || 'N/A'}
                      </div>
                      {staff.department && (
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                          {staff.department}
                        </p>
                      )}
                    </td>

                    {/* Location assignments with click modal */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {locationNames.length > 0 ? (
                        <>
                          {/* Primary location badge - Click to open modal */}
                          <button
                            onClick={() => {
                              if (locationNames.length > 1) {
                                setHoveredStaffId(staff.user_id);
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: T.primaryPale,
                              color: T.primary,
                              border: `1px solid ${T.primaryBorder}`,
                              cursor: locationNames.length > 1 ? 'pointer' : 'default',
                              transition: 'all 0.12s',
                            }}
                            onMouseEnter={(e) => {
                              if (locationNames.length > 1) {
                                e.currentTarget.style.background = T.primary;
                                e.currentTarget.style.color = '#fff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (locationNames.length > 1) {
                                e.currentTarget.style.background = T.primaryPale;
                                e.currentTarget.style.color = T.primary;
                              }
                            }}
                          >
                            <MapPin size={12} />
                            <span>{locationNames[0]}</span>
                            {locationNames.length > 1 && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '1.1rem',
                                height: '1.1rem',
                                borderRadius: '50%',
                                background: T.primary,
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '0 0.3rem',
                              }}>
                                +{locationNames.length - 1}
                              </span>
                            )}
                          </button>

                          {/* Locations Modal - Shows on Click */}
                          {isHovered && locationNames.length > 1 && (
                            <>
                              {/* Dark overlay */}
                              <div
                                style={{
                                  position: 'fixed' as any,
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'rgba(0,0,0,0.6)',
                                  zIndex: 2147483647, // Maximum z-index value
                                }}
                                onClick={() => setHoveredStaffId(null)}
                              />

                              {/* Modal centered on screen */}
                              <div style={{
                                position: 'fixed' as any,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 2147483647, // Maximum z-index value
                                minWidth: '400px',
                                maxWidth: '600px',
                                background: T.surface,
                                border: `3px solid ${T.primary}`,
                                borderRadius: '12px',
                                boxShadow: '0 24px 96px rgba(0,0,0,0.4)',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                scrollBehavior: 'smooth'
                              }}>
                                <div style={{
                                  padding: '0.875rem 1.25rem',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  color: T.text,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  borderBottom: `2px solid ${T.borderStrong}`,
                                  background: T.primaryPale,
                                  borderRadius: '12px 12px 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  position: 'sticky',
                                  top: 0,
                                  zIndex: 1
                                }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} color={T.primary} />
                                    {staff.full_name}'s Locations ({locationNames.length})
                                  </span>
                                  <button
                                    onClick={() => setHoveredStaffId(null)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '4px',
                                      transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = T.surfaceMuted}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <X size={18} color={T.text} />
                                  </button>
                                </div>
                              {locationNames.map((locName, idx) => {
                                const loc = locations.find(l => l.name === locName);
                                const color = loc?.color || T.primary;
                                return (
                                  <div key={idx} className="location-dropdown-item">
                                    <div
                                      className="location-dropdown-icon"
                                      style={{ background: `${color}20` }}
                                    >
                                      <MapPin size={11} color={color} />
                                    </div>
                                    <span style={{ flex: 1 }}>{locName}</span>
                                    {idx === 0 && (
                                      <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        color: T.textMuted,
                                        padding: '0.1rem 0.35rem',
                                        background: T.surfaceMuted,
                                        borderRadius: '4px'
                                      }}>
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: T.textMuted, fontStyle: 'italic' }}>
                          No location assigned
                        </span>
                      )}
                      </td>

                    {/* Notes */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {/* Secondary Locations Multi-Selector */}
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '0.82rem', 
                              fontWeight: 600, 
                              color: T.text,
                              marginBottom: '0.4rem'
                            }}>
                              Secondary Locations
                              <span style={{ 
                                display: 'block', 
                                fontSize: '0.7rem', 
                                fontWeight: 400, 
                                color: T.textMuted,
                                marginTop: '0.25rem'
                              }}>
                                Staff can check in at ANY of these locations
                              </span>
                            </label>
                            
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                              gap: '0.5rem',
                              marginTop: '0.5rem',
                              maxHeight: '300px',
                              overflowY: 'auto',
                              padding: '0.5rem',
                              background: T.surfaceMuted,
                              borderRadius: '6px'
                            }}>
                              {locations.map(location => {
                                const isSelected = editForm.secondary_locations.includes(location.id);
                                const isPrimary = editForm.assigned_location_id === location.id;
                                
                                return (
                                  <button
                                    key={location.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        // Remove from secondary
                                        setEditForm({
                                          ...editForm,
                                          secondary_locations: editForm.secondary_locations.filter(id => id !== location.id)
                                        });
                                      } else {
                                        // Add to secondary (don't add if it's the primary)
                                        if (!isPrimary) {
                                          setEditForm({
                                            ...editForm,
                                            secondary_locations: [...editForm.secondary_locations, location.id]
                                          });
                                        }
                                      }
                                    }}
                                    disabled={isPrimary}
                                    style={{
                                      padding: '0.5rem 0.65rem',
                                      borderRadius: '6px',
                                      border: isSelected 
                                        ? `2px solid ${T.primary}` 
                                        : isPrimary
                                          ? `2px solid ${T.success}`
                                          : `1.5px solid ${T.border}`,
                                      background: isSelected 
                                        ? T.primaryPale 
                                        : isPrimary
                                          ? T.successPale
                                          : T.surface,
                                      color: isSelected || isPrimary ? T.primary : T.textSub,
                                      fontSize: '0.72rem',
                                      fontWeight: isSelected || isPrimary ? 600 : 500,
                                      cursor: isPrimary ? 'not-allowed' : 'pointer',
                                      opacity: isPrimary ? 0.6 : 1,
                                      transition: 'all 0.12s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '0.4rem',
                                      minHeight: '2.5rem'
                                    }}
                                  >
                                    <span style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '0.35rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1
                                    }}>
                                      <MapPin size={11} />
                                      {location.name}
                                    </span>
                                    {isSelected && <div style={{ color: T.primary, flexShrink: 0 }}><CheckCircle size={12} /></div>}
                                    {isPrimary && <span style={{ fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>PRI</span>}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {editForm.secondary_locations.length > 0 && (
                              <div style={{ 
                                marginTop: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                background: T.primaryPale,
                                borderRadius: '6px',
                                fontSize: '0.75rem'
                              }}>
                                <strong style={{ color: T.primary }}>Selected:</strong>{' '}
                                <span style={{ color: T.primary, fontWeight: 600 }}>{editForm.secondary_locations.length}</span> location(s)
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  {editForm.secondary_locations.map(id => {
                                    const loc = locations.find(l => l.id === id);
                                    if (!loc) return null;
                                    return (
                                      <span key={id} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.2rem 0.5rem',
                                        background: T.surface,
                                        color: T.primary,
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                      }}>
                                        <MapPin size={9} />
                                        {loc.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Notes Textarea */}
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '0.82rem', 
                              fontWeight: 600, 
                              color: T.text,
                              marginBottom: '0.4rem'
                            }}>
                              Notes
                            </label>
                            <textarea
                              value={editForm.location_notes}
                              onChange={(e) => setEditForm({ ...editForm, location_notes: e.target.value })}
                              placeholder="Add notes..."
                              rows={2}
                              className="input-focus"
                              style={{
                                ...inputS,
                                width: '100%',
                                boxSizing: 'border-box',
                                resize: 'vertical',
                                minHeight: '60px'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: T.textMuted, fontStyle: 'italic' }}>
                          Configure locations
                        </span>
                      )}
                      </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleUpdateAssignment(staff.user_id)}
                            disabled={saving}
                            style={{ 
                              ...btnP, 
                              padding: '0.4rem 0.75rem',
                              fontSize: '0.75rem',
                              opacity: saving ? 0.7 : 1,
                            }}
                            className="btn-primary-hover"
                          >
                            <Save size={13} />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingStaffId(null)}
                            disabled={saving}
                            style={{ 
                              ...btnOutline, 
                              padding: '0.4rem 0.75rem',
                              fontSize: '0.75rem',
                            }}
                            className="btn-outline-hover"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStaffId(staff.user_id);
                            
                            // Parse existing secondary locations
                            let secondaryLocs: number[] = [];
                            if (staff.location_assignments) {
                              if (Array.isArray(staff.location_assignments)) {
                                secondaryLocs = staff.location_assignments;
                              } else {
                                try {
                                  const parsed = JSON.parse(staff.location_assignments);
                                  if (parsed.secondary_locations && Array.isArray(parsed.secondary_locations)) {
                                    secondaryLocs = parsed.secondary_locations;
                                  }
                                } catch (e) {
                                  console.error('Failed to parse location_assignments:', e);
                                }
                              }
                            }
                            
                            setEditForm({
                              assigned_location_id: staff.assigned_location_id || 0,
                              secondary_locations: secondaryLocs,
                              location_notes: staff.location_notes || ''
                            });
                          }}
                          style={{
                            ...btnOutline,
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.75rem',
                          }}
                          className="btn-outline-hover"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedStaff.length === 0 && (
          <div style={{ padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              borderRadius: '50%', 
              background: T.primaryPale, 
              border: `1px solid ${T.primaryBorder}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Users size={20} color={T.primary} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, color: T.text, fontSize: '0.95rem' }}>No staff members found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: T.textMuted }}>
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '0.875rem 1.25rem', 
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: T.surfaceAlt
          }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: T.textMuted }}>
              Showing <strong style={{ color: T.text }}>{(currentPage - 1) * pageSize + 1}</strong>–<strong style={{ color: T.text }}>{Math.min(currentPage * pageSize, filteredStaff.length)}</strong> of <strong style={{ color: T.text }}>{filteredStaff.length}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: '7px', 
                  border: `1px solid ${T.border}`, 
                  background: T.surface, 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                  opacity: currentPage === 1 ? 0.4 : 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <ChevronDown size={14} color={T.textSub} style={{ transform: 'rotate(90deg)' }} />
              </button>
              
              <span style={{ fontSize: '0.8rem', color: T.text, fontWeight: 600, minWidth: '3rem', textAlign: 'center' }}>
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: '7px', 
                  border: `1px solid ${T.border}`, 
                  background: T.surface, 
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', 
                  opacity: currentPage >= totalPages ? 0.4 : 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <ChevronDown size={14} color={T.textSub} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Info Box ────────────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.875rem', 
        padding: '1rem 1.25rem', 
        background: T.warningPale, 
        border: `1px solid ${T.warningBorder}`, 
        borderRadius: '12px' 
      }}>
        <Info size={18} color={T.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>About Location Assignments</h4>
          <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li style={{ fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: T.warning, marginTop: '2px' }}>•</span>
              Staff can be assigned to multiple locations for flexible attendance tracking
            </li>
            <li style={{ fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: T.warning, marginTop: '2px' }}>•</span>
              Hover over location badges to see all assigned locations
            </li>
            <li style={{ fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: T.warning, marginTop: '2px' }}>•</span>
              Use bulk assignment to quickly assign the same location to multiple staff members
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffLocationAssignmentView;
