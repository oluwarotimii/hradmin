import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  UserPlus,
  TrendingUp,
  X,
  Eye,
  FileText,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAllAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  bulkAllocateSelected,
  bulkAllocateAll,
  LeaveAllocation,
  CreateAllocationRequest,
  BulkAllocationRequest,
  UpdateAllocationRequest,
} from '../services/leaveAllocationService';
import { getAllLeaveTypes, LeaveType } from '../services/leaveManagementService';
import { getAllStaff } from '../services/staffManagementService';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  staff_id?: string;
  department?: string;
  recordId?: number;
  userId?: number;
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const avatarColor = (name: string) => {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  return colors[name.charCodeAt(0) % colors.length];
};

const T = {
  primary: '#1e40af',
  surfaceAlt: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  textSub: '#475569',
  textMuted: '#94a3b8',
};

const LeaveAllocationView = () => {
  const [allocations, setAllocations] = useState<LeaveAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pagination, setPagination] = useState<{
    currentPage: number;
    perPage: number;
    totalRecords: number;
    totalPages: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkAllModal, setShowBulkAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<LeaveAllocation | null>(null);

  const [exportFilters, setExportFilters] = useState({
    userId: '' as number | '',
    leaveTypeId: '' as number | '',
    year: '' as number | '',
    dateFrom: '',
    dateTo: '',
  });

  const [selectedAllocationIds, setSelectedAllocationIds] = useState<number[]>([]);
  const [selectAllMode, setSelectAllMode] = useState<'none' | 'current' | 'all'>('none');

  const [createForm, setCreateForm] = useState<CreateAllocationRequest>({
    user_id: 0,
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
  });

  const [bulkForm, setBulkForm] = useState<Partial<BulkAllocationRequest>>({
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
    user_ids: [],
  });

  const [bulkStaffSearch, setBulkStaffSearch] = useState('');

  const [bulkAllForm, setBulkAllForm] = useState<Omit<BulkAllocationRequest, 'user_ids'>>({
    leave_type_id: 0,
    allocated_days: 21,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    carried_over_days: 0,
  });

  const [editForm, setEditForm] = useState<UpdateAllocationRequest>({
    allocated_days: 0,
    used_days: 0,
    carried_over_days: 0,
  });

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, selectedLeaveTypeId, selectedYear, searchTerm]);

  useEffect(() => {
    fetchData();
    loadLeaveTypes();
    loadStaffMembers();
    extractAvailableYears();
  }, [currentPage, limit, selectedUserId, selectedLeaveTypeId, selectedYear, searchTerm]);

  useEffect(() => {
    const anyModalOpen = showCreateModal || showBulkModal || showBulkAllModal ||
                         showEditModal || showDeleteModal || showDetailsModal;
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showCreateModal, showBulkModal, showBulkAllModal, showEditModal, showDeleteModal, showDetailsModal]);

  const extractAvailableYears = () => {
    const y = new Date().getFullYear();
    setAvailableYears([y + 1, y, y - 1]);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, limit };
      if (selectedUserId) params.userId = Number(selectedUserId);
      if (selectedLeaveTypeId) params.leaveTypeId = Number(selectedLeaveTypeId);
      if (selectedYear) params.year = Number(selectedYear);
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const result = await getAllAllocations(params);
      if (result.success && result.allocations) {
        setAllocations(result.allocations);
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.currentPage,
            perPage: result.pagination.itemsPerPage,
            totalRecords: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
          });
        }
      } else {
        setError(result.message || 'Failed to fetch allocations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const result = await getAllLeaveTypes();
      if (result.success && result.leaveTypes) setLeaveTypes(result.leaveTypes);
    } catch (_) {}
  };

  const loadStaffMembers = async () => {
    try {
      const result = await getAllStaff(1, 1000);
      if (result.success && result.staff) {
        setStaffMembers(result.staff.map((s: any) => {
          const first = s.first_name || s.firstName || '';
          const last = s.last_name || s.lastName || '';
          const middle = s.middle_name || s.middleName || '';
          const name = [first, middle, last].filter(Boolean).join(' ').trim();
          return {
            id: Number(s.user_id || s.userId || s.id),
            recordId: s.id,
            name: name || s.name || s.email || 'Unknown',
            email: s.work_email || s.email || '',
            userId: Number(s.user_id || s.userId || s.id),
          };
        }));
      }
    } catch (_) {}
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalError(null);
    try {
      const result = await createAllocation(createForm);
      if (result.success) {
        setSuccessMessage(result.message || 'Allocation created');
        setShowCreateModal(false);
        resetCreateForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setCreateModalError(result.message || 'Failed to create');
      }
    } catch (err: any) {
      setCreateModalError(err.message || 'Error creating allocation');
    }
  };

  const handleBulkAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkForm.user_ids?.length) { setError('Select at least one user'); return; }
    try {
      const result = await bulkAllocateSelected({
        leave_type_id: Number(bulkForm.leave_type_id),
        allocated_days: Number(bulkForm.allocated_days),
        cycle_start_date: bulkForm.cycle_start_date!,
        cycle_end_date: bulkForm.cycle_end_date!,
        carried_over_days: Number(bulkForm.carried_over_days || 0),
        user_ids: bulkForm.user_ids,
      });
      if (result.success) {
        setSuccessMessage(result.message || 'Bulk allocation successful');
        setShowBulkModal(false);
        resetBulkForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  };

  const handleBulkAllocateAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await bulkAllocateAll({
        leave_type_id: Number(bulkAllForm.leave_type_id),
        allocated_days: Number(bulkAllForm.allocated_days),
        cycle_start_date: bulkAllForm.cycle_start_date!,
        cycle_end_date: bulkAllForm.cycle_end_date!,
        carried_over_days: Number(bulkAllForm.carried_over_days || 0),
      });
      if (result.success) {
        setSuccessMessage(result.message || 'Allocation to all successful');
        setShowBulkAllModal(false);
        resetBulkAllForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  };

  const handleDeleteAllocation = async () => {
    if (!selectedAllocation) return;
    try {
      const result = await deleteAllocation(selectedAllocation.id);
      if (result.success) {
        setSuccessMessage(result.message || 'Deleted');
        setShowDeleteModal(false);
        setSelectedAllocation(null);
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to delete');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedAllocationIds.length) return;
    try {
      await Promise.all(selectedAllocationIds.map(id => deleteAllocation(id)));
      setSuccessMessage(`Deleted ${selectedAllocationIds.length} allocations`);
      setSelectedAllocationIds([]);
      setSelectAllMode('none');
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error during bulk delete');
    }
  };

  const openEditModal = (a: LeaveAllocation) => {
    setSelectedAllocation(a);
    setEditForm({
      allocated_days: Number(a.allocated_days) || 0,
      used_days: Number(a.used_days) || 0,
      carried_over_days: Number(a.carried_over_days) || 0,
    });
    setShowEditModal(true);
  };

  const handleEditAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    try {
      const result = await updateAllocation(selectedAllocation.id, editForm);
      if (result.success) {
        setSuccessMessage(result.message || 'Updated');
        setShowEditModal(false);
        setSelectedAllocation(null);
        resetEditForm();
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || 'Failed to update');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ user_id: 0, leave_type_id: 0, allocated_days: 21, cycle_start_date: new Date().toISOString().split('T')[0], cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], carried_over_days: 0 });
    setCreateModalError(null);
  };

  const resetBulkForm = () => {
    setBulkForm({ leave_type_id: 0, allocated_days: 21, cycle_start_date: new Date().toISOString().split('T')[0], cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], carried_over_days: 0, user_ids: [] });
  };

  const resetBulkAllForm = () => {
    setBulkAllForm({ leave_type_id: 0, allocated_days: 21, cycle_start_date: new Date().toISOString().split('T')[0], cycle_end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], carried_over_days: 0 });
  };

  const resetEditForm = () => setEditForm({ allocated_days: 0, used_days: 0, carried_over_days: 0 });

  const toggleSelection = (id: number) => setSelectedAllocationIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    if (selectAllMode === 'all' || selectAllMode === 'current') {
      setSelectedAllocationIds([]);
      setSelectAllMode('none');
    } else {
      setSelectedAllocationIds(allocations.map(a => a.id));
      setSelectAllMode('current');
    }
  };

  const isSelected = (id: number) => selectAllMode === 'all' || selectedAllocationIds.includes(id);

  const exportToCSV = () => {
    let data = allocations;
    if (exportFilters.userId) data = data.filter(a => a.user_id === Number(exportFilters.userId));
    if (exportFilters.leaveTypeId) data = data.filter(a => a.leave_type_id === Number(exportFilters.leaveTypeId));
    if (exportFilters.year) data = data.filter(a => new Date(a.cycle_end_date).getFullYear() === Number(exportFilters.year));
    if (exportFilters.dateFrom) { const d = new Date(exportFilters.dateFrom); data = data.filter(a => new Date(a.cycle_start_date) >= d); }
    if (exportFilters.dateTo) { const d = new Date(exportFilters.dateTo); data = data.filter(a => new Date(a.cycle_end_date) <= d); }

    const headers = ['Staff Name', 'Email', 'Leave Type', 'Allocated', 'Used', 'Remaining', 'Carried Over', 'Cycle Start', 'Cycle End'];
    const rows = data.map(a => [
      a.user_name || '', staffMembers.find(s => s.id === a.user_id)?.email || '', a.leave_type_name || '',
      Number(a.allocated_days), Number(a.used_days), Number(a.allocated_days) - Number(a.used_days),
      Number(a.carried_over_days), new Date(a.cycle_start_date).toLocaleDateString(), new Date(a.cycle_end_date).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave_allocations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportModal(false);
    setExportFilters({ userId: '', leaveTypeId: '', year: '', dateFrom: '', dateTo: '' });
  };

  const totalAllocated = allocations.reduce((s, a) => s + (Number(a.allocated_days) || 0), 0);
  const totalUsed = allocations.reduce((s, a) => s + (Number(a.used_days) || 0), 0);
  const totalRemaining = totalAllocated - totalUsed;

  const getRemainingColor = (r: number) => r < 5 ? 'text-red-600 bg-red-50' : r < 10 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
  const getProgressColor = (p: number) => p > 90 ? 'bg-red-500' : p > 70 ? 'bg-yellow-500' : 'bg-green-500';

  const totalPages = pagination?.totalPages || 0;
  const startIndex = ((currentPage - 1) * limit) + 1;
  const endIndex = Math.min(currentPage * limit, pagination?.totalRecords || 0);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPages = () => {
      const pages: (number | 'ellipsis')[] = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
      return pages;
    };

    return (
      <div style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: T.surfaceAlt }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: T.textMuted }}>
          Showing <strong style={{ color: T.text }}>{startIndex}</strong>&ndash;<strong style={{ color: T.text }}>{endIndex}</strong> of <strong style={{ color: T.text }}>{pagination?.totalRecords || 0}</strong>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: `1px solid ${T.border}`, background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={14} color={T.textSub} />
          </button>
          {getPages().map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`e-${idx}`} style={{ color: T.textMuted, fontSize: '0.8rem', padding: '0 0.2rem' }}>&hellip;</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                style={{
                  width: '2rem', height: '2rem', borderRadius: '7px',
                  border: currentPage === item ? 'none' : `1px solid ${T.border}`,
                  background: currentPage === item ? T.primary : '#fff',
                  color: currentPage === item ? '#fff' : T.textSub,
                  cursor: 'pointer', fontSize: '0.8rem',
                  fontWeight: currentPage === item ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: currentPage === item ? '0 1px 4px rgba(30,64,175,0.25)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{ width: '2rem', height: '2rem', borderRadius: '7px', border: `1px solid ${T.border}`, background: '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={14} color={T.textSub} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Leave Allocations</h1>
        <p className="text-secondary mt-1">Manage employee leave day allocations and balances</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-success-100 border border-success-500 rounded-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-success-700 flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-success-600 hover:text-success-800 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error-100 border border-error-500 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-error-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-error-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-error-600 hover:text-error-800 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
            </div>
            <div>
              <p className="text-muted">{selectedUserId || selectedLeaveTypeId || selectedYear || searchTerm ? 'Filtered' : 'Total'} Allocations</p>
              <p className="text-2xl font-bold text-primary">{allocations.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--success-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Allocated</p>
              <p className="text-2xl font-bold text-success-600">{totalAllocated}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--warning-100)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--warning-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Used</p>
              <p className="text-2xl font-bold text-warning-600">{totalUsed}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 transition-all hover-lift">
          <div className="flex items-center gap-3">
            <div className="icon-wrapper" style={{ backgroundColor: '#d1fae5', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <p className="text-muted">Days Remaining</p>
              <p className="text-2xl font-bold text-success-600">{totalRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => { loadStaffMembers(); setShowCreateModal(true); }} className="btn btn-sm btn-primary">
            <Plus className="w-4 h-4 mr-2" /> New Allocation
          </button>
          <button onClick={() => { loadStaffMembers(); setShowBulkModal(true); }} className="btn btn-sm" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
            <Users className="w-4 h-4 mr-2" /> Bulk Allocate
          </button>
          <button onClick={() => setShowBulkAllModal(true)} className="btn btn-sm" style={{ backgroundColor: '#4f46e5', color: 'white' }}>
            <UserPlus className="w-4 h-4 mr-2" /> Allocate to All
          </button>
          {(selectedAllocationIds.length > 0 || selectAllMode !== 'none') && (
            <button onClick={handleBulkDelete} className="btn btn-sm btn-danger">
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectAllMode === 'all' ? 'All' : selectedAllocationIds.length})
            </button>
          )}
          <div className="flex-1" />
          <button onClick={() => setShowExportModal(true)} className="btn btn-sm btn-outline" title="Export CSV">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          <div className="input-wrapper" style={{ minWidth: '220px' }}>
            <div className="input-icon"><Search className="w-4 h-4" /></div>
            <input
              type="text" placeholder="Search staff name or leave type..."
              className="input input-with-icon"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(() => fetchData(), 300);
              }}
            />
          </div>
          <button className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> {showFilters ? 'Hide' : 'Filters'}
          </button>
          <button onClick={fetchData} className="btn btn-sm btn-outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 mt-3 px-3 py-2.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : '')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', color: '#1f2937', background: '#fff', outline: 'none', minWidth: '90px', fontFamily: 'inherit' }}>
                <option value="">All</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Staff</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : '')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', color: '#1f2937', background: '#fff', outline: 'none', minWidth: '140px', fontFamily: 'inherit' }}>
                <option value="">All</option>
                {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Leave Type</label>
              <select value={selectedLeaveTypeId} onChange={e => setSelectedLeaveTypeId(e.target.value ? Number(e.target.value) : '')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', color: '#1f2937', background: '#fff', outline: 'none', minWidth: '120px', fontFamily: 'inherit' }}>
                <option value="">All</option>
                {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {(selectedUserId || selectedLeaveTypeId || selectedYear) && (
              <button type="button" onClick={() => { setSelectedUserId(''); setSelectedLeaveTypeId(''); setSelectedYear(''); }} className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1" style={{ paddingBottom: '0.35rem' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {(selectedAllocationIds.length > 0 || selectAllMode !== 'none') && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-primary-800">{selectAllMode === 'all' ? 'All allocations selected' : `${selectedAllocationIds.length} selected`}</span>
          <button onClick={() => { setSelectedAllocationIds([]); setSelectAllMode('none'); }} className="text-sm text-primary-600 hover:text-primary-800 font-medium">Clear</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell" style={{ width: '50px' }}>
                  <input type="checkbox" checked={selectAllMode !== 'none'} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                </th>
                <th className="table-header-cell">Staff Member</th>
                <th className="table-header-cell">Leave Type</th>
                <th className="table-header-cell">Allocated</th>
                <th className="table-header-cell">Used</th>
                <th className="table-header-cell">Remaining</th>
                <th className="table-header-cell">Carried Over</th>
                <th className="table-header-cell">Cycle Period</th>
                <th className="table-header-cell right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
                    <span className="text-gray-600">Loading...</span>
                  </div>
                </td></tr>
              ) : allocations.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-500" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No allocations found</p>
                  <p className="text-gray-400 text-sm">{searchTerm || selectedUserId || selectedLeaveTypeId || selectedYear ? 'Try adjusting your filters' : 'Create a new allocation to get started'}</p>
                </td></tr>
              ) : (
                allocations.map(a => {
                  const allocated = Number(a.allocated_days) || 0;
                  const used = Number(a.used_days) || 0;
                  const remaining = allocated - used;
                  const pct = allocated > 0 ? (used / allocated) * 100 : 0;
                  return (
                    <tr key={a.id} className="table-row hover:bg-gray-50">
                      <td className="table-cell">
                        <input type="checkbox" checked={isSelected(a.id)} onChange={() => toggleSelection(a.id)} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                      </td>
                      <td className="table-cell"><p className="font-medium text-primary">{a.user_name || `User ${a.user_id}`}</p></td>
                      <td className="table-cell"><span className="text-sm font-medium text-gray-700">{a.leave_type_name || `Type ${a.leave_type_id}`}</span></td>
                      <td className="table-cell">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-success-50">
                          <CheckCircle className="w-3 h-3 text-success-600" />
                          <span className="font-semibold text-sm text-success-700">{allocated}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-warning-50">
                          <Calendar className="w-3 h-3 text-warning-600" />
                          <span className="font-semibold text-sm text-warning-700">{used}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${getRemainingColor(remaining)}`}>
                            <span className="font-semibold text-sm">{remaining} days</span>
                          </div>
                          <div className="mt-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${getProgressColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell"><span className="text-sm text-gray-600">{Number(a.carried_over_days) || 0}</span><span className="text-xs text-muted ml-1">days</span></td>
                      <td className="table-cell">
                        <p className="text-sm font-medium text-gray-700">
                          <Calendar className="inline w-3 h-3 mr-1" />
                          {new Date(a.cycle_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted">to {new Date(a.cycle_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="table-cell right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedAllocation(a); setShowDetailsModal(true); }} className="btn btn-sm btn-outline" title="View"><Eye className="w-3 h-3" /></button>
                          <button onClick={() => openEditModal(a)} className="btn btn-sm btn-outline" style={{ borderColor: '#059669', color: '#059669' }} title="Edit"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => { setSelectedAllocation(a); setShowDeleteModal(true); }} className="btn btn-sm btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626' }} title="Delete"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {renderPagination()}

        {totalPages > 1 && (
          <div style={{ padding: '0.5rem 1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', background: T.surfaceAlt }}>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ padding: '0.2rem 0.4rem', border: `1px solid ${T.border}`, borderRadius: '6px', fontSize: '0.75rem', color: T.textSub, background: '#fff', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div><h3 className="modal-title">Create Leave Allocation</h3><p className="text-sm text-muted">Allocate leave days to a staff member</p></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="modal-content">
              {createModalError && (
                <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
                  <div className="flex-1"><p className="text-base font-bold text-orange-900">Error</p><p className="text-sm font-semibold text-orange-800 mt-1">{createModalError}</p></div>
                  <button type="button" onClick={() => setCreateModalError(null)} className="text-orange-600 hover:text-orange-800"><X className="w-5 h-5" /></button>
                </div>
              )}
              <div className="space-y-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Staff Member *</label>
                  <select value={createForm.user_id || ''} onChange={e => setCreateForm({ ...createForm, user_id: Number(e.target.value) })} className="input w-full">
                    <option value="" disabled>Select Staff</option>
                    {staffMembers.map(s => <option key={`${s.id}-${s.recordId}`} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                  <select value={createForm.leave_type_id || ''} onChange={e => setCreateForm({ ...createForm, leave_type_id: Number(e.target.value) })} className="input w-full">
                    <option value="" disabled>Select Leave Type</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} &mdash; {t.daysPerYear} days/year</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Allocated Days *</label>
                    <input type="number" min="0" value={createForm.allocated_days || ''} onChange={e => setCreateForm({ ...createForm, allocated_days: Number(e.target.value) })} className="input w-full" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Carried Over Days</label>
                    <input type="number" min="0" value={createForm.carried_over_days || ''} onChange={e => setCreateForm({ ...createForm, carried_over_days: Number(e.target.value) })} className="input w-full" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Cycle Start *</label><input type="date" value={createForm.cycle_start_date} onChange={e => setCreateForm({ ...createForm, cycle_start_date: e.target.value })} className="input w-full" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Cycle End *</label><input type="date" value={createForm.cycle_end_date} onChange={e => setCreateForm({ ...createForm, cycle_end_date: e.target.value })} className="input w-full" /></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="btn btn-outline">Cancel</button>
              <button type="button" onClick={handleCreateAllocation} className="btn btn-primary">Create Allocation</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Allocation Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '42rem' }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.35rem 1.6rem', borderBottom: '1px solid #f0f0f4', background: 'linear-gradient(135deg, #fafbff 0%, #f4f6fc 100%)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4f46e5', boxShadow: '0 4px 12px #4f46e555', flexShrink: 0 }}><Users size={18} color="#fff" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f1117', letterSpacing: '-0.01em' }}>Bulk Allocate Leave</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8b8fa8', marginTop: '0.1rem' }}>{bulkForm.user_ids?.length ? `${bulkForm.user_ids.length} staff selected` : 'Select staff members below'}</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8fa8', flexShrink: 0 }}><X size={16} /></button>
            </div>
            <div className="modal-content" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.6rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Leave Type <span style={{ color: '#ef4444' }}>*</span></label>
                    <select style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                      value={bulkForm.leave_type_id || ''} onChange={e => setBulkForm({ ...bulkForm, leave_type_id: Number(e.target.value) })}>
                      <option value="" disabled>Select type&hellip;</option>
                      {leaveTypes.map(t => <option key={t.id} value={t.id} style={{ color: '#0f1117' }}>{t.name} ({t.daysPerYear} days/yr)</option>)}
                    </select>
                  </div>
                  <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Days <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="number" min="0" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="e.g. 21" value={bulkForm.allocated_days || ''} onChange={e => setBulkForm({ ...bulkForm, allocated_days: Number(e.target.value) })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Cycle Start <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="date" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      value={bulkForm.cycle_start_date} onChange={e => setBulkForm({ ...bulkForm, cycle_start_date: e.target.value })} />
                  </div>
                  <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Cycle End <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="date" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      value={bulkForm.cycle_end_date} onChange={e => setBulkForm({ ...bulkForm, cycle_end_date: e.target.value })} />
                  </div>
                </div>
                <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Carried Over Days</label>
                  <input type="number" min="0" style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="0" value={bulkForm.carried_over_days || ''} onChange={e => setBulkForm({ ...bulkForm, carried_over_days: Number(e.target.value) })} />
                </div>
                <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d3f52', marginBottom: '0.45rem' }}>Select Staff <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8b8fa8' }} />
                    <input type="text" placeholder="Search by name or email&hellip;" value={bulkStaffSearch} onChange={e => setBulkStaffSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #e8eaf0', borderRadius: '0.6rem', fontSize: '0.875rem', color: '#0f1117', background: '#fff', outline: 'none', paddingLeft: '2.25rem', boxSizing: 'border-box' }} />
                  </div>
                  {bulkForm.user_ids && bulkForm.user_ids.length > 0 && (
                    <div style={{ border: '1.5px solid #e8eaf0', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem', background: '#fafbff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected &middot; {bulkForm.user_ids.length}</span>
                        <button onClick={() => setBulkForm({ ...bulkForm, user_ids: [] })} style={{ fontSize: '0.74rem', color: '#8b8fa8', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '7rem', overflowY: 'auto' }}>
                        {bulkForm.user_ids.map(uid => {
                          const s = staffMembers.find(x => x.id === uid);
                          if (!s) return null;
                          return (
                            <span key={uid} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: '#f0f1fa', border: '1px solid #e3e5f5', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, color: '#4b4f72' }}>
                              <span>{s.name.split(' ')[0]}</span>
                              <button onClick={() => setBulkForm({ ...bulkForm, user_ids: bulkForm.user_ids?.filter(i => i !== uid) })}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8b8fa8', padding: 0, display: 'flex', alignItems: 'center' }}><X size={11} /></button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ border: '1.5px solid #e8eaf0', borderRadius: '0.75rem', overflowY: 'auto', maxHeight: '14rem', background: '#fff' }}>
                    {bulkStaffSearch ? (
                      staffMembers.filter(s => { const q = bulkStaffSearch.toLowerCase(); return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) && !bulkForm.user_ids?.includes(s.id); })
                        .map((s, i, arr) => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f8' : 'none' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f7f8fc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setBulkForm({ ...bulkForm, user_ids: [...(bulkForm.user_ids || []), s.id] })}>
                            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarColor(s.name), flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{initials(s.name)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f1117' }}>{s.name}</div>
                              <div style={{ fontSize: '0.74rem', color: '#8b8fa8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                            </div>
                            <div style={{ width: '1.9rem', height: '1.9rem', borderRadius: '50%', border: '1.5px solid #e3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8fa8', flexShrink: 0 }}><Plus size={13} /></div>
                          </div>
                        ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#8b8fa8', fontSize: '0.83rem' }}>
                        <Users size={22} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                        <div>Type to search staff members</div>
                      </div>
                    )}
                    {bulkStaffSearch && staffMembers.filter(s => { const q = bulkStaffSearch.toLowerCase(); return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) && !bulkForm.user_ids?.includes(s.id); }).length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#8b8fa8', fontSize: '0.83rem' }}>No results for &ldquo;{bulkStaffSearch}&rdquo;</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
                    <button style={{ flex: 1, padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      onClick={() => setBulkForm({ ...bulkForm, user_ids: staffMembers.map(s => s.id) })}>Select All ({staffMembers.length})</button>
                    {bulkForm.user_ids && bulkForm.user_ids.length > 0 && (
                      <button style={{ padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: '1.5px solid #e3e5f5', background: '#fff', color: '#5a5d78', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setBulkForm({ ...bulkForm, user_ids: [] })}>Clear</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1.1rem 1.6rem', borderTop: '1px solid #f0f0f4', background: '#fafbff', flexShrink: 0 }}>
              <button type="button" onClick={() => { setShowBulkModal(false); resetBulkForm(); }} style={{ padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: '1.5px solid #e3e5f5', background: '#fff', color: '#5a5d78', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleBulkAllocate} disabled={!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length}
                style={{ padding: '0.55rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: (!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (!bulkForm.leave_type_id || !bulkForm.allocated_days || !bulkForm.user_ids?.length) ? 0.45 : 1 }}>
                <Users size={15} /> Allocate to {bulkForm.user_ids?.length || 0} Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Allocate All Modal */}
      {showBulkAllModal && (
        <div className="modal-overlay" onClick={() => setShowBulkAllModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div><h3 className="modal-title">Allocate to All Active Users</h3><p className="text-sm text-muted">Create allocations for all active staff members</p></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBulkAllModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                  <select value={bulkAllForm.leave_type_id || ''} onChange={e => setBulkAllForm({ ...bulkAllForm, leave_type_id: Number(e.target.value) })} className="input w-full" style={{ backgroundColor: 'white', color: '#1f2937' }}>
                    <option value="" disabled>Select Leave Type</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id} style={{ color: '#1f2937' }}>{t.name} ({t.daysPerYear} days/year)</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Allocated Days *</label>
                  <input type="number" min="0" value={bulkAllForm.allocated_days || ''} onChange={e => setBulkAllForm({ ...bulkAllForm, allocated_days: Number(e.target.value) })} className="input w-full" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Cycle Start *</label><input type="date" value={bulkAllForm.cycle_start_date} onChange={e => setBulkAllForm({ ...bulkAllForm, cycle_start_date: e.target.value })} className="input w-full" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Cycle End *</label><input type="date" value={bulkAllForm.cycle_end_date} onChange={e => setBulkAllForm({ ...bulkAllForm, cycle_end_date: e.target.value })} className="input w-full" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Carried Over Days</label><input type="number" min="0" value={bulkAllForm.carried_over_days || ''} onChange={e => setBulkAllForm({ ...bulkAllForm, carried_over_days: Number(e.target.value) })} className="input w-full" /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => { setShowBulkAllModal(false); resetBulkAllForm(); }} className="btn btn-outline">Cancel</button>
              <button type="button" onClick={handleBulkAllocateAll} className="btn btn-primary" style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}>Allocate to All</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setSelectedAllocation(null); resetEditForm(); }}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: '#059669', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div><h3 className="modal-title">Edit Leave Allocation</h3><p className="text-sm text-muted">Update allocation details</p></div>
              </div>
            </div>
            <form onSubmit={handleEditAllocation} className="modal-content">
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600"><strong>Staff:</strong> {selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}</div>
                  <div className="text-sm text-gray-600"><strong>Leave Type:</strong> {selectedAllocation.leave_type_name || `Type ${selectedAllocation.leave_type_id}`}</div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Allocated Days *</label>
                  <input type="number" min="0" value={editForm.allocated_days || ''} onChange={e => setEditForm({ ...editForm, allocated_days: Number(e.target.value) })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Used Days *</label>
                  <input type="number" min="0" value={editForm.used_days || ''} onChange={e => setEditForm({ ...editForm, used_days: Number(e.target.value) })} className="input w-full" />
                  {(editForm.used_days || 0) > ((editForm.allocated_days || 0) + (editForm.carried_over_days || 0)) && (
                    <p className="mt-1 text-sm text-error-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Exceeds available ({(editForm.allocated_days || 0) + (editForm.carried_over_days || 0)})</p>
                  )}
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Carried Over Days</label>
                  <input type="number" min="0" value={editForm.carried_over_days || ''} onChange={e => setEditForm({ ...editForm, carried_over_days: Number(e.target.value) })} className="input w-full" /></div>
                <div className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-sm text-primary-800"><strong>Remaining:</strong>{' '}
                    <span className={(editForm.allocated_days || 0) + (editForm.carried_over_days || 0) - (editForm.used_days || 0) < 0 ? 'text-error-600 font-semibold' : 'text-primary-600 font-semibold'}>
                      {(editForm.allocated_days || 0) + (editForm.carried_over_days || 0) - (editForm.used_days || 0)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0', backgroundColor: 'transparent' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedAllocation(null); resetEditForm(); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={(editForm.used_days || 0) > ((editForm.allocated_days || 0) + (editForm.carried_over_days || 0))} className="btn btn-primary flex-1">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper" style={{ backgroundColor: 'var(--primary-600)', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye className="w-5 h-5" style={{ color: 'white' }} />
                </div>
                <div><h3 className="modal-title">Allocation Details</h3><p className="text-sm text-muted">View complete allocation information</p></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="modal-content">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Staff</h4>
                  <p className="font-medium text-gray-900">{selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Leave Type</h4>
                  <p className="font-medium text-gray-900">{selectedAllocation.leave_type_name || `Type ${selectedAllocation.leave_type_id}`}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Allocation</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Allocated:</span> <p className="font-semibold text-success-600">{Number(selectedAllocation.allocated_days)}</p></div>
                    <div><span className="text-gray-500">Used:</span> <p className="font-semibold text-warning-600">{Number(selectedAllocation.used_days)}</p></div>
                    <div><span className="text-gray-500">Remaining:</span> <p className={`font-semibold ${(Number(selectedAllocation.allocated_days) - Number(selectedAllocation.used_days)) < 5 ? 'text-error-600' : 'text-success-600'}`}>{Number(selectedAllocation.allocated_days) - Number(selectedAllocation.used_days)}</p></div>
                    <div><span className="text-gray-500">Carried Over:</span> <p className="font-medium text-gray-900">{Number(selectedAllocation.carried_over_days)}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Cycle</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Start:</span> <p className="font-medium text-gray-900">{new Date(selectedAllocation.cycle_start_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                    <div><span className="text-gray-500">End:</span> <p className="font-medium text-gray-900">{new Date(selectedAllocation.cycle_end_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Usage</h4>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Utilization</span><span className="font-medium text-gray-900">{((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100).toFixed(1)}%</span></div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getProgressColor((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100)}`}
                      style={{ width: `${Math.min((Number(selectedAllocation.used_days) / Number(selectedAllocation.allocated_days)) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Metadata</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>Created: <p className="font-medium text-gray-700">{new Date(selectedAllocation.created_at).toLocaleDateString()}</p></div>
                    <div>Updated: <p className="font-medium text-gray-700">{new Date(selectedAllocation.updated_at).toLocaleDateString()}</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => { setShowDetailsModal(false); setSelectedAllocation(null); }} className="btn btn-outline">Close</button>
              <button type="button" onClick={() => { setShowDetailsModal(false); openEditModal(selectedAllocation); }} className="btn btn-primary">Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowExportModal(false)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Download className="w-5 h-5 mr-2 inline" /> Export Leave Allocations</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowExportModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="modal-content">
              <p className="text-sm text-gray-600 mb-4">Filter data before exporting. Leave fields empty to export all.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2"><Users className="w-4 h-4 inline mr-1" /> Staff Member</label>
                  <select className="input w-full" value={exportFilters.userId} onChange={e => setExportFilters({ ...exportFilters, userId: e.target.value ? Number(e.target.value) : '' })}>
                    <option value="">All Staff</option>
                    {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-1" /> Leave Type</label>
                  <select className="input w-full" value={exportFilters.leaveTypeId} onChange={e => setExportFilters({ ...exportFilters, leaveTypeId: e.target.value ? Number(e.target.value) : '' })}>
                    <option value="">All Leave Types</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="w-4 h-4 inline mr-1" /> Cycle Year</label>
                  <select className="input w-full" value={exportFilters.year} onChange={e => setExportFilters({ ...exportFilters, year: e.target.value ? Number(e.target.value) : '' })}>
                    <option value="">All Years</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2"><CalendarDays className="w-4 h-4 inline mr-1" /> Start From</label>
                  <input type="date" className="input w-full" value={exportFilters.dateFrom} onChange={e => setExportFilters({ ...exportFilters, dateFrom: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2"><CalendarDays className="w-4 h-4 inline mr-1" /> End To</label>
                  <input type="date" className="input w-full" value={exportFilters.dateTo} onChange={e => setExportFilters({ ...exportFilters, dateTo: e.target.value })} /></div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800"><strong>{allocations.length}</strong> allocations will be exported</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowExportModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={exportToCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAllocation && (
        <div className="modal-overlay" onClick={() => { setShowDeleteModal(false); setSelectedAllocation(null); }}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-error-500" /></div>
                <div><h3 className="text-lg font-semibold text-gray-900">Delete Allocation</h3><p className="text-sm text-gray-500">This cannot be undone</p></div>
              </div>
              <p className="text-gray-600 mb-6">Delete allocation for <strong>{selectedAllocation.user_name || `User ${selectedAllocation.user_id}`}</strong>?</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedAllocation(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleDeleteAllocation} className="flex-1 px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAllocationView;