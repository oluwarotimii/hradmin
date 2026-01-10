import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { addStaffMember, StaffMember, DEPARTMENTS, Department } from '../data/staffData';
import { getBranches } from '../data/branchData';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staff: StaffMember) => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const branches = getBranches();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: 'Sales' as Department,
    departmentRole: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'Male' as 'Male' | 'Female',
    stateOfOrigin: '',
    lga: '',
    address: '',
    jobStatus: 'Permanent' as 'Permanent' | 'Ad hoc' | 'Intern' | 'Temporary',
    dateEmployed: new Date().toISOString().split('T')[0],
    branchType: 'Single' as 'Single' | 'Multiple' | 'All',
    guardianFirstName: '',
    guardianLastName: '',
    guardianDOB: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    guardianBusinessName: '',
    guardianBusinessAddress: '',
  });

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.departmentRole.trim()) {
      setError('Department role is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    // Guardian Information validation
    if (!formData.guardianFirstName.trim()) {
      setError('Guardian first name is required');
      return false;
    }
    if (!formData.guardianLastName.trim()) {
      setError('Guardian last name is required');
      return false;
    }
    if (!formData.guardianDOB) {
      setError('Guardian date of birth is required');
      return false;
    }
    if (!formData.guardianPhone.trim()) {
      setError('Guardian phone number is required');
      return false;
    }
    if (!formData.guardianEmail.trim()) {
      setError('Guardian email is required');
      return false;
    }
    if (!formData.guardianEmail.includes('@')) {
      setError('Please enter a valid guardian email address');
      return false;
    }
    if (!formData.guardianAddress.trim()) {
      setError('Guardian residential address is required');
      return false;
    }
    if (!formData.guardianBusinessName.trim()) {
      setError('Guardian business name is required');
      return false;
    }
    if (!formData.guardianBusinessAddress.trim()) {
      setError('Guardian business address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newStaff = addStaffMember({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        departmentRole: formData.departmentRole,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        gender: formData.gender,
        stateOfOrigin: formData.stateOfOrigin,
        lga: formData.lga,
        address: formData.address,
        jobStatus: formData.jobStatus,
        dateEmployed: formData.dateEmployed,
        branchType: formData.branchType,
        guardianFirstName: formData.guardianFirstName,
        guardianLastName: formData.guardianLastName,
        guardianDOB: formData.guardianDOB,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianAddress: formData.guardianAddress,
        guardianBusinessName: formData.guardianBusinessName,
        guardianBusinessAddress: formData.guardianBusinessAddress,
        education: [],
        branches: selectedBranches.map(name => ({
          id: `BR${Date.now()}`,
          name: name,
          baseStatus: 'Primary' as const
        })),
        leaves: [],
        offDays: [],
        documents: [],
        status: 'Active'
      });

      onSuccess(newStaff);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        department: 'Sales',
        departmentRole: '',
        dateOfBirth: '',
        placeOfBirth: '',
        gender: 'Male',
        stateOfOrigin: '',
        lga: '',
        address: '',
        jobStatus: 'Permanent',
        dateEmployed: new Date().toISOString().split('T')[0],
        branchType: 'Single',
        guardianFirstName: '',
        guardianLastName: '',
        guardianDOB: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianAddress: '',
        guardianBusinessName: '',
        guardianBusinessAddress: '',
      });
      setSelectedBranches([]);
      onClose();
    } catch (err) {
      setError('Failed to add staff member. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Add New Staff Member</h3>
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: '2rem', height: '2rem' }}
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded" style={{ backgroundColor: '#fee2e2', marginBottom: '1rem' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Personal Information */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Personal Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="First Name *"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Middle Name"
                  className="input"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <select
                  className="input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="date"
                  className="input"
                  placeholder="Date of Birth *"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Place of Birth"
                  className="input"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Contact Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  placeholder="Email *"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="input"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State of Origin"
                  className="input"
                  value={formData.stateOfOrigin}
                  onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="LGA"
                  className="input"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Residential Address"
                  className="input"
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Employment Information
              </label>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <select
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Department Role *"
                  className="input"
                  value={formData.departmentRole}
                  onChange={(e) => setFormData({ ...formData, departmentRole: e.target.value })}
                />
                <select
                  className="input"
                  value={formData.jobStatus}
                  onChange={(e) => setFormData({ ...formData, jobStatus: e.target.value as any })}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Ad hoc">Ad hoc</option>
                  <option value="Intern">Intern</option>
                  <option value="Temporary">Temporary</option>
                </select>
                <select
                  className="input"
                  value={formData.branchType}
                  onChange={(e) => setFormData({ ...formData, branchType: e.target.value as any })}
                >
                  <option value="Single">Single</option>
                  <option value="Multiple">Multiple</option>
                  <option value="All">All</option>
                </select>
                <input
                  type="date"
                  className="input"
                  value={formData.dateEmployed}
                  onChange={(e) => setFormData({ ...formData, dateEmployed: e.target.value })}
                />
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                Branch Selection
              </label>
              <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {branches.map((branch) => (
                  <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranches([...selectedBranches, branch]);
                        } else {
                          setSelectedBranches(selectedBranches.filter(b => b !== branch));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{branch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guardian Information (Required) */}
            <details open style={{ marginBottom: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}>
                Guardian/Next of Kin Information *
              </summary>
              <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Guardian First Name *"
                  className="input"
                  required
                  value={formData.guardianFirstName}
                  onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Last Name *"
                  className="input"
                  required
                  value={formData.guardianLastName}
                  onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                />
                <input
                  type="date"
                  className="input"
                  required
                  value={formData.guardianDOB}
                  onChange={(e) => setFormData({ ...formData, guardianDOB: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Guardian Phone *"
                  className="input"
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Guardian Email *"
                  className="input"
                  required
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Business Name *"
                  className="input"
                  required
                  value={formData.guardianBusinessName}
                  onChange={(e) => setFormData({ ...formData, guardianBusinessName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Residential Address *"
                  className="input"
                  required
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Guardian Business Address *"
                  className="input"
                  required
                  style={{ gridColumn: '1 / -1' }}
                  value={formData.guardianBusinessAddress}
                  onChange={(e) => setFormData({ ...formData, guardianBusinessAddress: e.target.value })}
                />
              </div>
            </details>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </>
  );
}
