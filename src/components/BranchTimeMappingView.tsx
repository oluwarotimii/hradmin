import { useState, useEffect } from 'react';
import { Clock, Trash2, Plus, Building, Users, User } from 'lucide-react';
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
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Branch Time Mapping</h1>
            <p className="page-subtitle">Assign staff or departments to use a specific branch's resumption time</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Mapping
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="input"
              value={mappingType}
              onChange={e => setMappingType(e.target.value as 'staff' | 'department')}
            >
              <option value="staff">Staff Member</option>
              <option value="department">Department</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mappingType === 'staff' ? 'Staff Member' : 'Department'}
            </label>
            {mappingType === 'staff' ? (
              <select
                className="input"
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value ? Number(e.target.value) : '')}
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
                className="input"
                value={selectedDepartmentId}
                onChange={e => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Branch</label>
            <select
              className="input"
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select branch...</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={submitting || selectedBranchId === '' || (mappingType === 'staff' && selectedStaffId === '') || (mappingType === 'department' && selectedDepartmentId === '')}
          >
            {submitting ? 'Adding...' : 'Add Mapping'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Target</th>
                <th>Uses Branch</th>
                <th>Created</th>
                <th className="w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : mappings.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No branch time mappings configured.</td></tr>
              ) : (
                mappings.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span className="flex items-center gap-2">
                        {m.staff_id ? <User className="w-4 h-4 text-gray-400" /> : <Users className="w-4 h-4 text-gray-400" />}
                        {m.staff_id ? 'Staff' : 'Department'}
                      </span>
                    </td>
                    <td className="font-medium">{m.target_name}</td>
                    <td><span className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-400" />{m.branch_name}</span></td>
                    <td className="text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
