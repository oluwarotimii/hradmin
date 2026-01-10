// Import React hook for managing component state
import { useState } from 'react';
// Import functions and types from timeData module for handling branch and individual time data
import {
  getBranchTimes, // Function to retrieve all branch time settings
  getIndividualTimes, // Function to retrieve all individual time settings
  updateBranchTime, // Function to update a specific branch's time settings
  persistBranchTimes, // Function to save branch time changes to storage
  addIndividualTime, // Function to add a new individual time setting
  removeIndividualTime, // Function to remove an individual time setting
  updateIndividualTime, // Function to update an existing individual time setting
  persistIndividualTimes, // Function to save individual time changes to storage
  BranchTime, // Type definition for branch time data structure
  IndividualTime // Type definition for individual time data structure
} from '../data/timeData';
// Import attendance metrics and mock staff data from staffData module
import { getAttendanceMetrics, mockStaffData } from '../data/staffData';
// Import icons from lucide-react library for UI elements like buttons and indicators
import { Clock, Building, User, Save, Plus, Edit2, Trash2 } from 'lucide-react';

// Main component for the Time Management View in the HR dashboard
// This component allows administrators to manage working hours for branches and individual staff members
export function TimeManagementView() {
  // State to track which tab is currently active: 'branches' for branch settings or 'individuals' for individual settings
  const [activeTab, setActiveTab] = useState<'branches' | 'individuals'>('branches');
  // State to track which branch is currently being edited (null if none)
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  // State to control the visibility of the modal for adding new individual time settings
  const [showAddIndividualModal, setShowAddIndividualModal] = useState(false);

  // Temporary state for storing editing values for branches, keyed by branch ID
  // This holds unsaved changes during editing
  const [editingValues, setEditingValues] = useState<Record<string, Partial<BranchTime>>>({});
  // State for the form data when adding a new individual time setting
  // Excludes the 'id' field as it will be generated
  const [newIndividual, setNewIndividual] = useState<Omit<IndividualTime, 'id'>>({
    staffId: '', // ID of the staff member
    staffName: '', // Full name of the staff member
    department: '', // Department of the staff member
    resumptionTime: '09:00', // Default resumption time
    closeTime: '17:00', // Default close time
    isCustom: true, // Flag indicating this is a custom schedule
  });
  // State for the branch assigned to the new individual being added
  const [newIndividualBranch, setNewIndividualBranch] = useState<string>('');
  // State to control whether staff name suggestions are shown in the autocomplete input
  const [showStaffSuggestions, setShowStaffSuggestions] = useState(false);
  // State for the list of staff suggestions based on user input
  const [staffSuggestions, setStaffSuggestions] = useState<typeof mockStaffData>([] as typeof mockStaffData);

  // State for the list of branch time settings, initialized with data from timeData
  const [branchTimes, setBranchTimes] = useState<BranchTime[]>(getBranchTimes());
  // State for the list of individual time settings, initialized with data from timeData
  const [individualTimes, setIndividualTimes] = useState<IndividualTime[]>(getIndividualTimes());
  // Retrieve attendance metrics for display in the stats cards
  const metrics = getAttendanceMetrics();

  // Helper function to refresh branch times data from the data source
  const refreshBranchTimes = () => setBranchTimes(getBranchTimes());
  // Helper function to refresh individual times data from the data source
  const refreshIndividualTimes = () => setIndividualTimes(getIndividualTimes());

  // Handler function to start editing a branch's time settings
  // Sets the editing state and copies current values for editing
  const handleStartEdit = (branch: BranchTime) => {
    setEditingBranch(branch.id);
    setEditingValues(prev => ({ ...prev, [branch.id]: { ...branch } }));
  };

  // Handler function for changes in branch editing fields
  // Updates the temporary editing values for the specified branch and field
  const handleEditChange = (branchId: string, field: keyof BranchTime, value: any) => {
    // Ignore unknown fields and update the editing state
    setEditingValues(prev => ({ ...prev, [branchId]: { ...(prev[branchId] || {}), [field]: value } }));
  };

  // Handler function to save changes to a branch's time settings
  // Applies updates, persists to storage, refreshes data, and exits edit mode
  const handleSaveBranch = (branchId: string) => {
    const updates = editingValues[branchId];
    if (!updates) return; // No updates to save
    updateBranchTime(branchId, updates as Partial<BranchTime>);
    persistBranchTimes(); // Save changes to persistent storage
    refreshBranchTimes(); // Refresh the local state
    setEditingBranch(null); // Exit edit mode
  };

  // Handler function to cancel editing a branch
  // Resets editing state and removes temporary values
  const handleCancelEdit = (branchId: string) => {
    setEditingBranch(null);
    setEditingValues(prev => {
      const copy = { ...prev };
      delete copy[branchId]; // Remove the temporary edits
      return copy;
    });
  };

  // Handler function to remove an individual time setting
  // Deletes the setting and refreshes the data
  const handleRemoveIndividual = (id: string) => {
    removeIndividualTime(id);
    refreshIndividualTimes();
  };

  // State for tracking which individual time setting is being edited
  const [editingIndividualId, setEditingIndividualId] = useState<string | null>(null);
  // State for temporary editing values for individual time settings
  const [editingIndividualValues, setEditingIndividualValues] = useState<Record<string, Partial<IndividualTime>>>({});

  // Handler function to start editing an individual time setting
  // Sets the editing state and copies current values
  const handleStartEditIndividual = (time: IndividualTime) => {
    setEditingIndividualId(time.id);
    setEditingIndividualValues(prev => ({ ...prev, [time.id]: { ...time } }));
  };

  // Handler function for changes in individual editing fields
  // Updates the temporary editing values
  const handleIndividualChange = (id: string, field: keyof IndividualTime, value: any) => {
    setEditingIndividualValues(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  // Handler function to save changes to an individual time setting
  // Applies only time-related updates, persists, refreshes, and exits edit mode
  const handleSaveIndividual = (id: string) => {
    const edits = editingIndividualValues[id];
    if (!edits) return; // No edits to save
    const updates: Partial<IndividualTime> = {};
    if (edits.resumptionTime) updates.resumptionTime = edits.resumptionTime;
    if (edits.closeTime) updates.closeTime = edits.closeTime;
    if (Object.keys(updates).length === 0) {
      setEditingIndividualId(null); // No changes, exit edit mode
      return;
    }
    updateIndividualTime(id, updates);
    persistIndividualTimes(); // Save to storage
    refreshIndividualTimes(); // Refresh data
    setEditingIndividualId(null); // Exit edit mode
  };

  // Handler function to cancel editing an individual time setting
  // Resets editing state and removes temporary values
  const handleCancelIndividual = (id: string) => {
    setEditingIndividualId(null);
    setEditingIndividualValues(prev => {
      const copy = { ...prev };
      delete copy[id]; // Remove temporary edits
      return copy;
    });
  };

  // Handler function to add a new individual time setting
  // Adds the time and refreshes the data
  const handleAddIndividual = (time: Omit<IndividualTime, 'id'>) => {
    addIndividualTime(time);
    refreshIndividualTimes();
  };

  // Function to submit the new individual time setting form
  // Validates required fields, adds the setting, resets form, and closes modal
  const submitNewIndividual = () => {
    if (!newIndividual.staffId || !newIndividual.staffName) return; // Validation
    handleAddIndividual(newIndividual);
    // Reset form to default values
    setNewIndividual({ staffId: '', staffName: '', department: '', resumptionTime: '09:00', closeTime: '17:00', isCustom: true });
    setShowAddIndividualModal(false); // Close modal
  };

  // Render the component's UI
  return (
    // Main container with vertical spacing between sections
    <div className="space-y-6">
      {/* Header section displaying key statistics in a grid of cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Card showing standard resumption time */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
              <Clock className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Standard Resumption</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>8:00 AM</p>
            </div>
          </div>
        </div>
        {/* Card showing total number of branches */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
              <Building className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Branches</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{branchTimes.length}</p>
            </div>
          </div>
        </div>
        {/* Card showing number of late resumption settings (individual times) */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <User className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Late Resumption</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{individualTimes.length}</p>
            </div>
          </div>
        </div>
        {/* Card showing average attendance rate as a proxy for working hours */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff' }}>
              <Clock className="w-5 h-5" style={{ color: '#a855f7' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Working Hours/Day</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{metrics.avgAttendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section for switching between branch and individual settings */}
      <div className="card">
        <div className="tabs-list" style={{ padding: '0 1.5rem' }}>
          {/* Tab button for branch settings */}
          <button
            className={`tabs-trigger ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            <Building className="w-4 h-4 mr-2" />
            Branch Settings
          </button>
          {/* Tab button for individual settings */}
          <button
            className={`tabs-trigger ${activeTab === 'individuals' ? 'active' : ''}`}
            onClick={() => setActiveTab('individuals')}
          >
            <User className="w-4 h-4 mr-2" />
            Individual Settings
          </button>
        </div>
      </div>

      {/* Conditional rendering for Branch Settings tab */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          {/* Map over each branch to display its settings card */}
          {branchTimes.map((branch) => (
            <div key={branch.id} className="card">
              {/* Branch header with name, ID, and edit button */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                      <Building className="w-5 h-5" style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.125rem' }}>{branch.branchName}</h3>
                      <p className="text-xs text-muted">Branch ID: {branch.id}</p>
                    </div>
                  </div>
                  {/* Button to toggle edit mode for this branch */}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => editingBranch === branch.id ? handleCancelEdit(branch.id) : handleStartEdit(branch)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {editingBranch === branch.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
              {/* Branch settings form */}
              <div className="p-4">
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  {/* Input for resumption time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Resumption Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingBranch === branch.id ? (editingValues[branch.id]?.resumptionTime ?? branch.resumptionTime) : branch.resumptionTime}
                      onChange={(e) => handleEditChange(branch.id, 'resumptionTime', e.target.value)}
                      disabled={editingBranch !== branch.id} // Disabled unless editing
                    />
                  </div>
                  {/* Input for close time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Close Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingBranch === branch.id ? (editingValues[branch.id]?.closeTime ?? branch.closeTime) : branch.closeTime}
                      onChange={(e) => handleEditChange(branch.id, 'closeTime', e.target.value)}
                      disabled={editingBranch !== branch.id}
                    />
                  </div>
                  {/* Input for Saturday resumption time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Saturday Resumption Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingBranch === branch.id ? (editingValues[branch.id]?.saturdayResumptionTime ?? branch.saturdayResumptionTime) : branch.saturdayResumptionTime}
                      onChange={(e) => handleEditChange(branch.id, 'saturdayResumptionTime', e.target.value)}
                      disabled={editingBranch !== branch.id}
                    />
                  </div>
                  {/* Input for last Saturday resumption time */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Last Saturday Resumption Time
                    </label>
                    <input
                      type="time"
                      className="input"
                      value={editingBranch === branch.id ? (editingValues[branch.id]?.lastSaturdayResumptionTime ?? branch.lastSaturdayResumptionTime) : branch.lastSaturdayResumptionTime}
                      onChange={(e) => handleEditChange(branch.id, 'lastSaturdayResumptionTime', e.target.value)}
                      disabled={editingBranch !== branch.id}
                    />
                  </div>
                  {/* Display working days */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Working Days
                    </label>
                    <p className="text-muted" style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>
                      {branch.workingDays.join(', ')}
                    </p>
                  </div>
                </div>
                {/* Special dates section, only shown when editing */}
                {editingBranch === branch.id && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Special Dates</h4>
                    <div className="space-y-2">
                      {/* Map over special dates for editing */}
                      {(editingValues[branch.id]?.specialDates ?? branch.specialDates).map((sd, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {/* Date input */}
                          <input
                            type="date"
                            className="input"
                            value={sd.date}
                            onChange={(e) => {
                              const newSD = [...(editingValues[branch.id]?.specialDates ?? branch.specialDates)];
                              newSD[idx].date = e.target.value;
                              handleEditChange(branch.id, 'specialDates', newSD);
                            }}
                          />
                          {/* Resumption time input */}
                          <input
                            type="time"
                            className="input"
                            value={sd.resumptionTime}
                            onChange={(e) => {
                              const newSD = [...(editingValues[branch.id]?.specialDates ?? branch.specialDates)];
                              newSD[idx].resumptionTime = e.target.value;
                              handleEditChange(branch.id, 'specialDates', newSD);
                            }}
                          />
                          {/* Close time input */}
                          <input
                            type="time"
                            className="input"
                            value={sd.closeTime}
                            onChange={(e) => {
                              const newSD = [...(editingValues[branch.id]?.specialDates ?? branch.specialDates)];
                              newSD[idx].closeTime = e.target.value;
                              handleEditChange(branch.id, 'specialDates', newSD);
                            }}
                          />
                          {/* Button to remove this special date */}
                          <button
                            className="btn btn-sm btn-outline red"
                            onClick={() => {
                              const newSD = [...(editingValues[branch.id]?.specialDates ?? branch.specialDates)];
                              newSD.splice(idx, 1);
                              handleEditChange(branch.id, 'specialDates', newSD);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {/* Button to add a new special date */}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          const newSD = [...(editingValues[branch.id]?.specialDates ?? branch.specialDates), { date: '', resumptionTime: '08:00', closeTime: '17:00' }];
                          handleEditChange(branch.id, 'specialDates', newSD);
                        }}
                      >
                        Add Special Date
                      </button>
                    </div>
                  </div>
                )}
                {/* Save/Cancel buttons, only shown when editing */}
                {editingBranch === branch.id && (
                  <div className="flex justify-end gap-2" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <button className="btn btn-outline" onClick={() => handleCancelEdit(branch.id)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSaveBranch(branch.id)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditional rendering for Individual Settings tab */}
      {activeTab === 'individuals' && (
        <div className="space-y-6">
          {/* Header for individual settings with add button */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Late Resumption</h3>
                <p className="text-muted">Set individual resumption times for specific staff members</p>
              </div>
              {/* Button to open add individual modal */}
              <button
                className="btn btn-primary"
                onClick={() => setShowAddIndividualModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Late Resumption
              </button>
            </div>
          </div>

          {/* Modal for adding new individual time setting */}
          {showAddIndividualModal && (
            <div className="card p-4">
              <h4 style={{ marginBottom: '0.5rem' }}>Add Late Resumption</h4>
              <div className="grid grid-cols-1 md-grid-cols-2 gap-3">
                {/* Autocomplete input for staff name */}
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    placeholder="Staff Name"
                    value={newIndividual.staffName}
                    onChange={(e) => {
                      const q = e.target.value;
                      setNewIndividual({ ...newIndividual, staffName: q, staffId: '' });
                      if (q.trim().length === 0) {
                        setStaffSuggestions([]);
                        setShowStaffSuggestions(false);
                        setNewIndividual({ ...newIndividual, department: '' });
                        return;
                      }
                      // Filter staff suggestions based on input
                      const matches = mockStaffData.filter(s => (`${s.firstName} ${s.lastName}`.toLowerCase().includes(q.toLowerCase()))).slice(0, 6);
                      setStaffSuggestions(matches);
                      setShowStaffSuggestions(true);
                    }}
                    onFocus={() => {
                      if (newIndividual.staffName.trim().length > 0) setShowStaffSuggestions(true);
                    }}
                  />
                  {/* Dropdown for staff suggestions */}
                  {showStaffSuggestions && staffSuggestions.length > 0 && (
                    <ul className="card p-2" style={{ position: 'absolute', zIndex: 40, left: 0, right: 0, maxHeight: 200, overflowY: 'auto' }}>
                      {staffSuggestions.map(s => (
                        <li key={s.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                          const full = `${s.firstName} ${s.lastName}`;
                          setNewIndividual({ ...newIndividual, staffId: s.id, staffName: full, department: s.department });
                          setNewIndividualBranch(s.branches && s.branches.length > 0 ? s.branches[0].name : '');
                          setShowStaffSuggestions(false);
                        }}>
                          {s.firstName} {s.lastName} — {s.department}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Read-only department input */}
                <input
                  className="input"
                  placeholder="Department"
                  value={newIndividual.department}
                  readOnly
                />
                {/* Read-only branch input */}
                <input
                  className="input"
                  placeholder="Assigned Branch"
                  value={newIndividualBranch}
                  readOnly
                />
                {/* Time inputs for resumption and close */}
                <div className="flex gap-2">
                  <input
                    type="time"
                    className="input"
                    value={newIndividual.resumptionTime}
                    onChange={(e) => setNewIndividual({ ...newIndividual, resumptionTime: e.target.value })}
                  />
                  <input
                    type="time"
                    className="input"
                    value={newIndividual.closeTime}
                    onChange={(e) => setNewIndividual({ ...newIndividual, closeTime: e.target.value })}
                  />
                </div>
              </div>
              {/* Buttons to cancel or add */}
              <div className="flex justify-end gap-2" style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setShowAddIndividualModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitNewIndividual}>Add</button>
              </div>
            </div>
          )}

          {/* Conditional rendering: empty state or table */}
          {individualTimes.length === 0 ? (
            <div className="card p-8 flex flex-col items-center justify-center">
              <User className="w-12 h-12" style={{ color: '#e5e7eb' }} />
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>No Late Resumption set</p>
            </div>
          ) : (
            <div className="card">
              {/* Table for displaying individual time settings */}
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Staff ID</th>
                    <th className="table-header-cell">Staff Name</th>
                    <th className="table-header-cell">Department</th>
                    <th className="table-header-cell">Resumption Time</th>
                    <th className="table-header-cell">Close Time</th>
                    <th className="table-header-cell right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map over individual times to display rows */}
                  {individualTimes.map((time) => (
                    <tr key={time.id} className="table-row">
                      {/* Staff ID column */}
                      <td className="table-cell">
                        <span className="badge badge-secondary">{time.staffId}</span>
                      </td>
                      {/* Staff Name column with avatar */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                            {(mockStaffData.find(s => s.id === time.staffId)?.firstName || time.staffName).split(' ').map(n => n[0]).join('')}
                          </div>
                          {(mockStaffData.find(s => s.id === time.staffId)?.firstName ? `${mockStaffData.find(s => s.id === time.staffId)!.firstName} ${mockStaffData.find(s => s.id === time.staffId)!.lastName}` : time.staffName)}
                        </div>
                      </td>
                      {/* Department column */}
                      <td className="table-cell">{time.department}</td>
                      {/* Resumption Time column with edit input if editing */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted" />
                          {editingIndividualId === time.id ? (
                            <input type="time" className="input" value={editingIndividualValues[time.id]?.resumptionTime ?? time.resumptionTime} onChange={(e) => handleIndividualChange(time.id, 'resumptionTime', e.target.value)} />
                          ) : (
                            <span style={{ fontWeight: 500 }}>{time.resumptionTime}</span>
                          )}
                        </div>
                      </td>
                      {/* Close Time column with edit input if editing */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted" />
                          {editingIndividualId === time.id ? (
                            <input type="time" className="input" value={editingIndividualValues[time.id]?.closeTime ?? time.closeTime} onChange={(e) => handleIndividualChange(time.id, 'closeTime', e.target.value)} />
                          ) : (
                            <span style={{ fontWeight: 500 }}>{time.closeTime}</span>
                          )}
                        </div>
                      </td>
                      {/* Actions column with edit/save/cancel/remove buttons */}
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          {editingIndividualId === time.id ? (
                            <>
                              <button className="btn btn-sm btn-primary" onClick={() => handleSaveIndividual(time.id)}>
                                Save
                              </button>
                              <button className="btn btn-sm btn-outline" onClick={() => handleCancelIndividual(time.id)}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-outline" onClick={() => handleStartEditIndividual(time)}>
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button className="btn btn-sm btn-outline red" onClick={() => handleRemoveIndividual(time.id)}>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
