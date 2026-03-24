import React, { useState, useEffect } from 'react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest
} from '../services/roleManagementService';
import { Shield, Key, Plus, Edit3, Trash2, X, Check, AlertCircle, Lock, Users, Layers } from 'lucide-react';

// ─── Helper: extract a permission's unique key robustly ───────────────────────
const extractKey = (p: any): string => {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.key ?? p.name ?? p.id ?? String(p);
};

const RoleManagementView = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form data
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Permission search/filter
  const [permSearch, setPermSearch] = useState('');

  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const rolesResponse = await getAllRoles();
      if (rolesResponse.success) {
        setRoles(rolesResponse.roles || []);
      } else {
        setError(rolesResponse.message || 'Failed to load roles');
      }

      const permissionsResponse = await getAvailablePermissions();
      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.permissions || []);
        setAvailablePermissions(permissionsResponse.permissions || []);
      } else {
        setError(permissionsResponse.message || 'Failed to load permissions');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) { setError('Role name is required'); return; }

    const roleData: CreateRoleRequest = {
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions
    };

    try {
      const response = await createRole(roleData);
      if (response.success) {
        showSuccess('Role created successfully');
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to create role');
      }
    } catch (err) {
      setError('An error occurred while creating the role');
      console.error(err);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !roleName.trim()) { setError('Role name is required'); return; }

    const roleData: UpdateRoleRequest = {
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions
    };

    try {
      const response = await updateRole(editingRole.id, roleData);
      if (response.success) {
        showSuccess('Role updated successfully');
        resetForm();
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred while updating the role');
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;

    try {
      const response = await deleteRole(roleId);
      if (response.success) {
        showSuccess('Role deleted successfully');
        loadRolesAndPermissions();
      } else {
        setError(response.message || 'Failed to delete role');
      }
    } catch (err) {
      setError('An error occurred while deleting the role');
      console.error(err);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setPermSearch('');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingRole(null);
    setError(null);
  };

  // ─── BUG FIX: Robustly extract permission keys from role.permissions ──────────
  const handleEditClick = async (role: Role) => {
    let perms = availablePermissions;
    if (perms.length === 0) {
      const permissionsResponse = await getAvailablePermissions();
      if (permissionsResponse.success && permissionsResponse.permissions) {
        perms = permissionsResponse.permissions;
        setAvailablePermissions(perms);
      }
    }

    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);

    // Normalise: role.permissions may be objects or plain strings
    const rolePermissionKeys = (role.permissions || []).map(extractKey).filter(Boolean);

    console.log('[Edit] role:', role.name);
    console.log('[Edit] raw permissions:', role.permissions);
    console.log('[Edit] extracted keys:', rolePermissionKeys);
    console.log('[Edit] available permissions sample:', perms.slice(0, 3).map(extractKey));

    setSelectedPermissions(rolePermissionKeys);
    setPermSearch('');
    setShowEditForm(true);
    setError(null);
  };

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionKey)
        ? prev.filter(k => k !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const toggleAllVisible = (visible: Permission[]) => {
    const visibleKeys = visible.map(extractKey);
    const allSelected = visibleKeys.every(k => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(k => !visibleKeys.includes(k)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...visibleKeys])));
    }
  };

  const filteredPermissions = (list: Permission[]) =>
    permSearch.trim()
      ? list.filter(p => {
          const key = extractKey(p).toLowerCase();
          const desc = (p as any).description?.toLowerCase() ?? '';
          const q = permSearch.toLowerCase();
          return key.includes(q) || desc.includes(q);
        })
      : list;

  // Stats
  const totalRoles = roles.length;
  const adminRoles = roles.filter(r => r.name.toLowerCase().includes('admin')).length;
  const userRoles = roles.filter(r => r.name.toLowerCase().includes('user') && !r.name.toLowerCase().includes('admin')).length;
  const totalPermissions = roles.reduce((acc, role) => acc + (role.permissions?.length ?? 0), 0);

  const getRoleBadgeColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('super')) return { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' };
    if (n.includes('admin')) return { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' };
    if (n.includes('hr')) return { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' };
    if (n.includes('manager')) return { bg: '#d1fae5', text: '#065f46', dot: '#10b981' };
    return { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem', gap: '1rem' }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '50%',
          border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading roles…</p>
        <style>{` @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Permission Picker (shared between create & edit) ────────────────────────
  const PermissionPicker = ({ list }: { list: Permission[] }) => {
    const visible = filteredPermissions(list);
    const allVisibleSelected = visible.length > 0 && visible.every(p => selectedPermissions.includes(extractKey(p)));

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
            Permissions
            <span style={{
              marginLeft: '0.5rem', padding: '0.1rem 0.5rem',
              background: '#dbeafe', color: '#1d4ed8',
              borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700
            }}>
              {selectedPermissions.length} selected
            </span>
          </label>
          <button
            type="button"
            onClick={() => toggleAllVisible(visible)}
            style={{
              fontSize: '0.7rem', color: '#3b82f6', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            {allVisibleSelected ? 'Deselect visible' : 'Select all visible'}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Filter permissions…"
            value={permSearch}
            onChange={e => setPermSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.4rem 0.75rem 0.4rem 2rem',
              border: '1px solid #e2e8f0', borderRadius: '0.375rem',
              fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
              background: '#f8fafc'
            }}
          />
          <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.75rem' }}>🔍</span>
        </div>

        <div style={{
          border: '1px solid #e2e8f0', borderRadius: '0.5rem',
          maxHeight: '14rem', overflowY: 'auto', background: '#f8fafc'
        }}>
          {visible.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              {visible.map((permission, idx) => {
                const key = extractKey(permission);
                const isChecked = selectedPermissions.includes(key);
                return (
                  <label
                    key={key || idx}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', cursor: 'pointer',
                      background: isChecked ? '#eff6ff' : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(key)}
                      style={{ marginTop: '0.125rem', accentColor: '#3b82f6', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.775rem', color: isChecked ? '#1d4ed8' : '#4b5563', lineHeight: '1.4' }}>
                      {(permission as any).description || key}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
              {permSearch ? 'No permissions match your search' : 'No permissions available'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Toast notifications ── */}
      {successMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderLeft: '4px solid #22c55e', borderRadius: '0.5rem',
          padding: '0.875rem 1rem', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '1.5rem', height: '1.5rem', borderRadius: '50%',
            background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Check style={{ width: '0.875rem', height: '0.875rem', color: 'white' }} />
          </div>
          <p style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 500 }}>{successMessage}</p>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderLeft: '4px solid #ef4444', borderRadius: '0.5rem',
          padding: '0.875rem 1rem'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 500 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
        {[
          { label: 'Total Roles', value: totalRoles, icon: Shield, bg: '#dbeafe', fg: '#2563eb', accent: '#bfdbfe' },
          { label: 'Admin Roles', value: adminRoles, icon: Lock, bg: '#ede9fe', fg: '#7c3aed', accent: '#ddd6fe' },
          { label: 'User Roles', value: userRoles, icon: Users, bg: '#dcfce7', fg: '#16a34a', accent: '#bbf7d0' },
          { label: 'Total Permissions', value: totalPermissions, icon: Key, bg: '#fef9c3', fg: '#ca8a04', accent: '#fde68a' },
        ].map(({ label, value, icon: Icon, bg, fg, accent }) => (
          <div key={label} style={{
            background: 'white', borderRadius: '0.75rem',
            border: '1px solid #f1f5f9', padding: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
              background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${accent}`, flexShrink: 0
            }}>
              <Icon style={{ width: '1rem', height: '1rem', color: fg }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginTop: '0.2rem' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#2563eb', color: 'white',
            border: 'none', borderRadius: '0.5rem',
            padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.15s, transform 0.15s',
            boxShadow: '0 1px 4px rgba(37,99,235,0.3)'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563eb'; }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Create New Role
        </button>
      </div>

      {/* ── MODAL: Create Role ── */}
      {showCreateForm && (
        <ModalWrapper title="Create New Role" onClose={resetForm}>
          <RoleForm
            roleName={roleName} setRoleName={setRoleName}
            roleDescription={roleDescription} setRoleDescription={setRoleDescription}
            permissionPicker={<PermissionPicker list={availablePermissions} />}
            onCancel={resetForm}
            onSubmit={handleCreateRole}
            submitLabel="Create Role"
          />
        </ModalWrapper>
      )}

      {/* ── MODAL: Edit Role ── */}
      {showEditForm && editingRole && (
        <ModalWrapper title={`Edit Role: ${editingRole.name}`} onClose={resetForm}>
          <RoleForm
            roleName={roleName} setRoleName={setRoleName}
            roleDescription={roleDescription} setRoleDescription={setRoleDescription}
            permissionPicker={<PermissionPicker list={availablePermissions} />}
            onCancel={resetForm}
            onSubmit={handleUpdateRole}
            submitLabel="Save Changes"
          />
        </ModalWrapper>
      )}

      {/* ── Roles Table ── */}
      <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a', margin: 0 }}>Existing Roles</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.125rem 0 0' }}>
              Showing {roles.length} role{roles.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Layers style={{ width: '1.25rem', height: '1.25rem', color: '#cbd5e1' }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Role', 'Description', 'Permissions', 'Created', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '0.625rem 1rem', textAlign: i === 4 ? 'right' : 'left',
                    fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    borderBottom: '1px solid #f1f5f9'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role, idx) => {
                const badge = getRoleBadgeColor(role.name);
                return (
                  <tr key={role.id} style={{
                    borderBottom: idx < roles.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Role */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
                          background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Shield style={{ width: '1rem', height: '1rem', color: badge.text }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{role.name}</span>
                            <span style={{
                              width: '0.4rem', height: '0.4rem', borderRadius: '50%',
                              background: badge.dot, display: 'inline-block'
                            }} />
                          </div>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                            ID: {typeof role.id === 'string' ? role.id.slice(0, 8) : role.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: '0.875rem 1rem', maxWidth: '260px' }}>
                      <p style={{
                        fontSize: '0.8125rem', color: '#64748b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0
                      }}>
                        {role.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No description</span>}
                      </p>
                    </td>

                    {/* Permissions */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        background: '#f1f5f9', borderRadius: '9999px',
                        padding: '0.2rem 0.625rem'
                      }}>
                        <Key style={{ width: '0.7rem', height: '0.7rem', color: '#64748b' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                          {role.permissions?.length ?? 0}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {(role.permissions?.length ?? 0) === 1 ? 'perm' : 'perms'}
                        </span>
                      </div>
                    </td>

                    {/* Created */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {role.created_at ? new Date(role.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditClick(role)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.35rem 0.75rem', fontSize: '0.775rem', fontWeight: 600,
                            background: 'white', color: '#374151',
                            border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = '#f8fafc';
                            el.style.borderColor = '#94a3b8';
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'white';
                            el.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <Edit3 style={{ width: '0.7rem', height: '0.7rem' }} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.35rem 0.75rem', fontSize: '0.775rem', fontWeight: 600,
                            background: 'white', color: '#dc2626',
                            border: '1px solid #fecaca', borderRadius: '0.375rem',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = '#fef2f2';
                            el.style.borderColor = '#f87171';
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'white';
                            el.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 style={{ width: '0.7rem', height: '0.7rem' }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {roles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '4rem', height: '4rem', borderRadius: '50%',
              background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Shield style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.5rem' }}>No roles yet</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>Get started by creating your first role</p>
            <button
              onClick={() => { resetForm(); setShowCreateForm(true); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#2563eb', color: 'white', border: 'none',
                borderRadius: '0.5rem', padding: '0.5rem 1rem',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Create Role
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const ModalWrapper = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <>
    {/* Overlay */}
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(2px)', zIndex: 40
      }}
    />
    {/* Modal */}
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(42rem, 95vw)', maxHeight: '90vh',
      background: 'white', borderRadius: '0.875rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      animation: 'modalIn 0.2s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.125rem 1.375rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '0.25rem', height: '1.25rem', background: '#3b82f6', borderRadius: '9999px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>{title}</h3>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '2rem', height: '2rem', borderRadius: '0.375rem',
            border: '1px solid #f1f5f9', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b'
          }}
        >
          <X style={{ width: '1rem', height: '1rem' }} />
        </button>
      </div>
      {/* Scrollable body */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {children}
      </div>
    </div>
  </>
);

const RoleForm = ({
  roleName, setRoleName,
  roleDescription, setRoleDescription,
  permissionPicker,
  onCancel, onSubmit, submitLabel
}: {
  roleName: string;
  setRoleName: (v: string) => void;
  roleDescription: string;
  setRoleDescription: (v: string) => void;
  permissionPicker: React.ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) => (
  <>
    <div style={{ padding: '1.25rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Name */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
          Role Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={roleName}
          onChange={e => setRoleName(e.target.value)}
          placeholder="e.g., HR Manager, Developer"
          style={{
            width: '100%', padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0', borderRadius: '0.5rem',
            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.15s', color: '#0f172a'
          }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#3b82f6'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'; }}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
          Description
        </label>
        <textarea
          value={roleDescription}
          onChange={e => setRoleDescription(e.target.value)}
          placeholder="Enter role description"
          rows={2}
          style={{
            width: '100%', padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0', borderRadius: '0.5rem',
            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
            resize: 'vertical', transition: 'border-color 0.15s', color: '#0f172a'
          }}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#3b82f6'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#e2e8f0'; }}
        />
      </div>

      {/* Permissions */}
      {permissionPicker}
    </div>

    {/* Footer */}
    <div style={{
      display: 'flex', justifyContent: 'flex-end', gap: '0.625rem',
      padding: '1rem 1.375rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc',
      borderRadius: '0 0 0.875rem 0.875rem'
    }}>
      <button
        onClick={onCancel}
        style={{
          padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
          background: 'white', color: '#374151',
          border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer'
        }}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1.125rem', fontSize: '0.875rem', fontWeight: 600,
          background: '#2563eb', color: 'white',
          border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(37,99,235,0.3)'
        }}
      >
        <Check style={{ width: '0.875rem', height: '0.875rem' }} />
        {submitLabel}
      </button>
    </div>
  </>
);

export default RoleManagementView;
