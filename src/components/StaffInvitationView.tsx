import React, { useState, useEffect } from 'react';
import { X, Mail, User, Briefcase, Building, Send, RefreshCw, Trash2, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Users } from 'lucide-react';
import {
  inviteStaff,
  getAllStaffInvitations,
  getAvailableRolesForInvitation,
  resendStaffInvitation,
  revokeStaffInvitation,
  StaffInvitation as StaffInvitationType
} from '../services/staffManagementService';
import { getAllBranches as getAllBranchesService } from '../services/branchManagementService';
import { getAllDepartments } from '../services/departmentManagementService';
import BulkInviteModal from './BulkInviteModal';

interface StaffInvitationViewProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface StaffInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  roleName: string;
  branchName: string;
  departmentName: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

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

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
  borderRadius: '7px',
  border: 'none',
  background: 'transparent',
  color: T.textMuted,
  cursor: 'pointer',
  transition: 'background 0.12s',
};

const statusBadge = (status: string): React.CSSProperties => {
  const config: any = {
    pending: { bg: T.warningPale, text: T.warning, border: T.warningBorder },
    accepted: { bg: T.successPale, text: T.success, border: T.successBorder },
    expired: { bg: T.dangerPale, text: T.danger, border: T.dangerBorder },
    cancelled: { bg: T.surfaceMuted, text: T.textMuted, border: T.border },
  };
  const c = config[status] || config.pending;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: c.bg,
    color: c.text,
    border: `1px solid ${c.border}`,
    letterSpacing: '0.02em',
  };
};

const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const getAvatarColor = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

// ─── Component ────────────────────────────────────────────────────────────────
const StaffInvitationView: React.FC<StaffInvitationViewProps> = ({ onSuccess, onClose }) => {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load invitations
      const invitationsResponse = await getAllStaffInvitations();
      if (invitationsResponse.success && invitationsResponse.invitations) {
        const mappedInvitations: StaffInvitation[] = invitationsResponse.invitations.map((inv: any) => ({
          id: inv.id?.toString() || inv.invitation_id?.toString(),
          email: inv.email || inv.personal_email,
          firstName: inv.first_name || inv.firstName,
          lastName: inv.last_name || inv.lastName,
          fullName: `${inv.first_name || inv.firstName || ''} ${inv.last_name || inv.lastName || ''}`.trim(),
          status: (inv.status || 'pending') as 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined',
          roleName: inv.role_name || inv.roleName || 'N/A',
          branchName: inv.branch_name || inv.branchName || 'N/A',
          departmentName: inv.department_name || inv.departmentName || 'N/A',
          invitedBy: inv.invited_by_name || inv.invitedByName || 'System',
          createdAt: inv.created_at || inv.createdAt,
          expiresAt: inv.expires_at || inv.expiresAt,
          acceptedAt: inv.accepted_at || inv.acceptedAt,
          first_login_at: inv.first_login_at,
          first_login_ip: inv.first_login_ip,
          profile_completed: !!inv.profile_completed,
          last_activity_at: inv.last_activity_at,
          declined_at: inv.declined_at,
        }));
        setInvitations(mappedInvitations);
      } else {
        setInvitations([]);
      }

      // Load roles
      const rolesResponse = await getAvailableRolesForInvitation();
      if (rolesResponse.success && rolesResponse.roles) {
        setRoles(rolesResponse.roles);
      }

      // Load branches
      const branchesResponse = await getAllBranchesService();
      if (branchesResponse.success && branchesResponse.branches) {
        setBranches(branchesResponse.branches);
      }

      // Load departments
      const departmentsResponse = await getAllDepartments();
      if (departmentsResponse.success && departmentsResponse.departments) {
        setDepartments(departmentsResponse.departments);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('An error occurred while loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !personalEmail.trim() || !roleId || !branchId || !departmentId) {
      setError('All fields marked with * are required');
      return;
    }

    const invitationData = {
      firstName,
      lastName,
      personalEmail,
      roleId: parseInt(roleId),
      branchId: parseInt(branchId),
      departmentId: parseInt(departmentId)
    };

    setActionLoading('invite');
    try {
      const response = await inviteStaff(invitationData);
      if (response.success) {
        setSuccessMessage('Invitation sent successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
        resetForm();
        loadData();
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = response.message || 'Failed to send invitation';
        if (errorMsg.toLowerCase().includes('duplicate')) {
          setError('This email has already been invited. Please use a different email or resend the existing invitation.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send invitation';
      setError(errorMsg.includes('duplicate') 
        ? 'This email has already been invited. Please use a different email or resend the existing invitation.'
        : errorMsg
      );
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPersonalEmail('');
    setRoleId('');
    setBranchId('');
    setDepartmentId('');
    setShowInviteForm(false);
  };

  const handleResendInvitation = async (invitationId: string) => {
    setActionLoading(`resend-${invitationId}`);
    try {
      const response = await resendStaffInvitation(invitationId);
      if (response.success) {
        setSuccessMessage('Invitation resent successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadData();
      } else {
        setError(response.message || 'Failed to resend invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`revoke-${invitationId}`);
    try {
      const response = await revokeStaffInvitation(invitationId);
      if (response.success) {
        setSuccessMessage('Invitation revoked successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadData();
      } else {
        setError(response.message || 'Failed to revoke invitation');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'expired':
      case 'cancelled':
      case 'declined': return XCircle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .invite-row { animation: fadeUp 0.22s ease both; }
        .invite-row:hover { background: ${T.surfaceMuted} !important; }
        .input-focus:focus { border-color: ${T.primaryLight} !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
        .btn-primary-hover:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(30,64,175,0.3) !important; }
        .btn-outline-hover:hover { background: ${T.surfaceMuted} !important; border-color: ${T.borderStrong} !important; }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: T.text }}>Staff Invitations</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: T.textMuted }}>
            Manage pending and accepted staff invitations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              ...btnOutline,
              padding: '0.5rem',
              width: '2.25rem',
              height: '2.25rem',
              opacity: loading ? 0.6 : 1,
            }}
            className="btn-outline-hover"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          </button>
          <button
            onClick={() => setShowInviteForm(true)}
            style={{ ...btnP }}
            className="btn-primary-hover"
          >
            <Send size={16} />
            Send Invitation
          </button>
          <button
            onClick={() => setShowBulkInvite(true)}
            style={{ ...btnOutline }}
            className="btn-outline-hover"
          >
            <Users size={16} />
            Bulk Invite
          </button>
        </div>
      </div>

      {/* ── Invite Form Modal ────────────────────────────────────── */}
      {showInviteForm && (
        <div
          onClick={() => setShowInviteForm(false)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(15,23,42,0.45)', 
            backdropFilter: 'blur(3px)', 
            zIndex: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', 
              maxWidth: '650px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              background: T.surface, 
              borderRadius: '16px', 
              boxShadow: '0 20px 60px rgba(15,23,42,0.22)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal header */}
            <div style={{ 
              padding: '1.1rem 1.5rem', 
              borderBottom: `1px solid ${T.border}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: T.surfaceAlt,
              borderRadius: '16px 16px 0 0',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ 
                  width: '2.25rem', 
                  height: '2.25rem', 
                  borderRadius: '9px', 
                  background: T.primary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Mail size={14} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.text }}>Send Staff Invitation</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Invite a new team member to join your organization</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteForm(false)}
                style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: '7px', 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: T.textMuted,
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleInviteStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Name fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelS}>First Name <span style={{ color: T.danger }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        className="input-focus"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        style={{ ...inputS, width: '100%', boxSizing: 'border-box', paddingLeft: '2.2rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelS}>Last Name <span style={{ color: T.danger }}>*</span></label>
                    <input
                      type="text"
                      className="input-focus"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      style={{ ...inputS, width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelS}>Personal Email <span style={{ color: T.danger }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      className="input-focus"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="john.doe@gmail.com"
                      required
                      style={{ ...inputS, width: '100%', boxSizing: 'border-box', paddingLeft: '2.2rem' }}
                    />
                  </div>
                </div>

                {/* Role, Branch, Department */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelS}>Role <span style={{ color: T.danger }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                      <select
                        className="input-focus"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        required
                        style={{ ...inputS, width: '100%', boxSizing: 'border-box', paddingLeft: '2.2rem', cursor: 'pointer', appearance: 'none' }}
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelS}>Branch <span style={{ color: T.danger }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Building size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                      <select
                        className="input-focus"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        required
                        style={{ ...inputS, width: '100%', boxSizing: 'border-box', paddingLeft: '2.2rem', cursor: 'pointer', appearance: 'none' }}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelS}>Department <span style={{ color: T.danger }}>*</span></label>
                    <select
                      className="input-focus"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      required
                      style={{ ...inputS, width: '100%', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '0.75rem', 
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${T.border}`,
                  marginTop: '0.5rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    style={{ ...btnOutline }}
                    className="btn-outline-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'invite'}
                    style={{ 
                      ...btnP, 
                      opacity: actionLoading === 'invite' ? 0.7 : 1,
                      cursor: actionLoading === 'invite' ? 'not-allowed' : 'pointer'
                    }}
                    className="btn-primary-hover"
                  >
                    {actionLoading === 'invite' ? (
                      <>
                        <RefreshCw size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Invitations List ─────────────────────────────────────── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Section header */}
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: `1px solid ${T.border}`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Invitation History</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>
              {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Login</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation, idx) => {
                const StatusIcon = getStatusIcon(invitation.status);
                const avatarColor = getAvatarColor(invitation.firstName);
                
                return (
                  <tr 
                    key={invitation.id} 
                    className="invite-row"
                    style={{ 
                      borderBottom: `1px solid ${T.border}`,
                      transition: 'background 0.12s',
                    }}
                  >
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
                          boxShadow: `0 2px 8px ${avatarColor}55`,
                        }}>
                          {invitation.firstName[0]}{invitation.lastName[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: T.text }}>
                            {invitation.fullName}
                          </p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                            {invitation.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: T.text }}>{invitation.roleName}</p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>
                          {invitation.departmentName}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={statusBadge(invitation.status)}>
                        <StatusIcon size={11} />
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {invitation.status === 'accepted' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: T.success }}>
                          <CheckCircle size={12} />
                          {invitation.first_login_at ? formatDate(invitation.first_login_at) : 'Not yet'}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: T.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {invitation.status === 'accepted' ? (
                        invitation.profile_completed ? (
                          <span style={{ ...statusBadge('accepted'), background: T.successPale, color: T.success, borderColor: T.successBorder, fontSize: '0.72rem' }}>
                            <CheckCircle size={10} /> Complete
                          </span>
                        ) : (
                          <span style={{ ...statusBadge('pending'), fontSize: '0.72rem' }}>
                            <Clock size={10} /> Incomplete
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: T.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: T.textMuted }}>
                        <Calendar size={12} />
                        {formatDate(invitation.createdAt)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: invitation.status === 'expired' ? T.danger : T.textMuted }}>
                        <Clock size={12} />
                        <span style={{ fontWeight: invitation.status === 'expired' ? 600 : 400 }}>
                          {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {invitation.status === 'pending' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={actionLoading?.startsWith('resend')}
                            style={{
                              ...btnOutline,
                              padding: '0.4rem',
                              width: '2rem',
                              height: '2rem',
                              opacity: actionLoading === `resend-${invitation.id}` ? 0.6 : 1,
                              cursor: actionLoading?.startsWith('resend') ? 'not-allowed' : 'pointer',
                            }}
                            className="btn-outline-hover"
                            title="Resend Invitation"
                          >
                            <RefreshCw size={13} style={{ 
                              animation: actionLoading === `resend-${invitation.id}` ? 'spin 0.7s linear infinite' : 'none' 
                            }} />
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            disabled={actionLoading?.startsWith('revoke')}
                            style={{
                              ...btnOutline,
                              padding: '0.4rem',
                              width: '2rem',
                              height: '2rem',
                              color: T.danger,
                              borderColor: T.dangerBorder,
                              opacity: actionLoading === `revoke-${invitation.id}` ? 0.6 : 1,
                              cursor: actionLoading?.startsWith('revoke') ? 'not-allowed' : 'pointer',
                            }}
                            className="btn-outline-hover"
                            title="Revoke Invitation"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {invitations.length === 0 && (
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
              <Mail size={20} color={T.primary} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, color: T.text, fontSize: '0.95rem' }}>No Invitations Yet</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: T.textMuted }}>
                Get started by sending your first staff invitation
              </p>
            </div>
            <button
              onClick={() => setShowInviteForm(true)}
              style={{ ...btnP }}
              className="btn-primary-hover"
            >
              <Send size={16} />
              Send Invitation
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Invite Modal ────────────────────────────────────── */}
      {showBulkInvite && (
        <BulkInviteModal
          roles={roles}
          branches={branches}
          departments={departments}
          onSuccess={() => { setShowBulkInvite(false); loadData(); }}
          onClose={() => setShowBulkInvite(false)}
        />
      )}
    </div>
  );
};

// Simple ChevronDown component since we didn't import it
const ChevronDown = ({ size = 16, color = '#94a3b8', style }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default StaffInvitationView;
