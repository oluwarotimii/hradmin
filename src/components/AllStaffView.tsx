// This component displays a comprehensive staff directory view
// It provides filtering, searching, and detailed staff profile access

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import Lucide React icons for UI elements
import { Search, Users, UserX, Plus, X, Check, Upload, Calendar, Briefcase, GraduationCap, Phone, MapPin, FileText, Clock } from 'lucide-react';
// Import staff data types and mock data from staffData module
import { mockStaffData, StaffMember, Education, Leave, OffDay, Document, isStaffOnActiveOffDay } from '../data/staffData';
// Import StaffProfileView component for detailed staff information
import { StaffProfileView } from './StaffProfileView';
// Import AddStaffModal component for adding new staff members
import { AddStaffModal } from './AddStaffModal';

// Main component function for displaying all staff
export function AllStaffView({ initialSelectedStaff }: { initialSelectedStaff?: StaffMember | null }) {
  // State for active filter (all, active, inactive)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for department filter
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  // State for minimum years employed filter (leave empty for no filter)
  const [minYearsFilter, setMinYearsFilter] = useState<number | ''>('');
  // State for selected staff member (for profile view)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(initialSelectedStaff || null);
  // State for showing add staff modal
  const [showAddModal, setShowAddModal] = useState(false);
  // State for staff list (synced with mock data)
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffData);

  // Effect to sync staff list with localStorage changes on component mount
  useEffect(() => {
    setStaffList([...mockStaffData]); // Update staff list with current mock data
  }, []);

  // Effect to update selectedStaff when initialSelectedStaff changes
  useEffect(() => {
    if (initialSelectedStaff) {
      setSelectedStaff(initialSelectedStaff);
    }
  }, [initialSelectedStaff]);

  // Handler for when new staff is added via modal
  const handleStaffAdded = (newStaff: StaffMember) => {
    setStaffList([...mockStaffData]); // Refresh staff list
    setShowAddModal(false); // Close modal
  };

  // Helper: compute full years employed from date string
  const computeYearsEmployed = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years -= 1;
    return years >= 0 ? years : 0;
  };

  // Derived department options
  const departmentOptions = Array.from(new Set(mockStaffData.map(s => s.department))).filter(Boolean) as string[];

  // Filter staff based on active filter, search term, department and years employed
  const filteredStaff = staffList.filter(staff => {
    // Check if staff matches the active filter
    const matchesFilter =
      activeFilter === 'all' ? true : // Show all if 'all' selected
      activeFilter === 'active' ? staff.status === 'Active' : // Show only active
      staff.status === 'Inactive'; // Show only inactive

    // Check if staff matches search term (name, email, ID, or department)
    const matchesSearch = searchTerm === '' ||
      `${staff.firstName} ${staff.middleName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase());

    // Check department filter
    const matchesDepartment = departmentFilter === '' || staff.department === departmentFilter;

    // Check years employed (min)
    const staffYears = computeYearsEmployed(staff.dateEmployed);
    const matchesYears = minYearsFilter === '' || staffYears >= (minYearsFilter as number);

    // Return true only if all conditions match
    return matchesFilter && matchesSearch && matchesDepartment && matchesYears;
  });

  // Calculate counts for active and inactive staff
  const activeCount = staffList.filter(s => s.status === 'Active').length;
  const inactiveCount = staffList.filter(s => s.status === 'Inactive').length;

  // If a staff member is selected, show their profile view
  if (selectedStaff) {
    return (
      <StaffProfileView
        staff={selectedStaff} // Pass selected staff data
        onBack={() => { // Handler to go back to list view
          setSelectedStaff(null); // Clear selection
          setStaffList([...mockStaffData]); // Refresh staff list
        }}
        onUpdate={(updatedStaff) => { // Handler for staff updates
          setSelectedStaff(updatedStaff); // Update selected staff
          setStaffList([...mockStaffData]); // Refresh staff list
        }}
      />
    );
  }

  // Main render return for staff directory view
  return (
    <div className="space-y-6" style={{ position: 'relative' }}>
      {/* Floating Action Button for adding new staff */}
      <button
        onClick={() => setShowAddModal(true)} // Open add staff modal
        style={{
          position: 'fixed', // Fixed positioning
          bottom: '2rem', // 2rem from bottom
          right: '2rem', // 2rem from right
          width: '3.5rem', // 56px width
          height: '3.5rem', // 56px height
          borderRadius: '50%', // Circular shape
          backgroundColor: '#2563eb', // Blue background
          border: 'none', // No border
          color: 'white', // White text/icon
          fontSize: '1.5rem', // Large font size
          cursor: 'pointer', // Pointer cursor
          display: 'flex', // Flexbox layout
          alignItems: 'center', // Center vertically
          justifyContent: 'center', // Center horizontally
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', // Blue shadow
          zIndex: 40, // High z-index for overlay
          transition: 'all 0.2s ease' // Smooth transitions
        }}
        onMouseEnter={(e) => { // Hover effect
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'; // Darker shadow
          e.currentTarget.style.transform = 'scale(1.1)'; // Slight scale up
        }}
        onMouseLeave={(e) => { // Hover exit effect
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; // Original shadow
          e.currentTarget.style.transform = 'scale(1)'; // Original scale
        }}
      >
        <Plus className="w-6 h-6" /> {/* Plus icon for add action */}
      </button>

      {/* Header Statistics Cards */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        {/* Total Staff Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#eff6ff' }}>
              <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Staff</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{mockStaffData.length}</p>
            </div>
          </div>
        </div>
        {/* Active Staff Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
              <Users className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Active</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeCount}</p>
            </div>
          </div>
        </div>
        {/* Inactive Staff Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2' }}>
              <UserX className="w-5 h-5" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Inactive</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{inactiveCount}</p>
            </div>
          </div>
        </div>
        {/* Departments Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <Briefcase className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Departments</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search Input */}
          <div className="input-wrapper" style={{ width: 'auto', flex: 1, minWidth: '250px' }}>
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, ID, or department..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filter Buttons + Department & Years Filters */}
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({staffList.length})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'inactive' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive ({inactiveCount})
            </button>

            {/* Department filter select */}
            <select
              className="input input-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              <option value="">All Departments</option>
              {departmentOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Minimum years employed filter */}
            <input
              type="number"
              className="input input-sm"
              placeholder="Min years"
              min={0}
              value={minYearsFilter === '' ? '' : String(minYearsFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setMinYearsFilter(v === '' ? '' : Math.max(0, Number(v)));
              }}
              style={{ width: '110px' }}
            />
          </div>
        </div>
      </div>

      {/* Staff List Display */}
      <div className="card">
        {/* Staff List Header */}
        <div className="p-4 border-b">
          <h3>Staff Directory</h3>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Showing {filteredStaff.length} of {staffList.length} staff members
          </p>
        </div>
        {/* Staff Grid */}
        <div className="staff-grid">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id} // Unique key for React rendering
              className="staff-card"
              onClick={() => setSelectedStaff(staff)} // Click handler to view profile
            >
              <div className="flex items-start gap-4">
                {/* Staff Avatar */}
                <div className="avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1rem' }}>
                  {staff.firstName[0]}{staff.lastName[0]} {/* Initials */}
                </div>
                {/* Staff Information */}
                <div className="flex-1">
                  {/* Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.125rem' }}>
                        {staff.firstName} {staff.middleName} {staff.lastName}
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        {staff.departmentRole}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge ${staff.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                        {staff.status}
                      </span>
                      {isStaffOnActiveOffDay(staff) && (
                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.7rem' }}>
                          On Off Day
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Staff Details Grid */}
                  <div className="staff-info-grid">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-muted" />
                      <span className="text-xs text-muted">{staff.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted" />
                      <span className="text-xs text-muted">{staff.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted" />
                      <span className="text-xs text-muted">{staff.stateOfOrigin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted" />
                      <span className="text-xs text-muted">{staff.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center">
            <Users className="w-12 h-12" style={{ color: '#e5e7eb' }} />
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>No staff members found</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={showAddModal} // Control modal visibility
        onClose={() => setShowAddModal(false)} // Handler to close modal
        onSuccess={handleStaffAdded} // Handler for successful staff addition
      />
    </div>
  );
}
