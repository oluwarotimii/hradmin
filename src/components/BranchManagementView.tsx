import React, { useState, useEffect } from 'react';
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest
} from '../services/branchManagementService';
import { Building, MapPin, Phone, Mail, Plus, Edit3, Trash2, X, Check, AlertCircle, Clock, Search } from 'lucide-react';
import { T } from '../theme';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

const BranchManagementView = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form data
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchCountry, setBranchCountry] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchLat, setBranchLat] = useState('');
  const [branchLng, setBranchLng] = useState('');
  const [branchLocationRadius, setBranchLocationRadius] = useState<number>(100);
  const [branchAttendanceMode, setBranchAttendanceMode] = useState('branch_based');
  const [branchStatus, setBranchStatus] = useState('active');

  // Location state
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const branchesResponse = await getAllBranches();
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches || []);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }
    } catch (err) {
      setError('An error occurred while loading branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setBranchLat(latitude.toString());
        setBranchLng(longitude.toString());
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('The request to get location timed out.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
            break;
        }
      }
    );
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim() || !branchCode.trim()) {
      setError('Branch name and code are required');
      return;
    }

    const branchData: CreateBranchRequest = {
      name: branchName,
      code: branchCode,
      address: branchAddress,
      city: branchCity,
      state: branchState,
      country: branchCountry,
      phone: branchPhone,
      email: branchEmail,
      location_coordinates: branchLat && branchLng ? `POINT(${branchLng} ${branchLat})` : '',
      location_radius_meters: branchLocationRadius,
      attendance_mode: branchAttendanceMode
    };

    try {
      const response = await createBranch(branchData);
      if (response.success) {
        setSuccessMessage('Branch created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadBranches();
      } else {
        setError(response.message || 'Failed to create branch');
      }
    } catch (err) {
      setError('An error occurred while creating the branch');
      console.error(err);
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !branchName.trim() || !branchCode.trim()) {
      setError('Branch name and code are required');
      return;
    }

    const branchData: UpdateBranchRequest = {
      name: branchName,
      code: branchCode,
      address: branchAddress,
      city: branchCity,
      state: branchState,
      country: branchCountry,
      phone: branchPhone,
      email: branchEmail,
      location_coordinates: branchLat && branchLng ? `POINT(${branchLng} ${branchLat})` : '',
      location_radius_meters: branchLocationRadius,
      attendance_mode: branchAttendanceMode,
      status: branchStatus
    };

    try {
      const response = await updateBranch(editingBranch.id, branchData);
      if (response.success) {
        setSuccessMessage('Branch updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
        loadBranches();
      } else {
        setError(response.message || 'Failed to update branch');
      }
    } catch (err) {
      setError('An error occurred while updating the branch');
      console.error(err);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteBranch(branchId);
      if (response.success) {
        setSuccessMessage('Branch deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        loadBranches();
      } else {
        setError(response.message || 'Failed to delete branch');
      }
    } catch (err) {
      setError('An error occurred while deleting the branch');
      console.error(err);
    }
  };

  const resetForm = () => {
    setBranchName('');
    setBranchCode('');
    setBranchAddress('');
    setBranchCity('');
    setBranchState('');
    setBranchCountry('');
    setBranchPhone('');
    setBranchEmail('');
    setBranchLat('');
    setBranchLng('');
    setBranchLocationRadius(100);
    setBranchAttendanceMode('branch_based');
    setBranchStatus('active');
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingBranch(null);
    setError(null);
    setLoadingLocation(false);
  };

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchCode(branch.code);
    setBranchAddress(branch.address);
    setBranchCity(branch.city);
    setBranchState(branch.state);
    setBranchCountry(branch.country);
    setBranchPhone(branch.phone);
    setBranchEmail(branch.email);
    
    // Parse coordinates if they exist
    if (branch.location_coordinates) {
      const match = branch.location_coordinates.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/i);
      if (match) {
        setBranchLng(match[1]);
        setBranchLat(match[2]);
      } else if (branch.location_coordinates.includes(',')) {
        const [lng, lat] = branch.location_coordinates.split(',');
        setBranchLng(lng.trim());
        setBranchLat(lat.trim());
      }
    } else {
      setBranchLat('');
      setBranchLng('');
    }
    
    setBranchLocationRadius(branch.location_radius_meters);
    setBranchAttendanceMode(branch.attendance_mode);
    setBranchStatus(branch.status);
    setShowEditForm(true);
    setError(null);
    setLoadingLocation(false);
  };

  // Calculate statistics
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const inactiveBranches = branches.filter(b => b.status === 'inactive').length;
  const closedBranches = branches.filter(b => b.status === 'closed').length;
  const filteredBranches = branches.filter(b =>
    searchTerm === '' || b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) || b.city?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Summary strip */}
      <div className="card" style={{ padding: '0.875rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="flex items-center gap-2">
          <Building size={16} style={{ color: T.primary, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Total Branches</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{totalBranches}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <Check size={16} style={{ color: T.success, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Active</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{activeBranches}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <Clock size={16} style={{ color: T.warning, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Inactive</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{inactiveBranches}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: '1rem' }}>
          <X size={16} style={{ color: T.danger, flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Closed</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{closedBranches}</p>
          </div>
        </div>
      </div>

      {/* Search + Create */}
      <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 230px', minWidth: '200px' }}>
          <Search size={13} color={T.textMuted} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name, code, city…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.575rem 0.875rem 0.575rem 2.1rem', border: `1.5px solid ${T.border}`, borderRadius: '8px', fontSize: '0.875rem', color: T.text, background: T.surface, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Branch
        </button>
      </div>

      {/* Create Branch Form Modal */}
      {showCreateForm && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Branch</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchName" className="block text-sm font-medium mb-1">Branch Name *</label>
                    <input
                      type="text"
                      id="branchName"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch name"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchCode" className="block text-sm font-medium mb-1">Branch Code *</label>
                    <input
                      type="text"
                      id="branchCode"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="branchAddress" className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    id="branchAddress"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="input w-full"
                    placeholder="Enter branch address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="branchCity" className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      id="branchCity"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="input w-full"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchState" className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      id="branchState"
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      className="input w-full"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchCountry" className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      id="branchCountry"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      className="input w-full"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchPhone" className="block text-sm font-medium mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="branchPhone"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="input w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="branchEmail" className="block text-sm font-medium mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        id="branchEmail"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchLat" className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      id="branchLat"
                      value={branchLat}
                      onChange={(e) => setBranchLat(e.target.value)}
                      className="input w-full"
                      placeholder="e.g., 6.4458"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchLng" className="block text-sm font-medium mb-1">Longitude</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        id="branchLng"
                        value={branchLng}
                        onChange={(e) => setBranchLng(e.target.value)}
                        className="input w-full"
                        placeholder="e.g., 3.3869"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="btn btn-secondary whitespace-nowrap"
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? 'Getting...' : 'Get Location'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchLocationRadius" className="block text-sm font-medium mb-1">Location Radius (meters)</label>
                    <input
                      type="number"
                      id="branchLocationRadius"
                      value={branchLocationRadius}
                      onChange={(e) => setBranchLocationRadius(Number(e.target.value))}
                      className="input w-full"
                      placeholder="Enter radius in meters"
                    />
                  </div>

                  <div>
                    <label htmlFor="branchAttendanceMode" className="block text-sm font-medium mb-1">Attendance Mode</label>
                    <select
                      id="branchAttendanceMode"
                      value={branchAttendanceMode}
                      onChange={(e) => setBranchAttendanceMode(e.target.value)}
                      className="input w-full"
                    >
                      <option value="branch_based">Branch Based</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBranch}>
                <Check className="w-4 h-4 mr-2" />
                Create Branch
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Branch Form Modal */}
      {showEditForm && editingBranch && (
        <>
          <div className="modal-overlay" onClick={() => resetForm()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Branch</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => resetForm()}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchName" className="block text-sm font-medium mb-1">Branch Name *</label>
                    <input
                      type="text"
                      id="editBranchName"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch name"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchCode" className="block text-sm font-medium mb-1">Branch Code *</label>
                    <input
                      type="text"
                      id="editBranchCode"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="input w-full"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editBranchAddress" className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    id="editBranchAddress"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="input w-full"
                    placeholder="Enter branch address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="editBranchCity" className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      id="editBranchCity"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="input w-full"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchState" className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      id="editBranchState"
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      className="input w-full"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchCountry" className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      id="editBranchCountry"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      className="input w-full"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchPhone" className="block text-sm font-medium mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        id="editBranchPhone"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="input w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="editBranchEmail" className="block text-sm font-medium mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        id="editBranchEmail"
                        value={branchEmail}
                        onChange={(e) => setBranchEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchLat" className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      id="editBranchLat"
                      value={branchLat}
                      onChange={(e) => setBranchLat(e.target.value)}
                      className="input w-full"
                      placeholder="e.g., 6.4458"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchLng" className="block text-sm font-medium mb-1">Longitude</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        id="editBranchLng"
                        value={branchLng}
                        onChange={(e) => setBranchLng(e.target.value)}
                        className="input w-full"
                        placeholder="e.g., 3.3869"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="btn btn-secondary whitespace-nowrap"
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? 'Getting...' : 'Get Location'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchLocationRadius" className="block text-sm font-medium mb-1">Location Radius (meters)</label>
                    <input
                      type="number"
                      id="editBranchLocationRadius"
                      value={branchLocationRadius}
                      onChange={(e) => setBranchLocationRadius(Number(e.target.value))}
                      className="input w-full"
                      placeholder="Enter radius in meters"
                    />
                  </div>

                  <div>
                    <label htmlFor="editBranchAttendanceMode" className="block text-sm font-medium mb-1">Attendance Mode</label>
                    <select
                      id="editBranchAttendanceMode"
                      value={branchAttendanceMode}
                      onChange={(e) => setBranchAttendanceMode(e.target.value)}
                      className="input w-full"
                    >
                      <option value="branch_based">Branch Based</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editBranchStatus" className="block text-sm font-medium mb-1">Status</label>
                    <select
                      id="editBranchStatus"
                      value={branchStatus}
                      onChange={(e) => setBranchStatus(e.target.value)}
                      className="input w-full"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateBranch}>
                <Check className="w-4 h-4 mr-2" />
                Update Branch
              </button>
            </div>
          </div>
        </>
      )}

      {/* Branches Table */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Branches</h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>
            Showing {filteredBranches.length} of {totalBranches}
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {['Branch', 'Location', 'Contact', 'Status', 'Created'].map((h) => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
                <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.id} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceAlt)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={branch.name} size={34} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: T.text }}>{branch.name}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: T.textMuted }}>{branch.code}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: T.textSub }}>
                      <MapPin size={12} color={T.textMuted} />
                      {branch.city}, {branch.state}
                    </div>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: T.textMuted }}>{branch.country}</p>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: T.textSub }}>
                      <Phone size={12} color={T.textMuted} />
                      {branch.phone || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: T.textMuted, marginTop: '0.1rem' }}>
                      <Mail size={11} color={T.textMuted} />
                      {branch.email || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}` }}>
                    <StatusBadge
                      label={branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                      tone={branch.status === 'active' ? 'success' : branch.status === 'inactive' ? 'warning' : 'danger'}
                    />
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, fontSize: '0.8rem', color: T.textSub }}>
                    {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${T.border}`, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleEditClick(branch)}
                        title="Edit"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.border}`, borderRadius: '7px', background: T.surface, color: T.textSub, cursor: 'pointer' }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        title="Delete"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.dangerBorder}`, borderRadius: '7px', background: T.dangerPale, color: T.danger, cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBranches.length === 0 && (
          <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: T.primaryPale, border: `1px solid ${T.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
              <Building size={18} color={T.primary} />
            </div>
            <p style={{ fontWeight: 600, color: T.text, margin: '0 0 0.3rem' }}>
              {totalBranches === 0 ? 'No branches yet' : 'No branches found'}
            </p>
            <p style={{ fontSize: '0.8rem', color: T.textMuted, margin: '0 0 1rem' }}>
              {totalBranches === 0 ? 'Get started by creating your first branch' : 'Try adjusting your search'}
            </p>
            {totalBranches === 0 && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Branch
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { BranchManagementView };