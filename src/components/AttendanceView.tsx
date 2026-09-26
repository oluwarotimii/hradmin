// src/components/AttendanceView.tsx
// Admin-focused Attendance Management with List View and Check-in Tracking

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getAllAttendanceRecords,
  getAttendanceSummary,
  markAttendanceCheckIn,
  markAttendanceCheckOut,
  createManualAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getStaffAttendanceData,
  getFlaggedAttendanceRecords,
  correctHistoricalAttendance,
  correctHistoricalLateAttendance,
  AttendanceRecord,
  AttendanceRecordsResponse,
  AttendanceCorrectionResult,
  StaffAttendanceSummaryRow
} from '../services/attendanceService';
import { getAllStaff } from '../services/staffManagementService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import ProcessAttendanceModal from './ProcessAttendanceModal';
import { AutoMarkSettingsModal } from './AutoMarkSettingsModal';
import { getLockStatus } from '../services/attendanceSettingsService';
import { useAuth } from '../AuthContext';
import { Pagination } from './Pagination';
import { OverflowMenu } from './OverflowMenu';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
// Calendar view temporarily disabled - focusing on list view functionality
// import AttendanceCalendarWrapper from './AttendanceCalendarWrapper';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Download,
  Plus, Edit3, Trash2, TrendingUp, TrendingDown, RefreshCw,
  RotateCcw, Lock, Wrench
} from 'lucide-react';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department?: string;
  branch_id?: number;
  userId?: number;
  full_name?: string;
  work_email?: string;
  employee_id?: string;
}

interface AttendanceWithStaff extends AttendanceRecord {
  staff_name?: string;
  staff_email?: string;
  department?: string;
  branch_name?: string;
}

const AttendanceView = () => {
  const { hasPermission } = useAuth();
  const colSpanCount = 7 + (hasPermission('attendance:manage') ? 1 : 0);
  // Calendar view temporarily disabled
  const [activeView, setActiveView] = useState<'list'>('list');
  // const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state — rawRecords holds the API response as-is; attendanceRecords (below,
  // via useMemo) re-enriches it with staff/branch info whenever any of the three
  // change, so enrichment never depends on fetch ordering between them.
  const [rawRecords, setRawRecords] = useState<AttendanceRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showToolbarMenu, setShowToolbarMenu] = useState(false);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<AttendanceWithStaff | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<AttendanceRecordsResponse['pagination'] | undefined>();

  // Modal state
  const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceWithStaff | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [exportLoading, setExportLoading] = useState(false);

  // Manual attendance form
  const [manualForm, setManualForm] = useState({
    user_id: 0,
    date: new Date().toISOString().split('T')[0],
    check_in_time: '09:00:00',
    check_out_time: '17:00:00',
    status: 'present' as 'present' | 'late' | 'half_day',
    notes: '',
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    status: 'present',
    check_in_time: '',
    check_out_time: '',
    notes: '',
  });
  const [editOverrideNeeded, setEditOverrideNeeded] = useState<string | null>(null);
  const [editOverrideReason, setEditOverrideReason] = useState('');

  // Flagged records (present/late/half_day on a closed/holiday day) — monitoring view
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [flaggedRecords, setFlaggedRecords] = useState<any[]>([]);
  const [flaggedTotal, setFlaggedTotal] = useState(0);

  // Summary state (for date range, not paginated page)
  const [summaryPresent, setSummaryPresent] = useState(0);
  const [summaryLate, setSummaryLate] = useState(0);
  const [summaryAbsent, setSummaryAbsent] = useState(0);

  // Auto-Mark settings state
  const [showAutoMarkModal, setShowAutoMarkModal] = useState(false);
  const [lockStatus, setLockStatus] = useState<any>(null);
  const [selectedBranchForAutoMark, setSelectedBranchForAutoMark] = useState<number | ''>('');

  // Historical "absent" correction tool state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionMode, setCorrectionMode] = useState<'absent' | 'late'>('absent');
  const [correctionStart, setCorrectionStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0]);
  const [correctionEnd, setCorrectionEnd] = useState(new Date().toISOString().split('T')[0]);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionPreview, setCorrectionPreview] = useState<AttendanceCorrectionResult | null>(null);
  const [correctionApplied, setCorrectionApplied] = useState(false);

  // Staff and branches barely change — load them once, not on every page/filter
  // change (this used to re-fetch all 1000+ staff and every branch on every
  // pagination click, which was pure wasted work).
  useEffect(() => {
    loadStaticData();
  }, []);

  const loadStaticData = async () => {
    try {
      const [staffRes, branchesRes] = await Promise.all([
        getAllStaff(1, 1000),
        getAllBranches(),
      ]);

      if (staffRes.success && staffRes.staff) {
        const mapped = staffRes.staff.map((s: any) => {
          const firstName = s.firstName || s.first_name || '';
          const lastName = s.lastName || s.last_name || '';
          const middleName = s.middleName || s.middle_name || '';
          const fullName = s.full_name || [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

          return {
            id: s.id,
            userId: Number(s.user_id || s.userId || s.id),
            name: fullName || s.name || 'Unknown',
            email: s.work_email || s.email,
            department: s.department,
            branch_id: s.branch_id || s.branchId,
            full_name: fullName,
            employee_id: s.employee_id || s.employeeId
          };
        });
        setStaffMembers(mapped);
      }

      if (branchesRes.success && branchesRes.branches) {
        setBranches(branchesRes.branches);
      }
    } catch (err) {
      console.error('Failed to load staff/branches:', err);
    }
  };

  // Load data
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  // Reset to page 1 when server-side filters change (date range, status — the
  // only filters the backend actually supports). Search/Branch/Department stay
  // client-side below, so they don't need a refetch.
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadData();
    }
  }, [dateRange.start, dateRange.end, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [attendanceRes, summaryRes] = await Promise.all([
        getAllAttendanceRecords(
          currentPage,
          pageSize,
          undefined,
          dateRange.start,
          dateRange.end,
          selectedStatus !== 'all' ? selectedStatus : undefined
        ),
        getAttendanceSummary(dateRange.start, dateRange.end)
      ]);

      if (summaryRes.success && summaryRes.summary) {
        setSummaryPresent(summaryRes.summary.total_present || 0);
        setSummaryLate(summaryRes.summary.total_late || 0);
        setSummaryAbsent(summaryRes.summary.total_absent || 0);
      }

      if (attendanceRes.success && attendanceRes.records) {
        if (attendanceRes.pagination) {
          const apiPagination = attendanceRes.pagination as any;
          const paginationData = {
            currentPage: apiPagination.current_page || apiPagination.currentPage || 1,
            pageSize: apiPagination.per_page || apiPagination.pageSize || 20,
            totalItems: apiPagination.total_records || apiPagination.totalItems || 0,
            totalPages: apiPagination.total_pages || apiPagination.totalPages || 0,
            itemsPerPage: apiPagination.per_page || apiPagination.pageSize || 20
          };

          setPagination(paginationData);
          setTotalRecords(paginationData.totalItems);
          setTotalPages(paginationData.totalPages);
        }

        setRawRecords(attendanceRes.records);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual attendance
  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createManualAttendance({
        date: manualForm.date,
        check_in_time: manualForm.check_in_time,
        check_out_time: manualForm.check_out_time,
        status: manualForm.status,
        location_coordinates: { longitude: 0, latitude: 0 },
        location_address: 'Manual entry',
      });

      if (response.success) {
        setSuccessMessage('Manual attendance recorded successfully');
        setShowManualAttendanceModal(false);
        resetManualForm();
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to record attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setLoading(true);
    try {
      const payload: any = { ...editForm };
      if (editOverrideNeeded) {
        payload.override_non_working_day = true;
        payload.override_reason = editOverrideReason;
      }
      const response = await updateAttendanceRecord(selectedRecord.id, payload);
      if (response.success) {
        setSuccessMessage('Attendance record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        setEditOverrideNeeded(null);
        setEditOverrideReason('');
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (response.requires_override) {
        setEditOverrideNeeded(response.message || 'This date is non-working. Provide a reason to override.');
      } else {
        setError(response.message || 'Failed to update attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const resetManualForm = () => {
    setManualForm({
      user_id: 0,
      date: new Date().toISOString().split('T')[0],
      check_in_time: '09:00:00',
      check_out_time: '17:00:00',
      status: 'present',
      notes: '',
    });
  };

  const loadFlaggedRecords = async () => {
    setFlaggedLoading(true);
    try {
      const response = await getFlaggedAttendanceRecords(1, 100);
      if (response.success) {
        setFlaggedRecords(response.records || []);
        setFlaggedTotal(response.pagination?.total_records || (response.records || []).length);
      } else {
        toast.error(response.message || 'Failed to load flagged records');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load flagged records');
    } finally {
      setFlaggedLoading(false);
    }
  };

  const openFlaggedModal = () => {
    setShowFlaggedModal(true);
    loadFlaggedRecords();
  };

  const openEditModal = (record: AttendanceWithStaff) => {
    setSelectedRecord(record);
    setEditForm({
      status: record.status,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      notes: record.notes || '',
    });
    setEditOverrideNeeded(null);
    setEditOverrideReason('');
    setShowEditModal(true);
  };

  const openDeleteModal = (record: AttendanceWithStaff) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  // Export to CSV
  const exportToCSV = async (exportAll = false, customDateRange?: { start: string; end: string }) => {
    setLoading(true);
    try {
      // If exporting all or custom range, fetch all data first
      let dataToExport: AttendanceWithStaff[] = [];
      
      if (exportAll || customDateRange) {
        // Fetch all records for the date range
        const startDate = customDateRange?.start || dateRange.start;
        const endDate = customDateRange?.end || dateRange.end;
        
        console.log('📥 Fetching all records for export:', { startDate, endDate });
        
        // Fetch in batches to avoid memory issues
        const batchSize = 100;
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await getAllAttendanceRecords(page, batchSize, undefined, startDate, endDate);
          if (response.success && response.records) {
            // Enrich with staff info
            const enriched = response.records.map((record: AttendanceRecord) => {
              const staff = staffMembers.find((s: StaffMember) => s.userId === record.user_id);
              const branch = branches.find((b: Branch) => Number(b.id) === Number(staff?.branch_id));
              return {
                ...record,
                staff_name: staff?.full_name || staff?.name || 'Unknown',
                staff_email: staff?.email || staff?.work_email,
                employee_id: staff?.employee_id,
                department: staff?.department,
                branch_name: branch?.name
              };
            });
            dataToExport.push(...enriched);
            
            const apiPagination = response.pagination as any;
            if (page >= (apiPagination?.total_pages || apiPagination?.totalPages || 0)) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
        
        console.log(`📊 Exporting ${dataToExport.length} records`);
      } else {
        // Export current filtered records
        dataToExport = filteredRecords;
      }

      // Apply filters
      if (selectedBranch) {
        dataToExport = dataToExport.filter(r => r.branch_id === selectedBranch);
      }
      if (selectedStatus !== 'all') {
        dataToExport = dataToExport.filter(r => r.status === selectedStatus);
      }
      if (selectedDepartment) {
        dataToExport = dataToExport.filter(r => r.department === selectedDepartment);
      }

      const headers = ['Employee', 'Email', 'Employee ID', 'Date', 'Check-in', 'Check-out', 'Hours Worked', 'Status', 'Branch', 'Department'];
      const rows = dataToExport.map(r => [
        r.staff_name || `User ${r.user_id}`,
        r.staff_email || '',
        r.employee_id || '-',
        new Date(r.date).toLocaleDateString(),
        r.check_in_time || '-',
        r.check_out_time || '-',
        r.actual_working_hours ? Number(r.actual_working_hours).toFixed(2) : '-',
        r.status,
        r.branch_name || '-',
        r.department || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = customDateRange 
        ? `${customDateRange.start}_to_${customDateRange.end}`
        : `${dateRange.start}_to_${dateRange.end}`;
      a.download = `attendance_report_${dateStr}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`Exported ${dataToExport.length} records successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Export error:', err);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const escapeCsv = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportAttendanceSummaryCSV = async (customDateRange?: { start: string; end: string }) => {
    setLoading(true);
    try {
      const startDate = customDateRange?.start || dateRange.start;
      const endDate = customDateRange?.end || dateRange.end;
      const response = await getStaffAttendanceData(startDate, endDate);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch staff attendance summary');
      }

      const summaryRows: StaffAttendanceSummaryRow[] = response.data.map((row: any) => {
        const totalDays = Number(row.total_days ?? row.totalDays ?? 0);
        const presentDays = Number(row.present_count ?? row.present ?? 0);
        const lateDays = Number(row.late_count ?? row.late ?? 0);
        const earlyDepartures = Number(row.early_count ?? row.early ?? 0);
        const absentDays = Number(row.absent_count ?? row.absent ?? 0);
        const leaveDays = Number(row.leave_count ?? row.leaveDays ?? 0);
        const holidayDays = Number(row.holiday_count ?? row.offDays ?? 0);
        const attendancePercentage = Number(row.attendance_percentage ?? row.attendancePercentage ?? 0);
        const latePercentage = Number(row.late_percentage ?? row.latePercentage ?? 0);
        const earlyPercentage = Number(row.early_percentage ?? row.earlyPercentage ?? 0);

        return {
          employee: row.full_name || row.fullName || 'Unknown',
          email: row.email || row.staff_email || '',
          employeeId: row.employee_id || row.employeeId || '',
          department: row.department || '',
          branch: row.branch || '',
          totalDays,
          presentDays,
          lateDays,
          earlyDepartures,
          absentDays,
          leaveDays,
          holidayDays,
          attendancePercentage,
          latePercentage,
          earlyPercentage,
        };
      });

      const headers = [
        'Employee',
        'Email',
        'Employee ID',
        'Department',
        'Branch',
        'Total Days',
        'Present Days',
        'Late Days',
        'Early Departures',
        'Absent Days',
        'Leave Days',
        'Holiday Days',
        'Attendance %',
        'Late %',
        'Early %',
      ];

      const rows = summaryRows.map((row) => [
        row.employee,
        row.email,
        row.employeeId,
        row.department,
        row.branch,
        row.totalDays,
        row.presentDays,
        row.lateDays,
        row.earlyDepartures,
        row.absentDays,
        row.leaveDays,
        row.holidayDays,
        row.attendancePercentage.toFixed(2),
        row.latePercentage.toFixed(2),
        row.earlyPercentage.toFixed(2),
      ]);

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map((row) => row.map(escapeCsv).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = customDateRange
        ? `${customDateRange.start}_to_${customDateRange.end}`
        : `${dateRange.start}_to_${dateRange.end}`;
      a.download = `attendance_summary_${dateStr}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Exported summary for ${summaryRows.length} staff member(s)`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Summary export error:', err);
      setError(err.message || 'Failed to export attendance summary');
    } finally {
      setLoading(false);
    }
  };

  // Export with custom date range
  const handleExportWithRange = () => {
    setShowExportModal(true);
  };

  // View record details
  const openDetailsModal = (record: AttendanceWithStaff) => {
    setViewingRecord(record);
    setShowDetailsModal(true);
  };

  const handleDeleteAttendance = async () => {
    if (!selectedRecord) return;

    setDeleteLoading(true);
    try {
      const response = await deleteAttendanceRecord(selectedRecord.id);
      if (response.success) {
        setSuccessMessage('Attendance record deleted successfully');
        setShowDeleteModal(false);
        setSelectedRecord(null);
        loadData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to delete attendance');
        setShowDeleteModal(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete attendance');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Re-enrich records with staff/branch info whenever any of the three change —
  // decoupled from the fetch itself so it's always correct regardless of which
  // of rawRecords/staffMembers/branches finished loading first.
  const attendanceRecords: AttendanceWithStaff[] = useMemo(() => {
    return rawRecords.map((record) => {
      const staff = staffMembers.find((s) => s.userId === record.user_id);
      const branch = branches.find((b) => Number(b.id) === Number(staff?.branch_id));
      return {
        ...record,
        staff_name: staff?.full_name || staff?.name || 'Unknown',
        staff_email: staff?.email,
        employee_id: staff?.employee_id,
        department: staff?.department,
        branch_name: branch?.name,
      };
    });
  }, [rawRecords, staffMembers, branches]);

  // Search/Branch/Department aren't supported as server-side filters by the
  // attendance API, so they only narrow down the records already on this page
  // (date range and status ARE applied server-side in loadData, covering the
  // full dataset). "More Filters" panel explains this scope to the admin.
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.staff_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedBranch || record.branch_name === (branches.find(b => Number(b.id) === Number(selectedBranch))?.name);

    const matchesDepartment = !selectedDepartment || record.department === selectedDepartment;

    return matchesSearch && matchesBranch && matchesDepartment;
  });

  // Calculate statistics from date-range summary (not paginated page)
  const summaryTotal = summaryPresent + summaryLate + summaryAbsent;
  const attendanceRate = summaryTotal > 0 ? Math.round((summaryPresent / summaryTotal) * 100) : 0;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay, year, month };
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" style={{ flex: '1 1 260px', minWidth: '200px' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input"
              placeholder="Search by name, email, department…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide' : 'More'} Filters
          </button>
          {hasPermission('attendance:manage') && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setShowProcessModal(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Attendance
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowManualAttendanceModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Manual Entry
              </button>
            </>
          )}
          <button
            className="btn btn-outline btn-icon"
            onClick={loadData}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <OverflowMenu
            label="More Actions"
            open={showToolbarMenu}
            onToggle={() => setShowToolbarMenu(v => !v)}
            onClose={() => setShowToolbarMenu(false)}
            items={[
              { label: 'Flagged Records', icon: AlertCircle, onClick: openFlaggedModal },
              {
                label: 'Auto-Mark Settings', icon: Lock, onClick: () => {
                  const branchId = selectedBranch ? Number(selectedBranch) : (branches[0]?.id ? Number(branches[0].id) : 0);
                  if (branchId === 0) {
                    toast.error('Please select a branch first or ensure branches are loaded');
                    return;
                  }
                  setSelectedBranchForAutoMark(branchId);
                  setShowAutoMarkModal(true);
                },
              },
              { label: 'Export Detailed Report', icon: Download, onClick: handleExportWithRange },
              { label: 'Export Summary CSV', icon: Download, onClick: () => exportAttendanceSummaryCSV() },
              {
                label: 'Correct Historical Errors', icon: Wrench, onClick: () => {
                  setCorrectionPreview(null);
                  setCorrectionApplied(false);
                  setShowCorrectionModal(true);
                },
              },
            ]}
          />
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5'}`}>
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="date"
                  className="input w-full"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="date"
                  className="input w-full"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <select
                  className="input w-full"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : ('' as ''))}
                >
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="input w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  className="input w-full"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {Array.from(new Set(staffMembers.map(s => s.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBranch('' as '');
                  setSelectedStatus('all');
                  setSelectedDepartment('');
                }}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Clear All
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setCurrentPage(1);
                  loadData();
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary strip — Present/Late/Absent/Rate as one compact row instead of
          three separate padded cards plus a whole extra "Attendance Rate" card
          duplicating the same numbers underneath. */}
      <div className="card" style={{ padding: '0.875rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Present</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{summaryPresent}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
          <Clock className="w-4 h-4" style={{ color: '#ca8a04', flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Late</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{summaryLate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
          <XCircle className="w-4 h-4" style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Absent</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{summaryAbsent}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
          {attendanceRate >= 90 ? (
            <TrendingUp className="w-4 h-4 text-green-600" style={{ flexShrink: 0 }} />
          ) : attendanceRate >= 70 ? (
            <TrendingDown className="w-4 h-4 text-yellow-600" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" style={{ flexShrink: 0 }} />
          )}
          <div>
            <p className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>Attendance Rate</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3, color: attendanceRate >= 90 ? '#16a34a' : attendanceRate >= 70 ? '#ca8a04' : '#dc2626' }}>
              {attendanceRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Attendance Records</h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            {dateRange.start} to {dateRange.end}
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalRecords}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          itemLabel="records"
        />
        <div className="overflow-x-auto">
          <table className="table min-w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell whitespace-nowrap">Employee</th>
                <th className="table-header-cell whitespace-nowrap">Date</th>
                <th className="table-header-cell whitespace-nowrap">Check-in</th>
                <th className="table-header-cell whitespace-nowrap">Check-out</th>
                <th className="table-header-cell whitespace-nowrap">Hours Worked</th>
                <th className="table-header-cell whitespace-nowrap">Status</th>
                <th className="table-header-cell whitespace-nowrap">Branch</th>
                {hasPermission('attendance:manage') && (
                  <th className="table-header-cell right whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpanCount} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={colSpanCount} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No attendance records found</p>
                    <p className="text-gray-400 text-sm">Adjust filters to see records</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar name={record.staff_name || `User ${record.user_id}`} size={32} />
                        <div>
                          <p style={{ fontWeight: 500 }}>{record.staff_name || `User ${record.user_id}`}</p>
                          <p className="text-xs text-muted">{record.staff_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm">{new Date(record.date).toLocaleDateString()}</span>
                    </td>
                    <td className="table-cell">
                      {record.check_in_time ? (
                        <span className="badge badge-secondary">{record.check_in_time.substring(0, 5)}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.check_out_time ? (
                        <span className="badge badge-secondary">{record.check_out_time.substring(0, 5)}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.actual_working_hours ? (
                        <span style={{ fontWeight: 500 }}>{Number(record.actual_working_hours).toFixed(2)}h</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <StatusBadge
                        label={record.status}
                        tone={
                          record.status === 'present' ? 'success' :
                          record.status === 'late' ? 'warning' :
                          record.status === 'absent' ? 'danger' :
                          'neutral'
                        }
                      />
                    </td>
                    <td className="table-cell">
                      <span className="text-sm">{record.branch_name || '-'}</span>
                    </td>
                    {hasPermission('attendance:manage') && (
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailsModal(record)}
                            className="btn btn-sm btn-outline"
                            title="View details"
                          >
                            <Search className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(record)}
                            className="btn btn-sm btn-outline green"
                            title="Edit record"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(record)}
                            className="btn btn-sm btn-outline red"
                            title="Delete record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCalendarView = () => {
    return <div className="p-8 text-center text-gray-500">Calendar view is temporarily disabled.</div>;
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Track and manage employee attendance records</p>
      </div> */}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Content */}
      {activeView === 'list' ? renderListView() : renderCalendarView()}

      {/* Manual Attendance Modal */}
      {showManualAttendanceModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowManualAttendanceModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Manual Attendance Entry</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowManualAttendanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleManualAttendance}>
              <div className="modal-content space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee *</label>
                  <select
                    className="input w-full"
                    value={manualForm.user_id || ''}
                    onChange={(e) => setManualForm({ ...manualForm, user_id: Number(e.target.value) })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={manualForm.check_in_time}
                      onChange={(e) => setManualForm({ ...manualForm, check_in_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Time *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={manualForm.check_out_time}
                      onChange={(e) => setManualForm({ ...manualForm, check_out_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    className="input w-full"
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    placeholder="Reason for manual entry..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowManualAttendanceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Export Attendance Report</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${exportFormat === 'csv' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setExportFormat('csv')}
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${exportFormat === 'excel' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setExportFormat('excel')}
                    disabled
                    title="Coming soon"
                  >
                    Excel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${exportFormat === 'pdf' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setExportFormat('pdf')}
                    disabled
                    title="Coming soon"
                  >
                    PDF
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date Range *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted">From:</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={exportDateRange.start}
                      onChange={(e) => setExportDateRange({ ...exportDateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">To:</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={exportDateRange.end}
                      onChange={(e) => setExportDateRange({ ...exportDateRange, end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                      const today = new Date();
                      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                      const todayStr = today.toISOString().split('T')[0];
                      setExportDateRange({ start: monthStart, end: todayStr });
                    }}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                      const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                      setExportDateRange({ start: lastMonth, end: monthEnd });
                    }}
                  >
                    Last Month
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                      const today = new Date();
                      const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                      const todayStr = today.toISOString().split('T')[0];
                      setExportDateRange({ start: yearStart, end: todayStr });
                    }}
                  >
                    This Year
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> The export will include all attendance records in the selected date range, 
                  including employee details, check-in/out times, hours worked, and status.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  exportToCSV(true, exportDateRange);
                  setShowExportModal(false);
                }}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Correct Historical Errors Modal — dry-run preview, then explicit apply */}
      {showCorrectionModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCorrectionModal(false)}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header">
              <h3>Correct Historical Attendance Errors</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCorrectionModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              <div className="flex gap-2">
                <button
                  className={`btn btn-sm ${correctionMode === 'absent' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => { setCorrectionMode('absent'); setCorrectionPreview(null); setCorrectionApplied(false); }}
                >
                  Wrongly marked Absent
                </button>
                <button
                  className={`btn btn-sm ${correctionMode === 'late' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => { setCorrectionMode('late'); setCorrectionPreview(null); setCorrectionApplied(false); }}
                >
                  Wrongly marked Late
                </button>
              </div>
              <p className="text-sm text-muted">
                {correctionMode === 'absent' ? (
                  <>Scans records currently marked <strong>Absent</strong> with no check-in in the date range below,
                  re-checks each one against the current (fixed) schedule logic, and corrects any that should
                  actually be Weekend, Off, Leave, or Holiday. Records with a real check-in are never touched.</>
                ) : (
                  <>Scans records currently marked <strong>Late</strong> or <strong>Early Departure</strong> that DO have
                  a real check-in, and if that day wasn't actually a scheduled working day (weekend, off, leave, or
                  holiday), clears the unfair penalty and credits it as <strong>Present</strong>. The check-in itself
                  is never touched or removed — only the incorrect judgment around it.</>
                )}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <input type="date" className="input w-full" value={correctionStart}
                    onChange={(e) => { setCorrectionStart(e.target.value); setCorrectionPreview(null); setCorrectionApplied(false); }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <input type="date" className="input w-full" value={correctionEnd}
                    onChange={(e) => { setCorrectionEnd(e.target.value); setCorrectionPreview(null); setCorrectionApplied(false); }} />
                </div>
              </div>

              {correctionPreview && (
                <div className={`p-3 rounded-lg border ${correctionApplied ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <p className="text-sm font-medium">
                    {correctionApplied
                      ? `Applied: ${correctionPreview.corrected} of ${correctionPreview.totalChecked} ${correctionMode === 'absent' ? 'absent' : "late/early-departure"} records corrected.`
                      : `Preview: ${correctionPreview.corrected} of ${correctionPreview.totalChecked} ${correctionMode === 'absent' ? 'absent' : "late/early-departure"} records would be corrected.`}
                  </p>
                  {correctionPreview.changes.length > 0 && (
                    <div style={{ maxHeight: '14rem', overflowY: 'auto', marginTop: '0.5rem' }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-muted border-b">
                            <th className="py-1">Staff</th>
                            <th className="py-1">Date</th>
                            <th className="py-1">From</th>
                            <th className="py-1">To</th>
                          </tr>
                        </thead>
                        <tbody>
                          {correctionPreview.changes.map((c, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-1">{c.userName}</td>
                              <td className="py-1">{c.date}</td>
                              <td className="py-1">{c.from}</td>
                              <td className="py-1">{c.to}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {correctionPreview.corrected > correctionPreview.changes.length && (
                        <p className="text-xs text-muted mt-1">…and {correctionPreview.corrected - correctionPreview.changes.length} more not shown.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowCorrectionModal(false)}>Close</button>
              <button
                className="btn btn-outline"
                disabled={correctionLoading}
                onClick={async () => {
                  setCorrectionLoading(true);
                  setCorrectionApplied(false);
                  const fn = correctionMode === 'absent' ? correctHistoricalAttendance : correctHistoricalLateAttendance;
                  const res = await fn(correctionStart, correctionEnd, true);
                  setCorrectionLoading(false);
                  if (res.success && res.data) {
                    setCorrectionPreview(res.data);
                  } else {
                    toast.error(res.message || 'Failed to preview corrections');
                  }
                }}
              >
                {correctionLoading ? 'Checking…' : 'Preview'}
              </button>
              <button
                className="btn btn-primary"
                disabled={correctionLoading || !correctionPreview || correctionPreview.corrected === 0 || correctionApplied}
                onClick={async () => {
                  if (!window.confirm(`This will update ${correctionPreview?.corrected} attendance record(s) in the database. This cannot be undone. Continue?`)) return;
                  setCorrectionLoading(true);
                  const fn = correctionMode === 'absent' ? correctHistoricalAttendance : correctHistoricalLateAttendance;
                  const res = await fn(correctionStart, correctionEnd, false);
                  setCorrectionLoading(false);
                  if (res.success && res.data) {
                    setCorrectionPreview(res.data);
                    setCorrectionApplied(true);
                    toast.success(res.message || 'Corrections applied');
                    loadData();
                  } else {
                    toast.error(res.message || 'Failed to apply corrections');
                  }
                }}
              >
                {correctionLoading ? 'Applying…' : 'Apply Corrections'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Flagged Records Modal — monitoring view for present/late/half_day marked on a closed or holiday day */}
      {showFlaggedModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowFlaggedModal(false)}></div>
          <div className="modal" style={{ maxWidth: '56rem' }}>
            <div className="modal-header">
              <h3>Flagged Records</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowFlaggedModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-3">
              <p className="text-sm text-muted">
                Records marked present, late, half day, or early departure on a date the staff
                member's branch was closed, or on a holiday. {flaggedTotal > 0 && `(${flaggedTotal} found)`}
              </p>
              {flaggedLoading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : flaggedRecords.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">No flagged records found.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '24rem', overflowY: 'auto' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted border-b">
                        <th className="py-2 pr-2">Staff</th>
                        <th className="py-2 pr-2">Branch</th>
                        <th className="py-2 pr-2">Date</th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2 pr-2">Reason Flagged</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedRecords.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 pr-2">{r.full_name || r.employee_id || r.user_id}</td>
                          <td className="py-2 pr-2">{r.branch_name || '—'}</td>
                          <td className="py-2 pr-2">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="py-2 pr-2 capitalize">{r.status}</td>
                          <td className="py-2 pr-2">{r.holiday_name ? `Holiday: ${r.holiday_name}` : 'Branch closed'}</td>
                          <td className="py-2">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setShowFlaggedModal(false);
                                openEditModal({
                                  id: r.id,
                                  user_id: r.user_id,
                                  date: r.date,
                                  status: r.status,
                                  check_in_time: r.check_in_time,
                                  check_out_time: r.check_out_time,
                                  notes: r.notes,
                                  staff_name: r.full_name,
                                  branch_name: r.branch_name
                                } as AttendanceWithStaff);
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={loadFlaggedRecords} disabled={flaggedLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setShowFlaggedModal(false)}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* Edit Attendance Modal */}
      {showEditModal && selectedRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>
          <div className="modal" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3>Edit Attendance Record</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateAttendance}>
              <div className="modal-content space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{selectedRecord.staff_name}</p>
                  <p className="text-xs text-muted">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    className="input w-full"
                    value={editForm.status}
                    onChange={(e) => {
                      setEditForm({ ...editForm, status: e.target.value });
                      setEditOverrideNeeded(null);
                      setEditOverrideReason('');
                    }}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                    <option value="holiday">Holiday</option>
                    <option value="weekend">Weekend</option>
                    <option value="off">Off Day</option>
                  </select>
                </div>
                {editOverrideNeeded && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <p className="text-sm text-amber-800">{editOverrideNeeded}</p>
                      <label className="block text-xs font-medium mt-2 mb-1 text-amber-900">Reason for override *</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={editOverrideReason}
                        onChange={(e) => setEditOverrideReason(e.target.value)}
                        placeholder="e.g. Staff genuinely worked this day"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={editForm.check_in_time}
                      onChange={(e) => setEditForm({ ...editForm, check_in_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Time</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={editForm.check_out_time}
                      onChange={(e) => setEditForm({ ...editForm, check_out_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Add notes..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || (!!editOverrideNeeded && !editOverrideReason.trim())}
                >
                  {loading ? 'Saving...' : editOverrideNeeded ? 'Confirm Override & Save' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal" style={{ maxWidth: '28rem' }}>
            <div className="modal-header">
              <h3>Delete Attendance Record</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Warning: This action cannot be undone</p>
                  <p className="text-xs text-red-700 mt-1">Are you sure you want to delete this attendance record?</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedRecord.staff_name}</p>
                <p className="text-xs text-muted">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted mt-1">Status: <span className="font-medium">{selectedRecord.status}</span></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDeleteAttendance}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Process Attendance Modal */}
      <ProcessAttendanceModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onSuccess={loadData}
      />

      {/* View Record Details Modal */}
      {showDetailsModal && viewingRecord && (
        <>
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
          <div className="modal" style={{ maxWidth: '36rem' }}>
            <div className="modal-header">
              <h3>Attendance Record Details</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-content space-y-4">
              {/* Employee Info Card */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {viewingRecord.staff_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{viewingRecord.staff_name || `User ${viewingRecord.user_id}`}</p>
                    <p className="text-sm text-blue-700">{viewingRecord.staff_email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-blue-600">Department:</span>
                    <span className="ml-2 font-medium">{viewingRecord.department || '-'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Branch:</span>
                    <span className="ml-2 font-medium">{viewingRecord.branch_name || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">{new Date(viewingRecord.date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className={`badge ${
                    viewingRecord.status === 'present' ? 'badge-success' :
                    viewingRecord.status === 'late' ? 'badge-warning' :
                    viewingRecord.status === 'absent' ? 'badge-error' :
                    'badge-secondary'
                  }`}>
                    {viewingRecord.status}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Check-in Time</p>
                  <p className="font-semibold">{viewingRecord.check_in_time ? viewingRecord.check_in_time.substring(0, 5) : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Check-out Time</p>
                  <p className="font-semibold">{viewingRecord.check_out_time ? viewingRecord.check_out_time.substring(0, 5) : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Hours Worked</p>
                  <p className="font-semibold">{viewingRecord.actual_working_hours ? `${Number(viewingRecord.actual_working_hours).toFixed(2)}h` : '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Location Verified</p>
                  <p className="font-semibold">{viewingRecord.location_verified ? '✓ Yes' : '✗ No'}</p>
                </div>
              </div>

              {/* Location Info */}
              {(viewingRecord.location_coordinates || viewingRecord.location_address) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Location</p>
                  {viewingRecord.location_address && (
                    <p className="font-medium text-sm">{viewingRecord.location_address}</p>
                  )}
                  {viewingRecord.location_coordinates && (
                    <p className="text-xs text-gray-500 font-mono mt-1">{viewingRecord.location_coordinates}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewingRecord.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Notes</p>
                  <p className="text-sm">{viewingRecord.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>Created: {new Date(viewingRecord.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(viewingRecord.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(viewingRecord);
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Record
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    {/* Auto-Mark Settings Modal - Outside main container for proper z-index */}
    <AutoMarkSettingsModal
      isOpen={showAutoMarkModal}
      onClose={() => setShowAutoMarkModal(false)}
      branchId={typeof selectedBranchForAutoMark === 'number' ? selectedBranchForAutoMark : Number(selectedBranchForAutoMark)}
      branchName={branches.find(b => b.id === selectedBranchForAutoMark)?.name || 'Branch'}
      onSuccess={() => {
        setSuccessMessage('Auto-mark settings updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }}
    />
    </>
  );
};

export default AttendanceView;
