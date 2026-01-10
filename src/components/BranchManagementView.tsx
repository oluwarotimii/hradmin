// This component provides branch management functionality
// It allows adding and removing branches from the system

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import Lucide React icons for UI elements
import { Search, Calendar, Download, Filter, Building, Clock, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
// Import data functions from staffData module
import { getAttendanceData, getAttendanceMetrics } from '../data/staffData';
// Import branch management functions
import { getBranches, addBranch, removeBranch } from '../data/branchData';

// Interface defining the structure of attendance records
interface AttendanceRecord {
  id: string; // Unique staff identifier
  fullName: string; // Full name of the staff member
  department: string; // Department the staff belongs to
  branch?: string; // Branch location (optional)
  present: number; // Number of days present
  early: number; // Number of early arrivals
  late: number; // Number of late arrivals
  permitted: number; // Number of permitted absences
  absent: number; // Number of unexcused absences
  offDays: number; // Number of off days
  leaveDays: number; // Number of leave days
  averageTime: string; // Average working time
}

// Main component function for branch management view
export function BranchManagementView() {
  // State for search term input
  const [searchTerm, setSearchTerm] = useState('');
  // State for selected branch filter
  const [selectedBranch, setSelectedBranch] = useState('all');
  // State for date range filter
  const [dateRange, setDateRange] = useState('month');
  // State for status filter (all, early, late, absent)
  const [filterStatus, setFilterStatus] = useState<'all' | 'early' | 'late' | 'absent'>('all');
  // State for showing/hiding filter panel
  const [showFilters, setShowFilters] = useState(false);
  // State for branches list
  const [branches, setBranchesState] = useState<string[]>(getBranches());
  // State for new branch name input
  const [newBranchName, setNewBranchName] = useState('');

  // Effect to sync branches with persisted data on component mount
  useEffect(() => {
    setBranchesState(getBranches()); // Update branches from storage
  }, []);

  // Get attendance data for calculations
  const mockAttendanceData: AttendanceRecord[] = getAttendanceData();
  // Get attendance metrics
  const metrics = getAttendanceMetrics();

  // Calculate active branches from attendance records or fall back to branch list
  const attendanceBranchSet = new Set<string>(mockAttendanceData.map(r => (r.branch ? r.branch : '')).filter(Boolean));
  const computedActiveBranches = attendanceBranchSet.size > 0 ? attendanceBranchSet.size : branches.length;

  // Filter attendance data based on search, status, and branch filters
  const filteredData = mockAttendanceData.filter(record => {
    // Check if record matches search term (name, department, or ID)
    const matchesSearch = searchTerm === '' ||
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if record matches status filter
    const matchesFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'early' ? record.early > record.late :
      filterStatus === 'late' ? record.late > 0 :
      record.absent > 0;

    // Check if record matches branch filter
    const matchesBranch = selectedBranch === 'all' ? true : (record.branch === selectedBranch);

    // Return true only if all conditions match
    return matchesSearch && matchesFilter && matchesBranch;
  });

  // Calculate totals from filtered data
  const totalPresent = filteredData.reduce((sum, r) => sum + r.present, 0);
  const totalEarly = filteredData.reduce((sum, r) => sum + r.early, 0);
  const totalLate = filteredData.reduce((sum, r) => sum + r.late, 0);
  const totalAbsent = filteredData.reduce((sum, r) => sum + r.absent, 0);

  // Handler for adding a new branch
  const handleAddBranch = () => {
    if (newBranchName.trim() && !branches.includes(newBranchName.trim())) {
      const updatedBranches = [...branches, newBranchName.trim()]; // Add to local state
      setBranchesState(updatedBranches); // Update state
      addBranch(newBranchName.trim()); // Persist to storage
      setNewBranchName(''); // Clear input
    }
  };

  // Handler for removing a branch
  const handleRemoveBranch = (branchToRemove: string) => {
    const updatedBranches = branches.filter(b => b !== branchToRemove); // Remove from local state
    setBranchesState(updatedBranches); // Update state
    removeBranch(branchToRemove); // Remove from storage
    if (selectedBranch === branchToRemove) {
      setSelectedBranch('all'); // Reset filter if current branch is removed
    }
  };

  // Main render return
  return (
    <div className="space-y-6">
      {/* Branch Management Section */}
      <div className="card">
        <div className="p-6 border-b">
          <h3>Branch Management</h3>
          <p className="text-muted">Add or remove branches from the system</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Add Branch Input Section */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter branch name..."
              className="input"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddBranch(); // Add branch on Enter key
                }
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddBranch}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </button>
          </div>

          {/* Branch List Display */}
          <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
            {branches.map((branch) => (
              <div key={branch} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5" style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 500 }}>{branch}</span>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleRemoveBranch(branch)}
                  title="Remove branch"
                >
                  <X className="w-4 h-4" style={{ color: '#dc2626' }} />
                </button>
              </div>
            ))}
          </div>
          {/* Empty State */}
          {branches.length === 0 && (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto" style={{ color: '#e5e7eb' }} />
              <p className="text-muted mt-2">No branches available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
