import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '../services/userManagementService';
import { getAllRoles } from '../services/roleManagementService';
import { getAllBranches } from '../services/branchManagementService';
import {
  User as UserIcon, Plus, Edit3, Trash2, X, Check, AlertCircle,
  Mail, Shield, Building, Search, Eye, EyeOff
} from 'lucide-react';
import { Pagination } from './Pagination';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { T } from '../theme';

const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState<number>(0);
  const [branchId, setBranchId] = useState<number>(0);

  // Dropdown data
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const loadUsers = useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const usersResponse = await getAllUsers(page, itemsPerPage, search);
      if (usersResponse.success) {
        setUsers(usersResponse.users || []);
        setTotalUsers(usersResponse.total || 0);
      } else {
        setError(usersResponse.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.code === 'ERR_NETWORK'
        ? 'Network error: Unable to connect to server.'
        : err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const loadDropdowns = useCallback(async () => {
    try {
      if (roles.length === 0) {
        const rolesResponse = await getAllRoles();
        if (rolesResponse.success) setRoles(rolesResponse.roles || []);
      }
      if (branches.length === 0) {
        const branchesResponse = await getAllBranches();
        if (branchesResponse.success) setBranches(branchesResponse.branches || []);
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  }, [roles.length, branches.length]);

  useEffect(() => {
    loadUsers(currentPage, searchQuery);
    loadDropdowns();
  }, [currentPage, loadUsers, loadDropdowns]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadUsers(1, value);
    }, 400);
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRoleId(0);
    setBranchId(0);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData: CreateUserRequest = { firstName, lastName, email, password, roleId, branchId };
      const response = await createUser(userData);
      if (response.success) {
        setSuccessMessage('User created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowCreateForm(false);
        resetForm();
        loadUsers(currentPage, searchQuery);
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const userData: UpdateUserRequest = { firstName, lastName, email, roleId, branchId };
      const response = await updateUser(editingUser.id, userData);
      if (response.success) {
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowEditForm(false);
        setEditingUser(null);
        resetForm();
        loadUsers(currentPage, searchQuery);
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await deleteUser(id);
        if (response.success) {
          setSuccessMessage('User deleted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          loadUsers(currentPage, searchQuery);
        } else {
          setError(response.message || 'Failed to delete user');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deleting user');
      }
    }
  };

  const handleActivateUser = async (id: number) => {
    try {
      const response = await toggleUserStatus(id, true);
      if (response.success) {
        setSuccessMessage('User activated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadUsers(currentPage, searchQuery);
      } else {
        setError(response.message || 'Failed to activate user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while activating user');
    }
  };

  const handleDeactivateUser = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const response = await toggleUserStatus(id, false);
        if (response.success) {
          setSuccessMessage('User deactivated successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          loadUsers(currentPage, searchQuery);
        } else {
          setError(response.message || 'Failed to deactivate user');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while deactivating user');
      }
    }
  };

  const startEditing = async (user: User) => {
    try {
      const userResponse = await getUserById(user.id);
      if (userResponse.success && userResponse.user) {
        const fu = userResponse.user;
        setEditingUser(fu);
        setFirstName(fu.firstName);
        setLastName(fu.lastName);
        setEmail(fu.email);
        setRoleId(fu.roleId);
        setBranchId(fu.branchId);
      } else {
        setEditingUser(user);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setRoleId(user.roleId || 0);
        setBranchId(user.branchId || 0);
      }
      setPassword('');
      setShowEditForm(true);
    } catch (error) {
      console.error('Error fetching user:', error);
      setEditingUser(user);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setRoleId(user.roleId || 0);
      setBranchId(user.branchId || 0);
      setPassword('');
      setShowEditForm(true);
    }
  };

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const adminCount = users.filter(u =>
    roles.find(r => r.id === u.roleId)?.name?.toLowerCase().includes('admin')
  ).length;

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderModal = (title: string, onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <>
      <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setShowEditForm(false); setEditingUser(null); resetForm(); }}></div>
      <div className="modal" style={{ animation: 'fadeIn 0.2s ease' }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={() => { setShowCreateForm(false); setShowEditForm(false); setEditingUser(null); resetForm(); }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input type="text" className="input w-full" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input type="text" className="input w-full" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tertiary flex-shrink-0" />
                <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" required />
              </div>
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="input w-full pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password (min. 8 characters)" minLength={8} required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-tertiary flex-shrink-0" />
                  <select className="input w-full" value={roleId} onChange={e => setRoleId(Number(e.target.value))} style={{ color: roleId ? 'var(--text-primary)' : 'var(--text-muted)' }} required>
                    <option value="">Select Role</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch *</label>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-tertiary flex-shrink-0" />
                  <select className="input w-full" value={branchId} onChange={e => setBranchId(Number(e.target.value))} style={{ color: branchId ? 'var(--text-primary)' : 'var(--text-muted)' }} required>
                    <option value="">Select Branch</option>
                    {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" className="btn btn-outline" onClick={() => { setShowCreateForm(false); setShowEditForm(false); setEditingUser(null); resetForm(); }}>Cancel</button>
              <button type="submit" className="btn btn-primary"><Check className="w-4 h-4" />{submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success / Error toasts */}
      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', background: T.successPale, border: `1px solid ${T.successBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Check size={15} color={T.success} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', flex: 1, fontWeight: 500 }}>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.success, display: 'flex' }}><X size={14} /></button>
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: T.dangerPale, border: `1px solid ${T.dangerBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={15} color={T.danger} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', flex: 1, fontWeight: 500 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.danger, display: 'flex' }}><X size={14} /></button>
        </div>
      )}

      {/* Summary strip */}
      <div className="card" style={{ padding: '0.875rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="flex items-center gap-2">
          <UserIcon size={16} style={{ color: T.primary, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Total Users</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{totalUsers}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <Check size={16} style={{ color: T.success, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Active</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{activeCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <X size={16} style={{ color: T.warning, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Inactive</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{inactiveCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <Shield size={16} style={{ color: T.purple, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Admins</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{adminCount}</p>
          </div>
        </div>
      </div>

      {/* Action Bar with Search */}
      <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 230px', minWidth: '200px' }}>
          <Search size={13} color={T.textMuted} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.575rem 0.875rem 0.575rem 2.1rem', border: `1.5px solid ${T.border}`, borderRadius: '8px', fontSize: '0.875rem', color: T.text, background: T.surface, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateForm(true); }} style={{ marginLeft: 'auto' }}>
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Create / Edit Modals */}
      {showCreateForm && renderModal('Create New User', handleCreateUser, 'Create User')}
      {showEditForm && editingUser && renderModal(`Edit User: ${firstName} ${lastName}`, handleUpdateUser, 'Update User')}

      {/* Users Table */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Users</h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>{totalUsers} user{totalUsers !== 1 ? 's' : ''} found</p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalUsers}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setItemsPerPage}
          itemLabel="users"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Branch', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
                <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const fullName = `${user.firstName} ${user.lastName}`.trim() || 'N/A';
                return (
                  <tr key={user.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Avatar name={fullName} size={32} />
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: T.text }}>{fullName}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: T.textSub }}>
                        <Mail size={12} color={T.textMuted} />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.8rem', color: T.textSub }}>
                      {roles.find(r => r.id === user.roleId)?.name || <span style={{ color: T.textMuted }}>N/A</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.8rem', color: T.textSub }}>
                      {branches.find(b => b.id === user.branchId)?.name || <span style={{ color: T.textMuted }}>N/A</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                      <StatusBadge label={user.isActive ? 'Active' : 'Inactive'} tone={user.isActive ? 'success' : 'warning'} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {user.isActive ? (
                          <button onClick={() => handleDeactivateUser(user.id)} title="Deactivate"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.warningBorder}`, borderRadius: '7px', background: T.warningPale, color: T.warning, cursor: 'pointer' }}>
                            <X size={13} />
                          </button>
                        ) : (
                          <button onClick={() => handleActivateUser(user.id)} title="Activate"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.successBorder}`, borderRadius: '7px', background: T.successPale, color: T.success, cursor: 'pointer' }}>
                            <Check size={13} />
                          </button>
                        )}
                        <button onClick={() => startEditing(user)} title="Edit"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.border}`, borderRadius: '7px', background: T.surface, color: T.textSub, cursor: 'pointer' }}>
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} title="Delete"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.dangerBorder}`, borderRadius: '7px', background: T.dangerPale, color: T.danger, cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="text-center py-16 px-6">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--primary-50)' }}>
              <UserIcon className="w-8 h-8" style={{ color: 'var(--primary-500)' }} />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-1">
              {searchQuery ? 'No Users Found' : 'No Users Yet'}
            </h3>
            <p className="text-sm text-tertiary mb-6">
              {searchQuery
                ? `No users match "${searchQuery}". Try a different search term.`
                : 'Get started by creating your first user.'}
            </p>
            {!searchQuery && (
              <button onClick={() => { resetForm(); setShowCreateForm(true); }} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Create User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementView;
