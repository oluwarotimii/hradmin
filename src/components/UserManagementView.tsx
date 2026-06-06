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
  Mail, Shield, Building, Search
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
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
                <input type="password" className="input w-full" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password (min. 8 characters)" minLength={8} required />
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
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Check className="w-5 h-5" style={{ color: '#16a34a' }} />
          <span className="text-sm font-medium" style={{ color: '#15803d' }}>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
          <span className="text-sm font-medium" style={{ color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg-grid-cols-4 gap-4">
        <div className="card p-4 hover-lift flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--primary-100)' }}>
            <UserIcon className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
          </div>
          <div>
            <p className="text-xs font-medium text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
            <p className="text-2xl font-bold text-primary">{totalUsers}</p>
          </div>
        </div>
        <div className="card p-4 hover-lift flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--success-100)' }}>
            <Check className="w-5 h-5" style={{ color: 'var(--success-600)' }} />
          </div>
          <div>
            <p className="text-xs font-medium text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</p>
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
          </div>
        </div>
        <div className="card p-4 hover-lift flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--warning-100)' }}>
            <X className="w-5 h-5" style={{ color: 'var(--warning-600)' }} />
          </div>
          <div>
            <p className="text-xs font-medium text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive</p>
            <p className="text-2xl font-bold text-primary">{inactiveCount}</p>
          </div>
        </div>
        <div className="card p-4 hover-lift flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--purple-100)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--purple-600)' }} />
          </div>
          <div>
            <p className="text-xs font-medium text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admins</p>
            <p className="text-2xl font-bold text-primary">{adminCount}</p>
          </div>
        </div>
      </div>

      {/* Action Bar with Search */}
      <div className="flex items-start justify-between gap-4" style={{ flexWrap: 'wrap' }}>
        <div className="relative" style={{ maxWidth: '360px', minWidth: '250px', flex: 1 }}>
          <Search className="absolute w-4 h-4" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input input-with-icon"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateForm(true); }}>
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Create / Edit Modals */}
      {showCreateForm && renderModal('Create New User', handleCreateUser, 'Create User')}
      {showEditForm && editingUser && renderModal(`Edit User: ${firstName} ${lastName}`, handleUpdateUser, 'Update User')}

      {/* Users Table */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-semibold text-primary">Existing Users</h3>
            <p className="text-sm text-tertiary">{totalUsers} user{totalUsers !== 1 ? 's' : ''} found</p>
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const fullName = `${user.firstName} ${user.lastName}`.trim() || 'N/A';
                const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full font-semibold text-xs" style={{
                          backgroundColor: user.isActive ? 'var(--primary-100)' : 'var(--bg-tertiary)',
                          color: user.isActive ? 'var(--primary-700)' : 'var(--text-tertiary)'
                        }}>
                          {initials || '?'}
                        </div>
                        <span className="font-medium text-sm text-primary">{fullName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-tertiary" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm">{roles.find(r => r.id === user.roleId)?.name || <span className="text-tertiary">N/A</span>}</span>
                    </td>
                    <td>
                      <span className="text-sm">{branches.find(b => b.id === user.branchId)?.name || <span className="text-tertiary">N/A</span>}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        {user.isActive ? (
                          <button className="btn btn-sm btn-outline" onClick={() => handleDeactivateUser(user.id)} title="Deactivate user">
                            <X className="w-3 h-3" />
                            Deactivate
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline green" onClick={() => handleActivateUser(user.id)} title="Activate user">
                            <Check className="w-3 h-3" />
                            Activate
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={() => startEditing(user)}>
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline red" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-3 h-3" />
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

        {/* Pagination */}
        {(totalPages > 1 || users.length === itemsPerPage) && totalPages > 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink href="#" onClick={e => { e.preventDefault(); setCurrentPage(pageNum); }} isActive={currentPage === pageNum}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem><PaginationEllipsis /></PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => { e.preventDefault(); setCurrentPage(p => p + 1); }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <span className="text-xs text-tertiary">
              Page {currentPage} of {totalPages} ({totalUsers} total users)
            </span>
          </div>
        )}

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
