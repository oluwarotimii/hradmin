import React, { useState, useEffect } from 'react';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../services/departmentManagementService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import { Building, Plus, Edit3, Trash2, X, Check, AlertCircle, Search } from 'lucide-react';
import { T, getDeptAccent } from '../theme';

const DepartmentManagementView = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Form data
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentBranchId, setDepartmentBranchId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load departments and branches on component mount
  useEffect(() => {
    loadDepartmentsAndBranches();
  }, []);

  const loadDepartmentsAndBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load departments
      const departmentsResponse = await getAllDepartments();
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.departments || []);
      } else {
        setError(departmentsResponse.message || 'Failed to load departments');
      }

      // Load branches
      const branchesResponse = await getAllBranches();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!departmentName.trim() || departmentBranchId === '') {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: CreateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: Number(departmentBranchId)
    };

    try {
      const response = await createDepartment(departmentData);
      if (response.success) {
        setSuccessMessage('Department created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to create department');
      }
    } catch (err) {
      setError('An error occurred while creating the department');
      console.error(err);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !departmentName.trim() || departmentBranchId === '') {
      setError('Department name and branch are required');
      return;
    }

    const departmentData: UpdateDepartmentRequest = {
      name: departmentName,
      description: departmentDescription,
      branch_id: Number(departmentBranchId)
    };

    try {
      const response = await updateDepartment(editingDepartment.id, departmentData);
      if (response.success) {
        setSuccessMessage('Department updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to update department');
      }
    } catch (err) {
      setError('An error occurred while updating the department');
      console.error(err);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteDepartment(departmentId);
      if (response.success) {
        setSuccessMessage('Department deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadDepartmentsAndBranches();
      } else {
        setError(response.message || 'Failed to delete department');
      }
    } catch (err) {
      setError('An error occurred while deleting the department');
      console.error(err);
    }
  };

  const resetForm = () => {
    setDepartmentName('');
    setDepartmentDescription('');
    setDepartmentBranchId('');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingDepartment(null);
    setError(null);
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description || '');
    setDepartmentBranchId(department.branch_id || '');
    setShowEditForm(true);
    setError(null);
  };

  const totalDepartments = departments.length;
  const filteredDepartments = departments.filter(d =>
    searchTerm === '' || d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ width: 32, height: 32, border: `2.5px solid ${T.primaryBorder}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error toast */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: T.dangerPale, border: `1px solid ${T.dangerBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={15} color={T.danger} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', flex: 1, fontWeight: 500 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.danger, display: 'flex' }}><X size={14} /></button>
        </div>
      )}

      {/* Success toast */}
      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', background: T.successPale, border: `1px solid ${T.successBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Check size={15} color={T.success} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', flex: 1, fontWeight: 500 }}>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.success, display: 'flex' }}><X size={14} /></button>
        </div>
      )}

      {/* Search + Create */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 230px', minWidth: '200px' }}>
          <Search size={13} color={T.textMuted} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search departments…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.575rem 0.875rem 0.575rem 2.1rem', border: `1.5px solid ${T.border}`, borderRadius: '8px', fontSize: '0.875rem', color: T.text, background: T.surface, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <span style={{ fontSize: '0.78rem', color: T.textMuted }}>{totalDepartments} department{totalDepartments !== 1 ? 's' : ''}</span>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Department
        </button>
      </div>

      {/* Create Department Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Department</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="departmentName" className="block text-sm font-medium mb-1">Department Name *</label>
                  <input
                    type="text"
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., Engineering, Human Resources"
                  />
                </div>

                <div>
                  <label htmlFor="departmentDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="departmentDescription"
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="departmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                  <select
                    id="departmentBranch"
                    value={departmentBranchId}
                    onChange={(e) => setDepartmentBranchId(e.target.value ? Number(e.target.value) : '')}
                    className="input w-full"
                    style={{ color: departmentBranchId ? '#1f2937' : '#6b7280' }}
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateDepartment}>
                <Check className="w-4 h-4 mr-2" />
                Create Department
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Department Form Modal */}
      {showEditForm && editingDepartment && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Department: {editingDepartment.name}</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="editDepartmentName" className="block text-sm font-medium mb-1">Department Name *</label>
                  <input
                    type="text"
                    id="editDepartmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label htmlFor="editDepartmentDescription" className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="editDepartmentDescription"
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="input w-full"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="editDepartmentBranch" className="block text-sm font-medium mb-1">Branch *</label>
                  <select
                    id="editDepartmentBranch"
                    value={departmentBranchId}
                    onChange={(e) => setDepartmentBranchId(e.target.value ? Number(e.target.value) : '')}
                    className="input w-full"
                    style={{ color: departmentBranchId ? '#1f2937' : '#6b7280' }}
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateDepartment}>
                <Check className="w-4 h-4 mr-2" />
                Update Department
              </button>
            </div>
          </div>
        </>
      )}

      {/* Departments Table */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Departments</h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>
            Showing {filteredDepartments.length} of {totalDepartments}
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Department</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Description</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Branch</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Created</th>
                <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((department) => {
                const accent = getDeptAccent(department.name);
                return (
                  <tr key={department.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '8px', background: accent.pale, border: `1px solid ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building size={14} color={accent.text} />
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: T.text }}>{department.name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: T.textSub, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {department.description || '—'}
                      </p>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.8rem', color: T.textSub }}>
                      {branches.find(b => b.id === department.branch_id)?.name || (
                        <span style={{ color: T.textMuted, fontStyle: 'italic' }}>Not assigned</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.8rem', color: T.textSub }}>
                      {department.created_at ? new Date(department.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleEditClick(department)}
                          title="Edit"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.border}`, borderRadius: '7px', background: T.surface, color: T.textSub, cursor: 'pointer' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department.id)}
                          title="Delete"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.dangerBorder}`, borderRadius: '7px', background: T.dangerPale, color: T.danger, cursor: 'pointer' }}
                        >
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
        {filteredDepartments.length === 0 && (
          <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: T.primaryPale, border: `1px solid ${T.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
              <Building size={18} color={T.primary} />
            </div>
            <p style={{ fontWeight: 600, color: T.text, margin: '0 0 0.3rem' }}>
              {totalDepartments === 0 ? 'No departments yet' : 'No departments found'}
            </p>
            <p style={{ fontSize: '0.8rem', color: T.textMuted, margin: '0 0 1rem' }}>
              {totalDepartments === 0 ? 'Get started by creating your first department' : 'Try adjusting your search'}
            </p>
            {totalDepartments === 0 && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Department
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagementView;
export { DepartmentManagementView };
