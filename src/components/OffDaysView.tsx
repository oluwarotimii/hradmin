// This component provides off-day request management functionality
// It handles requests for regular off-days and official duty days with approval workflow

// Import React hooks for state management
import { useState } from 'react';
// Import Lucide React icons for UI elements
import { Search, Calendar, Download, Filter, Check, X, Clock, User, Building, FileText, TrendingUp, Sun, Briefcase } from 'lucide-react';
// Import branch data function
import { getBranches } from '../data/branchData';

// Interface defining the structure of an off-day request
interface OffDayRequest {
  id: string; // Unique off-day request identifier
  staffId: string; // ID of the staff member requesting off-day
  staffName: string; // Full name of the staff member
  department: string; // Department the staff belongs to
  branch: string; // Branch location
  date: string; // Date of the requested off-day (YYYY-MM-DD format)
  reason: string; // Reason for the off-day request
  type: 'Regular' | 'Official Duty'; // Type of off-day request
  status: 'Pending' | 'Approved' | 'Declined'; // Current status of the request
  requestDate: string; // Date the request was submitted
  approvedBy?: string; // Name of the person who approved (optional)
  approvalDate?: string; // Date of approval (optional)
  declineReason?: string; // Reason for decline if declined (optional)
}

// Get available branches from branch data
const AVAILABLE_BRANCHES = getBranches();

// Mock off-day requests data for demonstration purposes
// Contains sample off-day requests with various statuses and types
const mockOffDayRequests: OffDayRequest[] = [
  {
    id: 'OFF001',
    staffId: 'STF001',
    staffName: 'Chukwuemeka J. Okonkwo',
    department: 'IT Department',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1', // Use first available branch or default
    date: '2024-11-15',
    reason: 'Personal appointment',
    type: 'Regular',
    status: 'Approved',
    requestDate: '2024-11-10',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-11'
  },
  {
    id: 'OFF002',
    staffId: 'STF002',
    staffName: 'Aisha B. Mohammed',
    department: 'Finance',
    branch: AVAILABLE_BRANCHES[1] ?? 'Branch 2',
    date: '2024-11-20',
    reason: 'Medical checkup',
    type: 'Regular',
    status: 'Pending',
    requestDate: '2024-11-12'
  },
  {
    id: 'OFF003',
    staffId: 'STF003',
    staffName: 'Oluwaseun G. Adeyemi',
    department: 'Marketing',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    date: '2024-11-18',
    reason: 'Client meeting in Port Harcourt',
    type: 'Official Duty',
    status: 'Approved',
    requestDate: '2024-11-08',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-09'
  },
  {
    id: 'OFF004',
    staffId: 'STF004',
    staffName: 'Chidinma F. Eze',
    department: 'Human Resources',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    date: '2024-11-22',
    reason: 'Family commitment',
    type: 'Regular',
    status: 'Declined',
    requestDate: '2024-11-11',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-12',
    declineReason: 'Insufficient notice period'
  },
  {
    id: 'OFF005',
    staffId: 'STF005',
    staffName: 'Abdullahi M. Abubakar',
    department: 'Operations',
    branch: AVAILABLE_BRANCHES[2] ?? 'Branch 3',
    date: '2024-11-25',
    reason: 'Training workshop in Kaduna',
    type: 'Official Duty',
    status: 'Approved',
    requestDate: '2024-11-05',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-06'
  },
  {
    id: 'OFF006',
    staffId: 'STF001',
    staffName: 'Chukwuemeka J. Okonkwo',
    department: 'IT Department',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    date: '2024-11-28',
    reason: 'System maintenance at branch office',
    type: 'Official Duty',
    status: 'Pending',
    requestDate: '2024-11-13'
  },
  {
    id: 'OFF007',
    staffId: 'STF003',
    staffName: 'Oluwaseun G. Adeyemi',
    department: 'Marketing',
    branch: AVAILABLE_BRANCHES[0] ?? 'Branch 1',
    date: '2024-12-02',
    reason: 'Personal matters',
    type: 'Regular',
    status: 'Pending',
    requestDate: '2024-11-13'
  },
  {
    id: 'OFF008',
    staffId: 'STF002',
    staffName: 'Aisha B. Mohammed',
    department: 'Finance',
    branch: AVAILABLE_BRANCHES[1] ?? 'Branch 2',
    date: '2024-11-30',
    reason: 'Insufficient documentation',
    type: 'Regular',
    status: 'Declined',
    requestDate: '2024-11-08',
    approvedBy: 'HR Manager',
    approvalDate: '2024-11-10',
    declineReason: 'Request lacks proper justification'
  }
];

// Main component function for off-days view
export function OffDaysView() {
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for filtering by request status
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'declined' | 'pending' | 'official'>('all');
  // State for showing/hiding advanced filters panel
  const [showFilters, setShowFilters] = useState(false);
  // State for filtering by date range
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  // State for filtering by department
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  // State for active tab (requests or report)
  const [activeTab, setActiveTab] = useState<'requests' | 'report'>('requests');
  // State for selected off-day request (for modals)
  const [selectedRequest, setSelectedRequest] = useState<OffDayRequest | null>(null);
  // State for showing approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  // State for approval action type (approve/decline)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'decline' | null>(null);
  // State for decline reason input
  const [declineReason, setDeclineReason] = useState('');

  // Filter off-day requests based on search term, status, and department
  const filteredRequests = mockOffDayRequests.filter(request => {
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
      filterStatus === 'pending' ? request.status === 'Pending' :
      filterStatus === 'official' ? request.type === 'Official Duty' :
      true;

    // Check if request matches department filter
    const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;

    // Return true only if all filter conditions match
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate statistics from all off-day requests
  const totalRequests = mockOffDayRequests.length;
  const approvedCount = mockOffDayRequests.filter(r => r.status === 'Approved').length;
  const declinedCount = mockOffDayRequests.filter(r => r.status === 'Declined').length;
  const pendingCount = mockOffDayRequests.filter(r => r.status === 'Pending').length;
  const officialDutyCount = mockOffDayRequests.filter(r => r.type === 'Official Duty').length;

  // Handler for approval/decline actions - opens approval modal
  const handleApprovalAction = (request: OffDayRequest, action: 'approve' | 'decline') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  // Handler for confirming approval/decline action
  const confirmApproval = () => {
    // In a real app, this would update the backend
    console.log(`${approvalAction} request ${selectedRequest?.id}`, declineReason);
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalAction(null);
    setDeclineReason('');
  };

  const renderRequestsTab = () => (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
              <Calendar className="w-5 h-5" style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Requests</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{totalRequests}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
              <Check className="w-5 h-5" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Approved</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{approvedCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef2f2' }}>
              <X className="w-5 h-5" style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Declined</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{declinedCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <Briefcase className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Official Duties</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{officialDutyCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="input-wrapper" style={{ width: 'auto', flex: 1, minWidth: '250px' }}>
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
            <div className="flex items-center gap-2">
              <button
                className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({totalRequests})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('approved')}
              >
                Approved ({approvedCount})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'declined' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('declined')}
              >
                Declined ({declinedCount})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'official' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('official')}
              >
                Official Duties ({officialDutyCount})
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-4 p-4 rounded" style={{ backgroundColor: '#f9fafb' }}>
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
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                  Date Range
                </label>
                <select 
                  className="input"
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Off Day Requests Table */}
      <div className="card">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3>Off Day Requests</h3>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              Showing {filteredRequests.length} of {totalRequests} requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button className="btn btn-sm btn-outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Staff ID</th>
                <th className="table-header-cell">Staff Name</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Branch</th>
                <th className="table-header-cell">Off Date</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Reason</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="table-row">
                  <td className="table-cell">
                    <span className="badge badge-secondary">{request.staffId}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p style={{ fontWeight: 500 }}>{request.staffName}</p>
                      <p className="text-xs text-muted">
                        Requested: {new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">{request.department}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-muted" />
                      <span className="text-xs">{request.branch}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span style={{ fontWeight: 500 }}>
                        {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${request.type === 'Official Duty' ? 'badge-info' : 'badge-secondary'}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className="table-cell" style={{ maxWidth: '200px' }}>
                    <p style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {request.reason}
                    </p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      request.status === 'Approved' ? 'badge-success' : 
                      request.status === 'Declined' ? 'badge-danger' : 
                      'badge-warning'
                    }`}>
                      {request.status}
                    </span>
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
                      <button className="btn btn-sm btn-outline">
                        <FileText className="w-3 h-3 mr-1" />
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center">
            <Sun className="w-12 h-12" style={{ color: '#e5e7eb' }} />
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>No off day requests found</p>
          </div>
        )}
      </div>
    </>
  );

  const renderReportTab = () => {
    const reportData = {
      totalDays: mockOffDayRequests.filter(r => r.status === 'Approved').length,
      regularDays: mockOffDayRequests.filter(r => r.status === 'Approved' && r.type === 'Regular').length,
      officialDuties: mockOffDayRequests.filter(r => r.status === 'Approved' && r.type === 'Official Duty').length,
      byDepartment: [
        { dept: 'IT Department', count: 2 },
        { dept: 'Finance', count: 1 },
        { dept: 'Marketing', count: 2 },
        { dept: 'Operations', count: 1 },
        { dept: 'Human Resources', count: 0 }
      ],
      monthlyTrend: [
        { month: 'Aug', count: 3 },
        { month: 'Sep', count: 5 },
        { month: 'Oct', count: 4 },
        { month: 'Nov', count: 6 }
      ]
    };

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
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Total Off Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{reportData.totalDays}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f0fdf4' }}>
                <Sun className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Regular Off Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{reportData.regularDays}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Official Duties</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{reportData.officialDuties}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper" style={{ backgroundColor: '#f3e8ff' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Approval Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {((approvedCount / totalRequests) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 style={{ marginBottom: '1rem' }}>Off Days by Department</h3>
            <div className="space-y-3">
              {reportData.byDepartment.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.dept}</span>
                    <span style={{ fontWeight: 600 }}>{item.count} days</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(item.count / Math.max(...reportData.byDepartment.map(d => d.count))) * 100}%`,
                        backgroundColor: '#2563eb'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 style={{ marginBottom: '1rem' }}>Monthly Trend</h3>
            <div className="space-y-3">
              {reportData.monthlyTrend.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.month} 2024</span>
                    <span style={{ fontWeight: 600 }}>{item.count} requests</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(item.count / Math.max(...reportData.monthlyTrend.map(d => d.count))) * 100}%`,
                        backgroundColor: '#16a34a'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Approvals */}
        <div className="card p-6">
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <h3>Recent Approvals</h3>
            <button className="btn btn-sm btn-outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
          <div className="space-y-3">
            {mockOffDayRequests
              .filter(r => r.status === 'Approved')
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}>
                      {request.staffName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, marginBottom: '0.125rem' }}>{request.staffName}</p>
                      <p className="text-xs text-muted">{request.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted">Off Date</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`badge ${request.type === 'Official Duty' ? 'badge-info' : 'badge-secondary'}`}>
                      {request.type}
                    </span>
                  </div>
                </div>
              ))}
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
            Off Day Requests
          </button>
          {/* Report Tab */}
          <button
            className={`tabs-trigger ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Off Report
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'requests' ? renderRequestsTab() : renderReportTab()}

      {/* Approval Modal - shown when showApprovalModal is true */}
      {showApprovalModal && selectedRequest && (
        <>
          {/* Modal overlay for backdrop */}
          <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}></div>
          {/* Modal dialog */}
          <div className="modal">
            {/* Modal header with title and close button */}
            <div className="modal-header">
              <h3>{approvalAction === 'approve' ? 'Approve' : 'Decline'} Off Day Request</h3>
              <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={() => setShowApprovalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal content */}
            <div className="modal-content">
              <div className="space-y-4">
                {/* Staff member information */}
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Staff Member</p>
                  <p style={{ fontWeight: 600 }}>{selectedRequest.staffName}</p>
                </div>
                {/* Off date information */}
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Off Date</p>
                  <p style={{ fontWeight: 600 }}>
                    {new Date(selectedRequest.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {/* Request type */}
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Type</p>
                  <span className={`badge ${selectedRequest.type === 'Official Duty' ? 'badge-info' : 'badge-secondary'}`}>
                    {selectedRequest.type}
                  </span>
                </div>
                {/* Reason for request */}
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Reason</p>
                  <p style={{ fontSize: '0.875rem' }}>{selectedRequest.reason}</p>
                </div>
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
                {selectedRequest.type === 'Official Duty' && approvalAction === 'approve' && (
                  <div className="p-3 rounded" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#2563eb', marginTop: '0.125rem', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                        This is an official duty request. The staff member will be marked as on permitted official duty for this date.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowApprovalModal(false)}>Cancel</button>
              <button 
                className={`btn ${approvalAction === 'approve' ? 'btn-primary' : 'btn-outline red'}`}
                onClick={confirmApproval}
                disabled={approvalAction === 'decline' && !declineReason.trim()}
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
    </div>
  );
}
