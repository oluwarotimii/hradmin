// This component provides comprehensive leave management functionality
// It handles leave requests, approvals, reporting, and year-end processing

// Import React hooks for state management
import { useState } from 'react';
// Import Lucide React icons for UI elements
import { Search, Calendar, Download, Filter, Check, X, Clock, User, Building, FileText, TrendingUp, AlertCircle, CalendarDays, Info } from 'lucide-react';
// Import branch data function
import { getBranches } from '../data/branchData';

// Interface defining the structure of a leave request
interface LeaveRequest {
  id: string; // Unique leave request identifier
  staffId: string; // ID of the staff member requesting leave
  staffName: string; // Full name of the staff member
  department: string; // Department the staff belongs to
  branch: string; // Branch location
  leaveType: 'Sick' | 'Annual' | 'Emergency' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Bereaved'; // Type of leave
  startDate: string; // Start date of leave (YYYY-MM-DD format)
  endDate: string; // End date of leave (YYYY-MM-DD format)
  duration: number; // Number of days requested
  reason: string; // Reason for the leave request
  status: 'Pending' | 'Approved' | 'Declined' | 'Active'; // Current status of the request
  requestDate: string; // Date the request was submitted
  approvedBy?: string; // Name of the person who approved (optional)
  approvalDate?: string; // Date of approval (optional)
  declineReason?: string; // Reason for decline if declined (optional)
  coveringStaff?: string; // Staff member covering duties (optional)
}

// Interface defining leave balance structure for each staff member
interface LeaveBalance {
  staffId: string; // Staff member ID
  sick: { used: number; total: number }; // Sick leave balance
  annual: { used: number; total: number; firstHalf: number; secondHalf: number; rollover: number }; // Annual leave with half-year breakdown
  paternity: { used: number; total: number }; // Paternity leave balance
  bereaved: { used: number; total: number }; // Bereavement leave balance
  maternity: { used: number; total: number }; // Maternity leave balance
}

// Define leave types with their limits, colors, icons, and descriptions
const leaveTypes = [
  { type: 'Sick', limit: 3, color: '#ef4444', icon: '🤒', description: '3 days per year' },
  { type: 'Annual', limit: 14, color: '#3b82f6', icon: '🏖️', description: '14 days (7/half, max 7/request)' },
  { type: 'Emergency', limit: null, color: '#f59e0b', icon: '🚨', description: 'No limit' },
  { type: 'Maternity', limit: 90, color: '#ec4899', icon: '🤱', description: '90 days (3 months)' },
  { type: 'Paternity', limit: 3, color: '#8b5cf6', icon: '👶', description: '3 days per year' },
  { type: 'Unpaid', limit: null, color: '#6b7280', icon: '💼', description: 'No limit' },
  { type: 'Bereaved', limit: 3, color: '#0f172a', icon: '🕊️', description: '3 days per year' }
];

// Get available branches from branch data
const AVAILABLE_BRANCHES = getBranches();

// Mock leave requests data for demonstration purposes
// Contains sample leave requests with various statuses and types
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'LV001',
    staffId: 'STF001',
    staffName: 'Chukwuemeka J. Okonkwo',
    department: 'IT Department',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1', // Use first available branch or default
    leaveType: 'Annual',
    startDate: '2024-12-01',
    endDate: '2024-12-05',
    duration: 5,
    reason: 'Family vacation',
    status: 'Approved',
    requestDate: '2024-11-01',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-03',
    coveringStaff: 'Aisha B. Mohammed'
  },
  {
    id: 'LV002',
    staffId: 'STF002',
    staffName: 'Aisha B. Mohammed',
    department: 'Finance',
    branch: AVAILABLE_BRANCHES[1] ?? 'Branch 2',
    leaveType: 'Sick',
    startDate: '2024-11-18',
    endDate: '2024-11-19',
    duration: 2,
    reason: 'Medical treatment',
    status: 'Approved',
    requestDate: '2024-11-17',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-17'
  },
  {
    id: 'LV003',
    staffId: 'STF003',
    staffName: 'Oluwaseun G. Adeyemi',
    department: 'Marketing',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    leaveType: 'Annual',
    startDate: '2024-11-25',
    endDate: '2024-12-02',
    duration: 8,
    reason: 'Personal matters',
    status: 'Declined',
    requestDate: '2024-11-15',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-16',
    declineReason: 'Annual leave exceeds 7-day limit for single request. Please split into two requests.'
  },
  {
    id: 'LV004',
    staffId: 'STF004',
    staffName: 'Chidinma F. Eze',
    department: 'Human Resources',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    leaveType: 'Maternity',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    duration: 90,
    reason: 'Maternity leave',
    status: 'Approved',
    requestDate: '2024-10-15',
    approvedBy: 'HR Manager',
    approvalDate: '2024-10-16',
    coveringStaff: 'Oluwaseun G. Adeyemi'
  },
  {
    id: 'LV005',
    staffId: 'STF005',
    staffName: 'Abdullahi M. Abubakar',
    department: 'Operations',
    branch: AVAILABLE_BRANCHES[2] ?? 'Branch 3',
    leaveType: 'Bereaved',
    startDate: '2024-11-20',
    endDate: '2024-11-22',
    duration: 3,
    reason: 'Family bereavement',
    status: 'Approved',
    requestDate: '2024-11-19',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-19'
  },
  {
    id: 'LV006',
    staffId: 'STF006',
    staffName: 'Ngozi A. Onyeka',
    department: 'Sales',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    leaveType: 'Paternity',
    startDate: '2024-11-22',
    endDate: '2024-11-24',
    duration: 3,
    reason: 'Paternity leave',
    status: 'Pending',
    requestDate: '2024-11-14'
  },
  {
    id: 'LV007',
    staffId: 'STF001',
    staffName: 'Chukwuemeka J. Okonkwo',
    department: 'IT Department',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    leaveType: 'Emergency',
    startDate: '2024-11-21',
    endDate: '2024-11-21',
    duration: 1,
    reason: 'Family emergency',
    status: 'Pending',
    requestDate: '2024-11-20'
  },
  {
    id: 'LV008',
    staffId: 'STF002',
    staffName: 'Aisha B. Mohammed',
    department: 'Finance',
    branch: AVAILABLE_BRANCHES[1] ?? 'Branch 2',
    leaveType: 'Unpaid',
    startDate: '2024-12-10',
    endDate: '2024-12-14',
    duration: 5,
    reason: 'Personal reasons',
    status: 'Pending',
    requestDate: '2024-11-13'
  },
  {
    id: 'LV009',
    staffId: 'STF003',
    staffName: 'Oluwaseun G. Adeyemi',
    department: 'Marketing',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    leaveType: 'Annual',
    startDate: '2024-11-15',
    endDate: '2024-11-20',
    duration: 6,
    reason: 'Rest and relaxation',
    status: 'Active',
    requestDate: '2024-10-20',
    approvedBy: 'HR Manager',
    approvalDate: '2024-10-22',
    coveringStaff: 'Chukwuemeka J. Okonkwo'
  }
];

// Mock leave balances data for demonstration
// Contains leave balances for different staff members
const mockLeaveBalances: LeaveBalance[] = [
  {
    staffId: 'STF001',
    sick: { used: 0, total: 3 },
    annual: { used: 5, total: 14, firstHalf: 2, secondHalf: 3, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF002',
    sick: { used: 2, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF003',
    sick: { used: 0, total: 3 },
    annual: { used: 6, total: 14, firstHalf: 0, secondHalf: 6, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF004',
    sick: { used: 0, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 90, total: 90 } // Maternity leave used
  },
  {
    staffId: 'STF005',
    sick: { used: 0, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 3, total: 3 }, // Bereavement leave used
    maternity: { used: 0, total: 90 }
  }
];

// Main component function for leave management view
export function LeaveManagementView() {
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for filtering by request status
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'declined' | 'active' | 'pending'>('all');
  // State for filtering by leave type
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  // State for showing/hiding advanced filters panel
  const [showFilters, setShowFilters] = useState(false);
  // State for filtering by department
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  // State for active tab (requests, report, year-end)
  const [activeTab, setActiveTab] = useState<'requests' | 'report' | 'year-end'>('requests');
  // State for selected leave request (for modals)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  // State for showing approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // State for approval action type (approve/decline)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'decline' | null>(null);
  // State for decline reason input
  const [declineReason, setDeclineReason] = useState('');
  // State for showing details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter leave requests based on search term, status, leave type, and department
  const filteredRequests = mockLeaveRequests.filter(request => {
    // Check if request matches search term (name, ID, department, or reason)
    const matchesSearch = searchTerm === '' ||
      request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if request matches status filter
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'approved' ? request.status === 'Approved' :
      filterStatus === 'declined' ? request.status === 'Declined' :
      filterStatus === 'active' ? request.status === 'Active' :
      filterStatus === 'pending' ? request.status === 'Pending' :
      true;

    // Check if request matches leave type filter
    const matchesLeaveType = filterLeaveType === 'all' || request.leaveType === filterLeaveType;
    // Check if request matches department filter
    const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;

    // Return true only if all filter conditions match
    return matchesSearch && matchesStatus && matchesLeaveType && matchesDepartment;
  });

  // Calculate statistics from all leave requests
  const totalRequests = mockLeaveRequests.length;
  const approvedCount = mockLeaveRequests.filter(r => r.status === 'Approved').length;
  const declinedCount = mockLeaveRequests.filter(r => r.status === 'Declined').length;
  const activeCount = mockLeaveRequests.filter(r => r.status === 'Active').length;
  const pendingCount = mockLeaveRequests.filter(r => r.status === 'Pending').length;

  // Handler for approval/decline actions - opens approval modal
  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'decline') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handler for viewing request details - opens details modal
  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Handler for confirming approval/decline action
  const confirmApproval = () => {
    if (approvalAction === 'approve' && selectedRequest) {
      // Validate annual leave duration limit (7 days max per request)
      if (selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7) {
        alert('Annual leave requests cannot exceed 7 days. Please ask the employee to split the request.');
        return;
      }
    }

    // Log the action (in real app, this would update the database)
    console.log(`${approvalAction} request ${selectedRequest?.id}`, declineReason);
    // Close modal and reset state
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalAction(null);
    setDeclineReason('');
  };

  // Function to render the requests tab content
  const renderRequestsTab = () => (
    <>
      {/* Interactive Stats Cards - clickable cards that filter by status */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-5 gap-4">
        {/* All Requests Card - shows total count and filters to show all */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('all')}
          style={{
            border: filterStatus === 'all' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'all' ? '#eff6ff' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe', width: '2.5rem', height: '2.5rem' }}>
              <Calendar className="w-4 h-4" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>All Requests</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalRequests}</p>
            </div>
          </div>
        </div>
        {/* Approved Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('approved')}
          style={{
            border: filterStatus === 'approved' ? '2px solid #16a34a' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'approved' ? '#f0fdf4' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dcfce7', width: '2.5rem', height: '2.5rem' }}>
              <Check className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Approved</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{approvedCount}</p>
            </div>
          </div>
        </div>
        {/* Declined Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('declined')}
          style={{
            border: filterStatus === 'declined' ? '2px solid #dc2626' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'declined' ? '#fef2f2' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2', width: '2.5rem', height: '2.5rem' }}>
              <X className="w-4 h-4" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Declined</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{declinedCount}</p>
            </div>
          </div>
        </div>
        {/* Active Leave Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('active')}
          style={{
            border: filterStatus === 'active' ? '2px solid #10b981' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'active' ? '#ecfdf5' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', width: '2.5rem', height: '2.5rem' }}>
              <CalendarDays className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Active Now</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeCount}</p>
            </div>
          </div>
        </div>
        {/* Pending Requests Card */}
        <div
          className="card p-4 cursor-pointer transition-all hover-lift"
          onClick={() => setFilterStatus('pending')}
          style={{
            border: filterStatus === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            backgroundColor: filterStatus === 'pending' ? '#fffbeb' : 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', width: '2.5rem', height: '2.5rem' }}>
              <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar and Filter Controls */}
      <div className="card p-4">
        {/* Main search and action bar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search input with icon */}
          <div className="input-wrapper" style={{ flex: 1, minWidth: '250px' }}>
            <div className="input-icon">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, department, or reason..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Toggle filters button */}
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          {/* Export button */}
          <button className="btn btn-sm btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        {/* Advanced Filters Panel - shown when showFilters is true */}
        {showFilters && (
          <div className="grid grid-cols-1 md-grid-cols-3 gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
            {/* Leave Type Filter */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Leave Type
              </label>
              <select
                className="input"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="all">All Types</option>
                {/* Map through leave types to create options */}
                {leaveTypes.map(type => (
                  <option key={type.type} value={type.type}>{type.icon} {type.type}</option>
                ))}
              </select>
            </div>
            {/* Department Filter */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Department
              </label>
              <select
                className="input"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="IT Department">IT Department</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                className="btn btn-outline w-full"
                onClick={() => {
                  setSearchTerm(''); // Clear search term
                  setFilterStatus('all'); // Reset status filter
                  setFilterLeaveType('all'); // Reset leave type filter
                  setSelectedDepartment('all'); // Reset department filter
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Types Guide - interactive cards showing leave policies */}
      <div className="card p-6">
        {/* Header with info icon and title */}
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4" style={{ color: '#2563eb' }} />
          <h3 style={{ marginBottom: 0 }}>Leave Types & Policies</h3>
          <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>Click to filter</span>
        </div>
        {/* Grid of leave type cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-3">
          {/* Map through leave types to create interactive cards */}
          {leaveTypes.map(type => (
            <div
              key={type.type}
              className="flex items-center gap-3 p-3 rounded cursor-pointer transition-all hover-lift"
              style={{
                backgroundColor: filterLeaveType === type.type ? type.color + '20' : '#f9fafb', // Highlight selected type
                border: filterLeaveType === type.type ? `2px solid ${type.color}` : '1px solid #e5e7eb'
              }}
              onClick={() => setFilterLeaveType(filterLeaveType === type.type ? 'all' : type.type)} // Toggle filter
            >
              {/* Leave type icon */}
              <div className="icon-wrapper" style={{ backgroundColor: type.color + '30', width: '2.75rem', height: '2.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
              </div>
              {/* Leave type details */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{type.type}</p>
                <p className="text-xs text-muted">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        {/* Table header with title and count */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Leave Requests</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing {filteredRequests.length} of {totalRequests} requests
                {/* Show active filter indicator */}
                {filterStatus !== 'all' && <span style={{ color: '#2563eb', fontWeight: 500 }}> · {filterStatus}</span>}
              </p>
            </div>
          </div>
        </div>
        {/* Table container */}
        <div className="table-container">
          <table className="table">
            {/* Table header */}
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Leave Details</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Duration</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            {/* Table body with filtered requests */}
            <tbody>
              {/* Map through filtered requests to create table rows */}
              {filteredRequests.map((request) => {
                // Find leave type information for styling
                const leaveTypeInfo = leaveTypes.find(t => t.type === request.leaveType);
                return (
                  // Table row for each leave request
                  <tr key={request.id} className="table-row">
                    {/* Employee information cell */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {/* Employee avatar with initials */}
                        <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem' }}>
                          {request.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        {/* Employee name and ID */}
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{request.staffName}</p>
                          <p className="text-xs text-muted">{request.staffId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1.25rem' }}>{leaveTypeInfo?.icon}</span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{request.leaveType} Leave</p>
                          <p className="text-xs text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {request.reason}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' → '}
                          {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted">
                          Requested: {new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded"
                        style={{ backgroundColor: leaveTypeInfo?.color + '10', display: 'inline-flex' }}
                      >
                        <Clock className="w-3 h-3" style={{ color: leaveTypeInfo?.color }} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: leaveTypeInfo?.color }}>
                          {request.duration} day{request.duration > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <span className={`badge ${
                          request.status === 'Approved' ? 'badge-success' : 
                          request.status === 'Declined' ? 'badge-danger' : 
                          request.status === 'Active' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {request.status}
                        </span>
                        {request.status === 'Active' && (
                          <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                            Ends {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell right">
                      {request.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="btn btn-sm btn-outline green"
                            onClick={() => handleApprovalAction(request, 'approve')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline red"
                            onClick={() => handleApprovalAction(request, 'decline')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewDetails(request)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="icon-wrapper" style={{ backgroundColor: '#f3f4f6', width: '4rem', height: '4rem' }}>
              <Calendar className="w-8 h-8" style={{ color: '#9ca3af' }} />
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 500, color: '#6b7280' }}>No leave requests found</p>
            <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
              {searchTerm || filterStatus !== 'all' || filterLeaveType !== 'all' || selectedDepartment !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Leave requests will appear here'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  const renderReportTab = () => {
    const leaveByType = leaveTypes.map(type => ({
      type: type.type,
      count: mockLeaveRequests.filter(r => r.leaveType === type.type && r.status === 'Approved').length,
      days: mockLeaveRequests.filter(r => r.leaveType === type.type && r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0),
      icon: type.icon,
      color: type.color
    }));

    const departmentStats = ['IT Department', 'Finance', 'Marketing', 'Human Resources', 'Operations', 'Sales'].map(dept => ({
      dept,
      count: mockLeaveRequests.filter(r => r.department === dept && r.status === 'Approved').length,
      days: mockLeaveRequests.filter(r => r.department === dept && r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0)
    }));

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                <Calendar className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Leave Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {mockLeaveRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
                <User className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Employees on Leave</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Approval Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {((approvedCount / (approvedCount + declinedCount)) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2' }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Pending Review</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leave by Type */}
        <div className="card p-6">
          <h3 style={{ marginBottom: '1.5rem' }}>Leave Distribution by Type</h3>
          <div className="space-y-4">
            {leaveByType.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted">{item.count} requests</span>
                    <span style={{ fontWeight: 600 }}>{item.days} days</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(item.days / Math.max(...leaveByType.map(d => d.days))) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card p-6">
          <h3 style={{ marginBottom: '1.5rem' }}>Leave by Department</h3>
          <div className="space-y-3">
            {departmentStats.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.dept}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted">{item.count} requests</span>
                    <span style={{ fontWeight: 600 }}>{item.days} days</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(item.days / Math.max(...departmentStats.map(d => d.days))) * 100}%`,
                      backgroundColor: '#2563eb'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderYearEndAnalysis = () => {
    const totalLeaveDays = mockLeaveRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.duration, 0);
    const averageLeaveDays = totalLeaveDays / mockLeaveBalances.length;
    
    const annualLeaveData = mockLeaveBalances.map(balance => {
      const remaining = balance.annual.total - balance.annual.used;
      return {
        staffId: balance.staffId,
        used: balance.annual.used,
        remaining,
        discarded: remaining // All remaining days will be discarded
      };
    });

    const totalDiscarded = annualLeaveData.reduce((sum, data) => sum + data.discarded, 0);

    return (
      <div className="space-y-6">
        {/* Year End Header */}
        <div className="card p-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>2024 Year-End Leave Analysis</h2>
              <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Comprehensive leave statistics and usage analysis</p>
            </div>
            <Calendar className="w-16 h-16" style={{ opacity: 0.3 }} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
                <Calendar className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Leave Days Taken</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalLeaveDays}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Avg. per Employee</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{averageLeaveDays.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Unused Leave Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalDiscarded}</p>
                <p className="text-xs text-muted">Will be discarded</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff' }}>
                <User className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Employees Analyzed</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{mockLeaveBalances.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="card p-6">
          <h3 style={{ marginBottom: '1.5rem' }}>2024 Leave Breakdown by Type</h3>
          <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
            {leaveTypes.map(type => {
              const typeRequests = mockLeaveRequests.filter(r => r.leaveType === type.type && r.status === 'Approved');
              const totalDays = typeRequests.reduce((sum, r) => sum + r.duration, 0);
              const employeeCount = new Set(typeRequests.map(r => r.staffId)).size;
              
              return (
                <div key={type.type} className="p-4 rounded" style={{ backgroundColor: type.color + '10', border: `1px solid ${type.color}30` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="icon-wrapper" style={{ backgroundColor: type.color + '30', width: '3rem', height: '3rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600 }}>{type.type}</p>
                      <p className="text-xs text-muted">{type.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted">Total Days Used</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{totalDays}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Employees</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{employeeCount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Annual Leave Year-End Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Annual Leave Year-End Summary</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Unused annual leave days that will be discarded at year-end
              </p>
            </div>
            <button className="btn btn-sm btn-outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
          <div className="space-y-3">
            {annualLeaveData.map((data, index) => {
              const staff = mockLeaveRequests.find(r => r.staffId === data.staffId);
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}>
                      {staff?.staffName.split(' ').map(n => n[0]).join('').slice(0, 2) || data.staffId.replace('STF', '')}
                    </div>
                    <div>
                      <p style={{ fontWeight: 500 }}>{staff?.staffName || 'Staff Member'}</p>
                      <p className="text-xs text-muted">{data.staffId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-muted">Used 2024</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{data.used} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Remaining</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{data.remaining} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Unused</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#dc2626' }}>{data.discarded} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Status</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#dc2626' }}>Will be discarded</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy Notes */}
        <div className="card p-6" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5" style={{ color: '#2563eb', marginTop: '0.125rem', flexShrink: 0 }} />
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#1e40af' }}>Year-End Leave Policy Notes</h4>
              <ul style={{ fontSize: '0.875rem', color: '#1e40af', listStyle: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Annual leave: 14 days per year (7 days per half-year)</li>
                <li>Unused annual leave is discarded at year-end (no rollover)</li>
                <li>Single request limit: 7 consecutive days for annual leave</li>
                <li>Sick, Bereaved, and Paternity leave do not rollover</li>
                <li>Maternity leave: 90 days (must be used within designated period)</li>
                <li>Emergency and Unpaid leaves: No fixed limits, reviewed case-by-case</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main component render return
  return (
    // Main container with vertical spacing
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="card">
        {/* Tab list container */}
        <div className="tabs-list" style={{ padding: '0 1.5rem' }}>
          {/* Requests Tab */}
          <button
            className={`tabs-trigger ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Leave Requests
          </button>
          {/* Report Tab */}
          <button
            className={`tabs-trigger ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Leave Report
          </button>
          {/* Year-End Analysis Tab */}
          <button
            className={`tabs-trigger ${activeTab === 'year-end' ? 'active' : ''}`}
            onClick={() => setActiveTab('year-end')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Year-End Analysis
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'requests' && renderRequestsTab()}
      {activeTab === 'report' && renderReportTab()}
      {activeTab === 'year-end' && renderYearEndAnalysis()}

      {/* Approval Modal - shown when showApprovalModal is true */}
      {showApprovalModal && selectedRequest && (
        <>
          {/* Modal overlay for backdrop */}
          <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}></div>
          {/* Modal dialog */}
          <div className="modal">
            {/* Modal header with title and close button */}
            <div className="modal-header">
              <h3>{approvalAction === 'approve' ? 'Approve' : 'Decline'} Leave Request</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowApprovalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal content */}
            <div className="modal-content">
              <div className="space-y-4">
                {/* Employee information section */}
                <div className="flex items-center gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  {/* Employee avatar with initials */}
                  <div className="avatar" style={{ width: '3rem', height: '3rem' }}>
                    {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {/* Employee details */}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedRequest.staffName}</p>
                    <p className="text-xs text-muted">{selectedRequest.staffId} · {selectedRequest.department}</p>
                  </div>
                </div>

                {/* Leave details grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Leave type information */}
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Leave Type</p>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.25rem' }}>{leaveTypes.find(t => t.type === selectedRequest.leaveType)?.icon}</span>
                      <span style={{ fontWeight: 600 }}>{selectedRequest.leaveType}</span>
                    </div>
                  </div>
                  {/* Duration information */}
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Duration</p>
                    <p style={{ fontWeight: 600 }}>{selectedRequest.duration} day{selectedRequest.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</p>
                    <p style={{ fontWeight: 600 }}>
                      {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</p>
                    <p style={{ fontWeight: 600 }}>
                      {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Reason</p>
                  <p style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                    {selectedRequest.reason}
                  </p>
                </div>
                
                {selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7 && approvalAction === 'approve' && (
                  <div className="p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4" style={{ color: '#dc2626', marginTop: '0.125rem', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>Policy Violation</p>
                        <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                          This annual leave request exceeds the 7-day limit. Please request the employee to split this into separate requests.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {approvalAction === 'decline' && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      Decline Reason *
                    </label>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Please provide a reason for declining this request..."
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      style={{ resize: 'vertical' }}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowApprovalModal(false)}>Cancel</button>
              <button 
                className={`btn ${approvalAction === 'approve' ? 'btn-primary' : 'btn-outline red'}`}
                onClick={confirmApproval}
                disabled={(approvalAction === 'decline' && !declineReason.trim()) || (approvalAction === 'approve' && selectedRequest.leaveType === 'Annual' && selectedRequest.duration > 7)}
              >
                {approvalAction === 'approve' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Decline Request
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <>
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Leave Request Details</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowDetailsModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="avatar" style={{ width: '3rem', height: '3rem' }}>
                    {selectedRequest.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedRequest.staffName}</p>
                    <p className="text-xs text-muted">{selectedRequest.staffId} · {selectedRequest.department}</p>
                    <p className="text-xs text-muted">{selectedRequest.branch}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Leave Type</p>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.25rem' }}>{leaveTypes.find(t => t.type === selectedRequest.leaveType)?.icon}</span>
                      <span style={{ fontWeight: 600 }}>{selectedRequest.leaveType}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Status</p>
                    <span className={`badge ${
                      selectedRequest.status === 'Approved' ? 'badge-success' : 
                      selectedRequest.status === 'Declined' ? 'badge-danger' : 
                      selectedRequest.status === 'Active' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Start Date</p>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>End Date</p>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Duration</p>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedRequest.duration} day{selectedRequest.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Reason</p>
                  <p style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                    {selectedRequest.reason}
                  </p>
                </div>
                
                {selectedRequest.coveringStaff && (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Covering Staff</p>
                    <p style={{ fontWeight: 600 }}>{selectedRequest.coveringStaff}</p>
                  </div>
                )}
                
                {selectedRequest.approvedBy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {selectedRequest.status === 'Approved' ? 'Approved By' : 'Declined By'}
                      </p>
                      <p style={{ fontWeight: 600 }}>{selectedRequest.approvedBy}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Date</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {selectedRequest.approvalDate && new Date(selectedRequest.approvalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedRequest.declineReason && (
                  <div className="p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500, marginBottom: '0.25rem' }}>Decline Reason</p>
                    <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{selectedRequest.declineReason}</p>
                  </div>
                )}
              </div>
            </div>
            {/* Modal footer with close button */}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
