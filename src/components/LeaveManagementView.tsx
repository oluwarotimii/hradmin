// This component provides comprehensive leave management functionality
// It handles leave requests, approvals, reporting, and year-end processing

import { useState, useEffect } from 'react';
import { Search, Calendar, Download, Filter, Check, X, Clock, User, Building, FileText, TrendingUp, AlertCircle, CalendarDays, Info, CheckCircle, Eye, Paperclip, ExternalLink, Image } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import {
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  cancelLeaveRequest,
  getUserLeaveBalance,
  createLeaveType,
  getAllLeaveTypes,
  getLeaveRequestById,
  getLeaveRequestFiles,
  LeaveRequest as LeaveRequestType,
  LeaveBalance,
  LeaveType
} from '../services/leaveManagementService';
import { triggerLeaveCleanup, getLeaveCleanupStatus } from '../services/leaveCleanupService';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  branch: string;
  leaveType: 'Sick' | 'Annual' | 'Emergency' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Bereaved';
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Active';
  requestDate: string;
  approvedBy?: string;
  approvalDate?: string;
  declineReason?: string;
  coveringStaff?: string;
}

// ─── Design tokens (consistent with rest of portal) ───────────────────────
const T = {
  primary:       '#1e40af',
  primaryLight:  '#3b82f6',
  primaryPale:   '#eff6ff',
  primaryBorder: '#bfdbfe',
  success:       '#059669',
  successPale:   '#ecfdf5',
  successBorder: '#a7f3d0',
  warning:       '#d97706',
  warningPale:   '#fffbeb',
  warningBorder: '#fde68a',
  danger:        '#dc2626',
  dangerPale:    '#fef2f2',
  dangerBorder:  '#fecaca',
  purple:        '#7c3aed',
  purplePale:    '#f5f3ff',
  purpleBorder:  '#ddd6fe',
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
  surfaceMuted:  '#f1f5f9',
  border:        '#e2e8f0',
  borderStrong:  '#cbd5e1',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
};

// Shared style primitives
const card: React.CSSProperties = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
};

const inputS: React.CSSProperties = {
  width: '100%', padding: '0.575rem 0.875rem',
  border: `1.5px solid ${T.border}`, borderRadius: '8px',
  fontSize: '0.875rem', color: T.text, background: T.surface,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const labelS: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  color: T.textSub, marginBottom: '0.4rem',
  letterSpacing: '0.05em', textTransform: 'uppercase',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: T.primary, color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '0.82rem',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: `0 1px 3px rgba(30,64,175,0.28)`,
  transition: 'background 0.13s', whiteSpace: 'nowrap' as const,
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: T.surface, color: T.textSub,
  border: `1.5px solid ${T.border}`, borderRadius: '8px',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'background 0.13s', whiteSpace: 'nowrap' as const,
};

const btnSuccess: React.CSSProperties = {
  ...btnPrimary, background: T.success, boxShadow: `0 1px 3px rgba(5,150,105,0.28)`,
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary, background: T.danger, boxShadow: `0 1px 3px rgba(220,38,38,0.25)`,
};

const overlayS: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  backdropFilter: 'blur(3px)', zIndex: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
};

const modalShell = (w = '34rem'): React.CSSProperties => ({
  position: 'fixed', top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  width: `min(${w}, calc(100vw - 2rem))`, maxHeight: '90vh',
  display: 'flex', flexDirection: 'column', background: T.surface,
  borderRadius: '16px', boxShadow: '0 20px 60px rgba(15,23,42,0.22)',
  zIndex: 50, overflow: 'hidden',
});

const mHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '1.1rem 1.4rem', borderBottom: `1px solid ${T.border}`,
  background: T.surfaceAlt, flexShrink: 0,
};

const mBody: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '1.4rem' };
const mFoot: React.CSSProperties = {
  display: 'flex', gap: '0.6rem', justifyContent: 'flex-end',
  padding: '1rem 1.4rem', borderTop: `1px solid ${T.border}`,
  background: T.surfaceAlt, flexShrink: 0,
};

// ─── Shared sub-components ───────────────────────────────────────────────
const MHead = ({ icon: Icon, title, sub, color, onClose }: any) => (
  <div style={mHead}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color="#fff" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>{title}</p>
        {sub && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: T.textMuted }}>{sub}</p>}
      </div>
    </div>
    {onClose && (
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted, borderRadius: '6px', transition: 'background 0.12s' }}
        onMouseEnter={e => (e.currentTarget.style.background = T.surfaceMuted)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <X size={16} />
      </button>
    )}
  </div>
);

const FF = ({ label, required, children }: any) => (
  <div>
    <label style={labelS}>{label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}</label>
    {children}
  </div>
);

const Th = ({ ch, right }: { ch: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: '0.7rem 1rem', textAlign: right ? 'right' : 'left', fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
    {ch}
  </th>
);

const Td = ({ ch, right }: { ch: React.ReactNode; right?: boolean }) => (
  <td style={{ padding: '0.85rem 1rem', textAlign: right ? 'right' : 'left', borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle', fontSize: '0.875rem', color: T.text }}>
    {ch}
  </td>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, [string, string, string]> = {
    Approved: [T.success, T.successPale, T.successBorder],
    approved: [T.success, T.successPale, T.successBorder],
    Active:   [T.primary, T.primaryPale, T.primaryBorder],
    active:   [T.primary, T.primaryPale, T.primaryBorder],
    Declined: [T.danger,  T.dangerPale,  T.dangerBorder],
    Declined: [T.danger,  T.dangerPale,  T.dangerBorder],
    rejected: [T.danger,  T.dangerPale,  T.dangerBorder],
    Pending:  [T.warning, T.warningPale, T.warningBorder],
    submitted:[T.warning, T.warningPale, T.warningBorder],
  };
  const [dot, bg, border] = map[status] || [T.textMuted, T.surfaceMuted, T.border];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.6rem', borderRadius:'100px', fontSize:'0.72rem', fontWeight:600, background:bg, color:dot, border:`1px solid ${border}` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:dot, display:'inline-block' }}/>
      {status}
    </span>
  );
};

const initials2 = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
const avatarPalette = ['#1e40af','#0369a1','#059669','#7c3aed','#d97706','#be185d','#0891b2','#0d9488'];
const avatarBg = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size > 36 ? '10px' : '8px', background: avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size > 36 ? '0.9rem' : '0.65rem', fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
    {initials2(name)}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────
const LeaveManagementView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'declined' | 'active' | 'pending'>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'report'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
  const [showCreateLeaveTypeModal, setShowCreateLeaveTypeModal] = useState(false);
  const [showEditLeaveTypeModal, setShowEditLeaveTypeModal] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupStatus, setCleanupStatus] = useState<any | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [rawLeaveTypes, setRawLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [createLeaveTypeForm, setCreateLeaveTypeForm] = useState({
    name: '', description: '', daysPerYear: null, isPaid: true,
    allowCarryover: false, carryoverLimit: null, expiryRuleId: null
  });
  const [editLeaveTypeForm, setEditLeaveTypeForm] = useState({
    id: null, name: '', description: '', daysPerYear: null,
    isPaid: true, allowCarryover: false, carryoverLimit: null, expiryRuleId: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const typesResponse = await getAllLeaveTypes();
        if (typesResponse.success && typesResponse.leaveTypes) {
          setRawLeaveTypes(typesResponse.leaveTypes);
          setLeaveTypes(typesResponse.leaveTypes.map((type: any) => ({
            id: type.id, type: type.name, limit: type.days_per_year,
            color: type.is_paid ? T.primary : T.textMuted,
            description: type.description || `${type.days_per_year} days per year`
          })));
        } else { setLeaveTypes([]); setRawLeaveTypes([]); }

        const filters: { status?: string; leaveType?: string; search?: string } = {};
        if (filterStatus !== 'all') {
          const backendStatus = filterStatus==='pending'?'submitted':filterStatus==='declined'?'rejected':filterStatus==='active'?'approved':filterStatus;
          filters.status = backendStatus;
        }
        if (filterLeaveType !== 'all') filters.leaveType = filterLeaveType;
        if (searchTerm) filters.search = searchTerm;

        const requestsResponse = await getAllLeaveRequests(currentPage, itemsPerPage, filters);
        let transformedRequests = [];
        if (requestsResponse.success && requestsResponse.leaveRequests) {
          transformedRequests = requestsResponse.leaveRequests.map(req => {
            const rawStatus = req.status;
            const transformedStatus = req.status==='approved'?'Approved':req.status==='rejected'?'Declined':req.status==='submitted'?'Pending':req.status==='cancelled'?'Declined':'Active';
            return {
              id: req.id.toString(), staffId: req.user_id?.toString()||req.userId?.toString(),
              staffName: req.user_name||`User ${req.user_id}`, department:'General', branch:'Main Office',
              leaveType: req.leave_type_name||req.leaveTypeName||'Unknown',
              startDate: req.start_date||req.startDate, endDate: req.end_date||req.endDate,
              duration: req.days_requested||calculateDuration(req.start_date||req.startDate, req.end_date||req.endDate),
              reason: req.reason, status: transformedStatus, requestDate: req.created_at||req.createdAt,
              approvedBy: req.reviewed_by?'Admin':undefined, approvalDate: req.reviewed_at||req.updatedAt,
              declineReason: req.rejection_reason||req.rejectionReason, coveringStaff: undefined
            };
          });
          setLeaveRequests(transformedRequests);
          if (requestsResponse.pagination) {
            setTotalItems(requestsResponse.pagination.totalItems);
            setTotalPages(requestsResponse.pagination.totalPages);
            const pr = await getAllLeaveRequests(1,1,{status:'submitted'});
            if (pr.pagination) setPendingTotal(pr.pagination.totalItems||0);
          } else {
            setTotalItems(transformedRequests.length);
            setTotalPages(Math.ceil(transformedRequests.length/itemsPerPage));
            const pr = await getAllLeaveRequests(1,1,{status:'submitted'});
            if (pr.pagination) setPendingTotal(pr.pagination.totalItems||0);
            else setPendingTotal(transformedRequests.filter(r=>r.status==='Pending').length);
          }
        } else { setLeaveRequests([]); setTotalItems(0); setTotalPages(0); }

        const balancesResponse = await getUserLeaveBalance();
        if (balancesResponse.success && balancesResponse.leaveBalances) {
          setLeaveBalances(balancesResponse.leaveBalances.map(b => ({
            staffId: b.userId.toString(),
            sick:{used:b.usedDays,total:b.totalDays}, annual:{used:b.usedDays,total:b.totalDays,firstHalf:0,secondHalf:0,rollover:0},
            paternity:{used:b.usedDays,total:b.totalDays}, bereaved:{used:b.usedDays,total:b.totalDays}, maternity:{used:b.usedDays,total:b.totalDays}
          })));
        } else {
          setLeaveBalances([{staffId:'1',sick:{used:2,total:5},annual:{used:8,total:14,firstHalf:5,secondHalf:3,rollover:0},paternity:{used:0,total:3},bereaved:{used:1,total:3},maternity:{used:0,total:90}}]);
        }
      } catch (err) {
        setLeaveTypes([]); setLeaveRequests([]);
        setLeaveBalances([{staffId:'1',sick:{used:2,total:5},annual:{used:8,total:14,firstHalf:5,secondHalf:3,rollover:0},paternity:{used:0,total:3},bereaved:{used:1,total:3},maternity:{used:0,total:90}}]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [currentPage, filterStatus, filterLeaveType, searchTerm]);

  const getLeaveTypeIcon = () => Calendar;

  const openEditLeaveTypeModal = (displayType: any) => {
    const rawType = rawLeaveTypes.find(t => t.id === displayType.id);
    if (!rawType) return;
    setEditLeaveTypeForm({ id:rawType.id, name:rawType.name, description:rawType.description||'', daysPerYear:rawType.days_per_year||null, isPaid:rawType.is_paid||false, allowCarryover:rawType.allow_carryover||false, carryoverLimit:rawType.carryover_limit||null, expiryRuleId:rawType.expiry_rule_id||null });
    setShowEditLeaveTypeModal(true);
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate), end = new Date(endDate);
    return Math.ceil(Math.abs(end.getTime()-start.getTime())/(1000*60*60*24))+1;
  };

  const formatDate = (dateString: string|null|undefined, showTime=false): string => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString); if (isNaN(date.getTime())) return 'Invalid Date';
      if (showTime) return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
      return date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    } catch { return 'Invalid Date'; }
  };

  const formatDateShort = (dateString: string|null|undefined): string => {
    if (!dateString) return 'Not specified';
    try { const d = new Date(dateString); if (isNaN(d.getTime())) return 'Invalid Date'; return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return 'Invalid Date'; }
  };

  const formatFileSize = (bytes: number|string): string => {
    const n = typeof bytes==='string'?parseInt(bytes):bytes; if (n===0) return '0 Bytes';
    const k=1024,s=['Bytes','KB','MB','GB'],i=Math.floor(Math.log(n)/Math.log(k));
    return Math.round(n/Math.pow(k,i)*100)/100+' '+s[i];
  };

  const filteredRequests = leaveRequests;
  const startIndex = (currentPage-1)*itemsPerPage;
  const endIndex = startIndex+itemsPerPage;
  const paginatedRequests = filteredRequests;

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterLeaveType, selectedDepartment]);

  const totalRequests = totalItems;
  const approvedCount = leaveRequests.filter(r=>r.status==='Approved').length;
  const declinedCount = leaveRequests.filter(r=>r.status==='Declined').length;
  const activeCount = leaveRequests.filter(r=>r.status==='Active').length;
  const pendingCount = filterStatus==='pending'?pendingTotal:leaveRequests.filter(r=>r.status==='Pending').length;

  const handleApprovalAction = async (request: LeaveRequest, action: 'approve'|'decline') => {
    setApprovalAction(action);
    try {
      const fr = await getLeaveRequestFiles(parseInt(request.id));
      if (fr.success && fr.files && fr.files.length>0) setSelectedRequest({...request, attachments:fr.files});
      else setSelectedRequest(request);
    } catch { setSelectedRequest(request); }
    setShowApprovalModal(true);
  };

  const handleViewDetails = async (request: LeaveRequest) => {
    setSelectedRequest(request); setShowDetailsModal(true); setDetailsLoading(true);
    try {
      const response = await getLeaveRequestById(parseInt(request.id));
      if (response.success && response.leaveRequest) {
        let attachments = [];
        try { const fr = await getLeaveRequestFiles(parseInt(request.id)); if (fr.success) attachments = fr.files||[]; } catch {}
        setSelectedRequestDetails({...response.leaveRequest, attachments});
      }
    } catch {} finally { setDetailsLoading(false); }
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !approvalAction) return;
    try {
      setLoading(true);
      const response = await updateLeaveRequestStatus(parseInt(selectedRequest.id), approvalAction==='approve'?'approved':'rejected', approvalAction==='decline'?declineReason:undefined);
      if (response.success) {
        setLeaveRequests(prev=>prev.map(req=>req.id===selectedRequest.id?{...req,status:approvalAction==='approve'?'Approved':'Declined',approvedBy:approvalAction==='approve'?'Admin':undefined,approvalDate:approvalAction==='approve'?new Date().toISOString():undefined,declineReason:approvalAction==='decline'?declineReason:undefined}:req));
        setSuccessMessage(response.message||`Leave request ${approvalAction==='approve'?'approved':'rejected'} successfully`);
        setTimeout(()=>setSuccessMessage(null),3000);
      } else throw new Error(response.message||'Failed to process leave request');
      setShowApprovalModal(false); setSelectedRequest(null); setApprovalAction(null); setDeclineReason('');
    } catch (err: any) { setError(err.message||'An error occurred'); setTimeout(()=>setError(null),5000); }
    finally { setLoading(false); }
  };

  const handleCancelLeave = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      const response = await cancelLeaveRequest(parseInt(selectedRequest.id));
      if (response.success) {
        setLeaveRequests(prev=>prev.map(req=>req.id===selectedRequest.id?{...req,status:'Declined',declineReason:'Cancelled by HR'}:req));
        setSuccessMessage(response.message||'Leave request cancelled successfully');
        setTimeout(()=>setSuccessMessage(null),3000);
      } else throw new Error(response.message||'Failed to cancel leave request');
      setShowCancelModal(false); setSelectedRequest(null);
    } catch (err: any) { setError(err.message||'An error occurred'); setTimeout(()=>setError(null),5000); }
    finally { setLoading(false); }
  };

  const handleLeaveCleanup = async () => {
    try {
      setCleanupLoading(true); setError(null);
      const response = await triggerLeaveCleanup();
      if (response.success) {
        setSuccessMessage(`Cleanup successful! ${response.message}`);
        setCleanupStatus({...response.data, processed:response.data.declinedCount+response.data.errorCount});
        const rr = await getAllLeaveRequests(currentPage, itemsPerPage, { status:filterStatus!=='all'?filterStatus:undefined, leaveType:filterLeaveType!=='all'?filterLeaveType:undefined, search:searchTerm||undefined });
        if (rr.success && rr.leaveRequests) { setLeaveRequests(rr.leaveRequests); if (rr.pagination) { setTotalItems(rr.pagination.totalItems); setTotalPages(rr.pagination.totalPages); } }
        setTimeout(()=>{ setShowCleanupModal(false); setSuccessMessage(null); },2000);
      } else setError(response.message||'Cleanup failed');
    } catch (err) { setError(err instanceof Error?err.message:'An error occurred during cleanup'); }
    finally { setCleanupLoading(false); }
  };

  const handleFetchCleanupStatus = async () => {
    try { setCleanupLoading(true); const r = await getLeaveCleanupStatus(); if (r.success) setCleanupStatus(r.data); }
    catch {} finally { setCleanupLoading(false); }
  };

  const handleCreateLeaveType = async () => {
    try {
      setLoading(true); setError(null);
      const response = await createLeaveType({ name:createLeaveTypeForm.name, description:createLeaveTypeForm.description, daysPerYear:createLeaveTypeForm.daysPerYear, isPaid:createLeaveTypeForm.isPaid, allowCarryover:createLeaveTypeForm.allowCarryover, carryoverLimit:createLeaveTypeForm.allowCarryover?createLeaveTypeForm.carryoverLimit:undefined, accrualMethod:undefined, accrualRate:undefined });
      if (response.success) { setShowCreateLeaveTypeModal(false); setCreateLeaveTypeForm({name:'',description:'',daysPerYear:null,isPaid:true,allowCarryover:false,carryoverLimit:null,expiryRuleId:null}); alert('Leave type created successfully!'); }
      else throw new Error(response.message||'Failed to create leave type');
    } catch (err) { setError(err instanceof Error?err.message:'An error occurred'); }
    finally { setLoading(false); }
  };

  const handleEditLeaveType = async () => {
    try {
      setLoading(true); setError(null);
      const { updateLeaveType } = await import('../services/leaveManagementService');
      const response = await updateLeaveType(editLeaveTypeForm.id!, { name:editLeaveTypeForm.name, description:editLeaveTypeForm.description, daysPerYear:editLeaveTypeForm.daysPerYear, isPaid:editLeaveTypeForm.isPaid, allowCarryover:editLeaveTypeForm.allowCarryover, carryoverLimit:editLeaveTypeForm.allowCarryover?editLeaveTypeForm.carryoverLimit:undefined, accrualMethod:undefined, accrualRate:undefined });
      if (response.success) {
        setShowEditLeaveTypeModal(false); setEditLeaveTypeForm({id:null,name:'',description:'',daysPerYear:null,isPaid:true,allowCarryover:false,carryoverLimit:null,expiryRuleId:null});
        const tr = await getAllLeaveTypes();
        if (tr.success && tr.leaveTypes) setLeaveTypes(tr.leaveTypes.map((t:any)=>({type:t.name,limit:t.days_per_year,color:t.is_paid?T.primary:T.textMuted,description:t.description||`${t.days_per_year} days per year`})));
        alert('Leave type updated successfully!');
      } else throw new Error(response.message||'Failed to update leave type');
    } catch (err) { setError(err instanceof Error?err.message:'An error occurred'); }
    finally { setLoading(false); }
  };

  // ─── Render: Requests Tab ──────────────────────────────────────────────
  const renderRequestsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Pending requests banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          onClick={() => setFilterStatus('pending')}
          style={{
            ...card, flex: 1, padding: '1rem 1.25rem', cursor: 'pointer',
            borderTop: `3px solid ${T.warning}`, background: filterStatus==='pending' ? T.warningPale : T.surface,
            border: filterStatus==='pending' ? `1px solid ${T.warningBorder}` : `1px solid ${T.border}`,
            transition: 'box-shadow 0.15s, transform 0.15s',
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 14px rgba(15,23,42,.08)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='none';(e.currentTarget as HTMLDivElement).style.boxShadow=(card as any).boxShadow;}}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
              <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'10px', background:`${T.warning}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Clock size={17} color={T.warning}/>
              </div>
              <div>
                <p style={{ margin:0, fontSize:'0.72rem', fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Pending Requests</p>
                <p style={{ margin:'0.15rem 0 0', fontSize:'1.6rem', fontWeight:800, color:T.text, lineHeight:1 }}>{pendingCount}</p>
              </div>
            </div>
            {filterStatus==='pending' && <CheckCircle size={18} color={T.warning}/>}
          </div>
        </div>
        {filterStatus==='pending' && (
          <button style={btnOutline} onClick={()=>setFilterStatus('all')}><Calendar size={14}/>Show All</button>
        )}
      </div>

      {/* Search + Filters */}
      <div style={{ ...card, padding:'0.875rem 1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 230px', minWidth:'200px' }}>
            <Search size={13} color={T.textMuted} style={{ position:'absolute', left:'0.7rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input className="lmv-inp" type="text" placeholder="Search by name, ID, department, reason…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
              style={{ ...inputS, paddingLeft:'2.1rem' }}/>
          </div>
          <button style={{ ...btnOutline, background:showFilters?T.primaryPale:T.surface, borderColor:showFilters?T.primaryBorder:T.border, color:showFilters?T.primary:T.textSub }}
            onClick={()=>setShowFilters(f=>!f)}>
            <Filter size={13}/>{showFilters?'Hide Filters':'More Filters'}
          </button>
          <button style={btnOutline}><Download size={13}/> Export</button>
        </div>

        {showFilters && (
          <div style={{ marginTop:'0.875rem', padding:'1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'10px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'0.875rem' }}>
            <FF label="Leave Type">
              <select className="lmv-inp" value={filterLeaveType} onChange={e=>setFilterLeaveType(e.target.value)} style={inputS}>
                <option value="all">All Types</option>
                {leaveTypes.map(t=><option key={t.type} value={t.type}>{t.type}</option>)}
              </select>
            </FF>
            <FF label="Department">
              <select className="lmv-inp" value={selectedDepartment} onChange={e=>setSelectedDepartment(e.target.value)} style={inputS}>
                <option value="all">All Departments</option>
                {['IT Department','Finance','Marketing','Human Resources','Operations','Sales'].map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </FF>
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <button style={{ ...btnOutline, width:'100%', justifyContent:'center' }}
                onClick={()=>{ setSearchTerm(''); setFilterStatus('all'); setFilterLeaveType('all'); setSelectedDepartment('all'); }}>
                <X size={13}/> Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Types Guide */}
      <div style={{ ...card, padding:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Info size={15} color={T.primary}/>
            <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:700, color:T.text }}>Leave Types &amp; Policies</h3>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button style={{ ...btnOutline, fontSize:'0.78rem', padding:'0.4rem 0.875rem' }}
              onClick={()=>{ handleFetchCleanupStatus(); setShowCleanupModal(true); }}>
              <Clock size={13}/> Cleanup Expired
            </button>
            <button style={{ ...btnPrimary, fontSize:'0.78rem', padding:'0.4rem 0.875rem' }}
              onClick={()=>setShowCreateLeaveTypeModal(true)}>
              + Create Leave Type
            </button>
          </div>
        </div>

        {leaveTypes.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:'0.75rem' }}>
            {leaveTypes.map(type=>(
              <div key={type.id||type.type} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', borderRadius:'10px', background:T.surfaceAlt, border:`1px solid ${T.border}`, transition:'box-shadow 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 2px 10px rgba(15,23,42,.07)')}
                onMouseLeave={e=>(e.currentTarget.style.boxShadow='none')}>
                <div style={{ width:'2rem', height:'2rem', borderRadius:'7px', background:`${type.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Calendar size={14} color={type.color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontWeight:700, fontSize:'0.82rem', color:T.text }}>{type.type}</p>
                  <p style={{ margin:'0.1rem 0 0', fontSize:'0.7rem', color:T.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{type.description}</p>
                </div>
                <button onClick={()=>openEditLeaveTypeModal(type)} title="Edit"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'1.6rem', height:'1.6rem', border:`1px solid ${T.border}`, borderRadius:'6px', background:T.surface, cursor:'pointer', color:T.textMuted, transition:'all 0.12s', flexShrink:0 }}
                  onMouseEnter={e=>{(e.currentTarget.style.background=T.primaryPale);(e.currentTarget.style.color=T.primary);(e.currentTarget.style.borderColor=T.primaryBorder);}}
                  onMouseLeave={e=>{(e.currentTarget.style.background=T.surface);(e.currentTarget.style.color=T.textMuted);(e.currentTarget.style.borderColor=T.border);}}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="13" height="13">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'50%', background:T.primaryPale, border:`1px solid ${T.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.875rem' }}>
              <Calendar size={18} color={T.primary}/>
            </div>
            <p style={{ fontWeight:700, color:T.text, margin:'0 0 0.3rem' }}>No Leave Types Created Yet</p>
            <p style={{ fontSize:'0.82rem', color:T.textMuted, margin:'0 0 1rem' }}>Get started by creating your first leave type</p>
            <button style={btnPrimary} onClick={()=>setShowCreateLeaveTypeModal(true)}>Create Your First Leave Type</button>
          </div>
        )}
      </div>

      {/* Leave Requests Table */}
      <div style={{ ...card, overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:700, color:T.text }}>Leave Requests</h3>
            <p style={{ margin:'0.15rem 0 0', fontSize:'0.78rem', color:T.textMuted }}>
              Showing {startIndex+1}–{Math.min(endIndex, filteredRequests.length)} of {totalItems}
              {filterStatus!=='all' && <span style={{ color:T.primary, fontWeight:600 }}> · {filterStatus}</span>}
            </p>
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead>
              <tr>
                <Th ch="Employee"/><Th ch="Leave Details"/><Th ch="Period"/><Th ch="Duration"/><Th ch="Status"/><Th right ch="Actions"/>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map(request=>{
                const lti = leaveTypes.find(t=>t.type===request.leaveType);
                return (
                  <tr key={request.id} className="lmv-row" style={{ transition:'background 0.1s' }}>
                    <Td ch={
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <Avatar name={request.staffName} size={32}/>
                        <p style={{ margin:0, fontWeight:600, color:T.text, fontSize:'0.85rem' }}>{request.staffName}</p>
                      </div>
                    }/>
                    <Td ch={
                      <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                        <div style={{ width:'2rem', height:'2rem', borderRadius:'7px', background:`${lti?.color||T.primary}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Calendar size={12} color={lti?.color||T.primary}/>
                        </div>
                        <div>
                          <p style={{ margin:0, fontWeight:600, fontSize:'0.82rem', color:T.text }}>{request.leaveType} Leave</p>
                          <p style={{ margin:0, fontSize:'0.72rem', color:T.textMuted, maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{request.reason}</p>
                        </div>
                      </div>
                    }/>
                    <Td ch={
                      <div>
                        <p style={{ margin:0, fontSize:'0.8rem', fontWeight:500, color:T.text }}>
                          {new Date(request.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})} → {new Date(request.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </p>
                        <p style={{ margin:'0.15rem 0 0', fontSize:'0.72rem', color:T.textMuted }}>
                          Requested: {new Date(request.requestDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </p>
                      </div>
                    }/>
                    <Td ch={
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.55rem', borderRadius:'6px', fontSize:'0.75rem', fontWeight:700, background:`${lti?.color||T.primary}12`, color:lti?.color||T.primary }}>
                        <Clock size={10}/>{request.duration} day{request.duration>1?'s':''}
                      </span>
                    }/>
                    <Td ch={
                      <div>
                        <StatusBadge status={request.status}/>
                        {request.status==='Active' && (
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.7rem', color:T.textMuted }}>
                            Ends {new Date(request.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                          </p>
                        )}
                      </div>
                    }/>
                    <Td right ch={
                      request.status==='Pending' ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem' }}>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', borderRadius:'7px', border:`1px solid ${T.successBorder}`, background:T.successPale, color:T.success, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit' }}
                            onClick={()=>handleApprovalAction(request,'approve')}>
                            <Check size={12}/> Approve
                          </button>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', borderRadius:'7px', border:`1px solid ${T.dangerBorder}`, background:T.dangerPale, color:T.danger, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit' }}
                            onClick={()=>handleApprovalAction(request,'decline')}>
                            <X size={12}/> Decline
                          </button>
                        </div>
                      ) : request.status==='Approved' ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'0.4rem' }}>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', borderRadius:'7px', border:`1px solid ${T.border}`, background:T.surface, color:T.textSub, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit' }}
                            onClick={()=>handleViewDetails(request)}>
                            <FileText size={12}/> Details
                          </button>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', borderRadius:'7px', border:`1px solid ${T.dangerBorder}`, background:T.dangerPale, color:T.danger, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit' }}
                            onClick={()=>{ setSelectedRequest(request); setShowCancelModal(true); }}>
                            <X size={12}/> Cancel
                          </button>
                        </div>
                      ) : (
                        <button style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', borderRadius:'7px', border:`1px solid ${T.border}`, background:T.surface, color:T.textSub, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit' }}
                          onClick={()=>handleViewDetails(request)}>
                          <FileText size={12}/> Details
                        </button>
                      )
                    }/>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding:'0.875rem 1.25rem', borderTop:`1px solid ${T.border}`, background:T.surfaceAlt, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
            <p style={{ margin:0, fontSize:'0.78rem', color:T.textMuted }}>
              Showing <strong style={{ color:T.text }}>{startIndex+1}</strong>–<strong style={{ color:T.text }}>{Math.min(endIndex,totalItems)}</strong> of <strong style={{ color:T.text }}>{totalItems}</strong>
            </p>
            <div style={{ display:'flex', gap:'0.3rem', alignItems:'center' }}>
              <button className="lmv-pg" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}
                style={{ padding:'0.35rem 0.75rem', border:`1px solid ${T.border}`, borderRadius:'7px', background:T.surface, color:T.textSub, fontSize:'0.8rem', fontWeight:500, cursor:currentPage===1?'not-allowed':'pointer', opacity:currentPage===1?.4:1, fontFamily:'inherit', transition:'all 0.12s' }}>
                ← Prev
              </button>
              {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                let p: number;
                if (totalPages<=5) p=i+1;
                else if (currentPage<=3) p=i+1;
                else if (currentPage>=totalPages-2) p=totalPages-4+i;
                else p=currentPage-2+i;
                const active=currentPage===p;
                return <button key={p} onClick={()=>setCurrentPage(p)} className={!active?'lmv-pg':''}
                  style={{ width:'2rem', height:'2rem', border:active?'none':`1px solid ${T.border}`, borderRadius:'7px', background:active?T.primary:T.surface, color:active?'#fff':T.textSub, fontSize:'0.8rem', fontWeight:active?700:500, cursor:'pointer', fontFamily:'inherit', boxShadow:active?`0 1px 4px rgba(30,64,175,.25)`:'none', transition:'all 0.12s' }}>{p}</button>;
              })}
              {totalPages>5 && currentPage<totalPages-2 && <span style={{ color:T.textMuted, fontSize:'0.8rem', padding:'0 0.2rem' }}>…</span>}
              <button className="lmv-pg" disabled={currentPage>=totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}
                style={{ padding:'0.35rem 0.75rem', border:`1px solid ${T.border}`, borderRadius:'7px', background:T.surface, color:T.textSub, fontSize:'0.8rem', fontWeight:500, cursor:currentPage>=totalPages?'not-allowed':'pointer', opacity:currentPage>=totalPages?.4:1, fontFamily:'inherit', transition:'all 0.12s' }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {filteredRequests.length===0 && !loading && (
          <div style={{ padding:'4rem', textAlign:'center' }}>
            <div style={{ width:'3.5rem', height:'3.5rem', borderRadius:'50%', background:T.surfaceMuted, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.875rem' }}>
              <Calendar size={18} color={T.textMuted}/>
            </div>
            <p style={{ fontWeight:600, color:T.text, margin:'0 0 0.3rem' }}>No leave requests found</p>
            <p style={{ fontSize:'0.8rem', color:T.textMuted, margin:0 }}>
              {searchTerm||filterStatus!=='all'||filterLeaveType!=='all'||selectedDepartment!=='all'?'Try adjusting your filters':'Leave requests will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Render: Report Tab ───────────────────────────────────────────────
  const renderReportTab = () => {
    const leaveByType = leaveTypes.map(type=>({
      type:type.type, count:leaveRequests.filter(r=>r.leaveType===type.type&&r.status==='Approved').length,
      days:leaveRequests.filter(r=>r.leaveType===type.type&&r.status==='Approved').reduce((s,r)=>s+r.duration,0),
      icon:type.icon, color:type.color
    }));
    const uniqueDepts = [...new Set(leaveRequests.map(r=>r.department))];
    const deptStats = uniqueDepts.map(dept=>({
      dept, count:leaveRequests.filter(r=>r.department===dept&&r.status==='Approved').length,
      days:leaveRequests.filter(r=>r.department===dept&&r.status==='Approved').reduce((s,r)=>s+r.duration,0)
    }));

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {/* Summary stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'0.875rem' }}>
          {[
            { label:'Total Leave Days', value:leaveRequests.filter(r=>r.status==='Approved').reduce((s,r)=>s+r.duration,0), icon:Calendar,      accent:T.primary,  pale:T.primaryPale  },
            { label:'On Leave Now',     value:activeCount, icon:User,         accent:T.success,  pale:T.successPale  },
            { label:'Approval Rate',    value:`${approvedCount+declinedCount>0?((approvedCount/(approvedCount+declinedCount))*100).toFixed(0):0}%`, icon:TrendingUp, accent:T.warning, pale:T.warningPale },
            { label:'Pending Review',   value:pendingCount, icon:AlertCircle,  accent:T.danger,   pale:T.dangerPale   },
          ].map(({label,value,icon:Icon,accent,pale})=>(
            <div key={label} style={{ ...card, padding:'1rem 1.25rem', borderTop:`3px solid ${accent}`, background:pale }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'10px', background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={17} color={accent}/>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'0.68rem', fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
                  <p style={{ margin:'0.15rem 0 0', fontSize:'1.5rem', fontWeight:800, color:T.text, lineHeight:1 }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave by type */}
        <div style={{ ...card, padding:'1.25rem' }}>
          <h3 style={{ margin:'0 0 1.1rem', fontSize:'0.95rem', fontWeight:700, color:T.text }}>Leave Distribution by Type</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {leaveByType.map(item=>{
              const maxDays = Math.max(...leaveByType.map(d=>d.days), 1);
              return (
                <div key={item.type}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <div style={{ width:'1.6rem', height:'1.6rem', borderRadius:'5px', background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Calendar size={11} color={item.color}/>
                      </div>
                      <span style={{ fontSize:'0.82rem', fontWeight:600, color:T.text }}>{item.type}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                      <span style={{ fontSize:'0.75rem', color:T.textMuted }}>{item.count} requests</span>
                      <span style={{ fontWeight:700, color:T.text, fontSize:'0.875rem' }}>{item.days} days</span>
                    </div>
                  </div>
                  <div style={{ height:'5px', background:T.surfaceMuted, borderRadius:'99px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${item.days>0?(item.days/maxDays)*100:0}%`, background:item.color, borderRadius:'99px', transition:'width 0.4s' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department breakdown */}
        <div style={{ ...card, padding:'1.25rem' }}>
          <h3 style={{ margin:'0 0 1.1rem', fontSize:'0.95rem', fontWeight:700, color:T.text }}>Leave by Department</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {deptStats.map((item,i)=>{
              const maxDays = Math.max(...deptStats.map(d=>d.days), 1);
              return (
                <div key={i}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                    <span style={{ fontSize:'0.82rem', color:T.textSub, fontWeight:500 }}>{item.dept}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                      <span style={{ fontSize:'0.75rem', color:T.textMuted }}>{item.count} requests</span>
                      <span style={{ fontWeight:700, color:T.text, fontSize:'0.875rem' }}>{item.days} days</span>
                    </div>
                  </div>
                  <div style={{ height:'5px', background:T.surfaceMuted, borderRadius:'99px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${item.days>0?(item.days/maxDays)*100:0}%`, background:T.primaryLight, borderRadius:'99px', transition:'width 0.4s' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── Modal helpers: Leave details rows ────────────────────────────────
  const InfoRow = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) => (
    <div style={{ padding:'0.875rem 1rem', background:accent?`${accent}08`:T.surfaceAlt, border:`1px solid ${accent?`${accent}25`:T.border}`, borderRadius:'9px' }}>
      <p style={{ margin:'0 0 0.3rem', fontSize:'0.68rem', fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</p>
      <div style={{ fontWeight:600, fontSize:'0.875rem', color:T.text }}>{value}</div>
    </div>
  );

  // ─── Main render ──────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', fontFamily:"'DM Sans','Geist',system-ui,sans-serif" }}>
      <style>{`
        .lmv-row:hover{background:${T.surfaceAlt}!important}
        .lmv-inp:focus{border-color:${T.primaryLight}!important;box-shadow:0 0 0 3px rgba(59,130,246,.12)!important}
        .lmv-pg:hover:not(:disabled){background:${T.primaryPale}!important;border-color:${T.primaryBorder}!important;color:${T.primary}!important}
        @keyframes lmvspin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Loading state */}
      {loading && (
        <div style={{ ...card, padding:'3rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem' }}>
          <div style={{ width:20, height:20, border:`2.5px solid ${T.primaryBorder}`, borderTopColor:T.primary, borderRadius:'50%', animation:'lmvspin 0.7s linear infinite' }}/>
          <span style={{ color:T.textSub, fontSize:'0.875rem' }}>Loading leave data…</span>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div style={{ padding:'0.75rem 1rem', background:T.dangerPale, border:`1px solid ${T.dangerBorder}`, borderRadius:'10px', display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <AlertCircle size={15} color={T.danger}/>
          <p style={{ margin:0, fontSize:'0.85rem', color:'#7f1d1d', flex:1, fontWeight:500 }}>{error}</p>
          <button onClick={()=>setError(null)} style={{ border:'none', background:'none', cursor:'pointer', color:T.danger, display:'flex' }}><X size={14}/></button>
        </div>
      )}

      {/* Success toast */}
      {successMessage && (
        <div style={{ padding:'0.75rem 1rem', background:T.successPale, border:`1px solid ${T.successBorder}`, borderRadius:'10px', display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <CheckCircle size={15} color={T.success}/>
          <p style={{ margin:0, fontSize:'0.85rem', color:'#065f46', flex:1, fontWeight:500 }}>{successMessage}</p>
          <button onClick={()=>setSuccessMessage(null)} style={{ border:'none', background:'none', cursor:'pointer', color:T.success, display:'flex' }}><X size={14}/></button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Tab bar */}
          <div style={{ ...card, padding:'0.35rem', display:'flex', gap:'0.25rem', background:T.surfaceAlt }}>
            {[
              { key:'requests', label:'Leave Requests', icon:Calendar },
              { key:'report',   label:'Leave Report',   icon:FileText  },
            ].map(({key,label,icon:Icon})=>{
              const active = activeTab===key;
              return (
                <button key={key} onClick={()=>setActiveTab(key as any)}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.6rem 0.75rem', borderRadius:'8px', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem', fontWeight:active?700:500, background:active?T.surface:'transparent', color:active?T.primary:T.textMuted, boxShadow:active?'0 1px 4px rgba(15,23,42,.08)':'none', transition:'all 0.15s' }}>
                  <Icon size={14}/>{label}
                  {active && <span style={{ width:4, height:4, borderRadius:'50%', background:T.primary, display:'inline-block', marginLeft:'0.1rem' }}/>}
                </button>
              );
            })}
          </div>

          {activeTab==='requests' && renderRequestsTab()}
          {activeTab==='report'   && renderReportTab()}

          {/* ── Approval Modal ───────────────────────────────────── */}
          {showApprovalModal && selectedRequest && (
            <>
              <div style={overlayS} onClick={()=>setShowApprovalModal(false)}/>
              <div style={modalShell('36rem')}>
                <MHead
                  icon={approvalAction==='approve'?Check:AlertCircle}
                  title={`${approvalAction==='approve'?'Approve':'Decline'} Leave Request`}
                  sub={`Request #${selectedRequest.id}`}
                  color={approvalAction==='approve'?T.success:T.danger}
                  onClose={()=>setShowApprovalModal(false)}
                />
                <div style={mBody}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {/* Employee */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'10px' }}>
                      <Avatar name={selectedRequest.staffName} size={44}/>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:'0.95rem', color:T.text }}>{selectedRequest.staffName}</p>
                        <p style={{ margin:'0.2rem 0 0', fontSize:'0.78rem', color:T.textMuted }}>{selectedRequest.staffId} · {selectedRequest.department}</p>
                      </div>
                      <StatusBadge status={selectedRequest.status}/>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <InfoRow label="Leave Type" value={selectedRequest.leaveType} accent={T.primary}/>
                      <InfoRow label="Duration" value={`${selectedRequest.duration} ${selectedRequest.duration>1?'days':'day'}`} accent={T.purple}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <InfoRow label="Start Date" value={new Date(selectedRequest.startDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}/>
                      <InfoRow label="End Date" value={new Date(selectedRequest.endDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}/>
                    </div>
                    <InfoRow label="Reason for Leave" value={<p style={{ margin:0, fontSize:'0.85rem', lineHeight:1.6, color:T.textSub }}>{selectedRequest.reason}</p>}/>

                    {/* Attachments */}
                    {(selectedRequest as any).attachments?.length > 0 && (
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                          <Paperclip size={14} color={T.primary}/>
                          <span style={{ fontSize:'0.8rem', fontWeight:700, color:T.text }}>Attachments</span>
                          <span style={{ padding:'0.1rem 0.45rem', background:T.primaryPale, color:T.primary, border:`1px solid ${T.primaryBorder}`, borderRadius:'100px', fontSize:'0.68rem', fontWeight:700 }}>{(selectedRequest as any).attachments.length}</span>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                          {(selectedRequest as any).attachments.map((att: any, i: number) => {
                            const fileName = att.file_name||att.name||`Attachment ${i+1}`;
                            const filePath = att.file_path||att.path||att.file_url||'#';
                            const mimeType = att.mime_type||att.file_type||'';
                            const fileSize = att.file_size;
                            const isImage = mimeType.includes('image')||fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const isPDF = mimeType.includes('pdf')||fileName.match(/\.pdf$/i);
                            return (
                              <a key={i} href={`${filePath.startsWith('http')?filePath:`http://localhost:3000${filePath}`}`} target="_blank" rel="noopener noreferrer"
                                style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'9px', textDecoration:'none', transition:'box-shadow 0.15s, border-color 0.15s' }}
                                onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor=T.primaryBorder;(e.currentTarget as HTMLAnchorElement).style.boxShadow='0 2px 10px rgba(15,23,42,.08)';}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor=T.border;(e.currentTarget as HTMLAnchorElement).style.boxShadow='none';}}>
                                <div style={{ width:'2.25rem', height:'2.25rem', borderRadius:'7px', background:isImage?T.purplePale:isPDF?T.dangerPale:T.primaryPale, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  {isImage?<Image size={14} color={T.purple}/>:<FileText size={14} color={isPDF?T.danger:T.primary}/>}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ margin:0, fontWeight:600, fontSize:'0.82rem', color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fileName}</p>
                                  <p style={{ margin:0, fontSize:'0.7rem', color:T.textMuted }}>{mimeType.split('/')[1]?.toUpperCase()||'Document'}{fileSize&&` · ${formatFileSize(fileSize)}`}</p>
                                </div>
                                <ExternalLink size={14} color={T.primary}/>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Policy warning */}
                    {selectedRequest.leaveType==='Annual' && selectedRequest.duration>7 && approvalAction==='approve' && (
                      <div style={{ padding:'0.875rem 1rem', background:T.dangerPale, border:`1px solid ${T.dangerBorder}`, borderRadius:'9px', display:'flex', alignItems:'flex-start', gap:'0.6rem' }}>
                        <AlertCircle size={15} color={T.danger} style={{ marginTop:1, flexShrink:0 }}/>
                        <div>
                          <p style={{ margin:0, fontWeight:700, fontSize:'0.8rem', color:'#7f1d1d' }}>Policy Violation</p>
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.8rem', color:'#991b1b', lineHeight:1.5 }}>This annual leave request exceeds the 7-day limit. Please request the employee to split this into separate requests.</p>
                        </div>
                      </div>
                    )}

                    {/* Decline reason */}
                    {approvalAction==='decline' && (
                      <div>
                        <label style={labelS}>Decline Reason <span style={{ color:T.danger }}>*</span></label>
                        <textarea className="lmv-inp" placeholder="Please provide a detailed reason for declining this request…" value={declineReason} onChange={e=>setDeclineReason(e.target.value)}
                          style={{ ...inputS, minHeight:'110px', resize:'vertical' } as React.CSSProperties}/>
                      </div>
                    )}
                  </div>
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>setShowApprovalModal(false)}>Cancel</button>
                  <button style={approvalAction==='approve'?btnSuccess:btnDanger} onClick={confirmApproval}
                    disabled={(approvalAction==='decline'&&!declineReason.trim())||(approvalAction==='approve'&&selectedRequest.leaveType==='Annual'&&selectedRequest.duration>7)}>
                    {approvalAction==='approve'?<><Check size={14}/> Approve Request</>:<><X size={14}/> Decline Request</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Cancel Modal ──────────────────────────────────────── */}
          {showCancelModal && selectedRequest && (
            <>
              <div style={overlayS} onClick={()=>setShowCancelModal(false)}/>
              <div style={modalShell('34rem')}>
                <MHead icon={AlertCircle} title="Cancel Leave Request" sub={`Request #${selectedRequest.id}`} color={T.danger} onClose={()=>setShowCancelModal(false)}/>
                <div style={mBody}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div style={{ padding:'0.875rem 1rem', background:T.dangerPale, border:`1px solid ${T.dangerBorder}`, borderRadius:'9px', display:'flex', alignItems:'flex-start', gap:'0.6rem' }}>
                      <AlertCircle size={15} color={T.danger} style={{ marginTop:1, flexShrink:0 }}/>
                      <div>
                        <p style={{ margin:0, fontWeight:700, fontSize:'0.85rem', color:'#7f1d1d' }}>Warning: This action will cancel the approved leave</p>
                        <p style={{ margin:'0.25rem 0 0', fontSize:'0.8rem', color:'#991b1b', lineHeight:1.5 }}>The employee's leave balance will be restored and the leave request will be marked as declined. This action cannot be undone.</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'10px' }}>
                      <Avatar name={selectedRequest.staffName} size={44}/>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontWeight:700, fontSize:'0.95rem', color:T.text }}>{selectedRequest.staffName}</p>
                        <p style={{ margin:'0.2rem 0 0', fontSize:'0.78rem', color:T.textMuted }}>{selectedRequest.staffId} · {selectedRequest.department}</p>
                      </div>
                      <StatusBadge status={selectedRequest.status}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <InfoRow label="Leave Type" value={selectedRequest.leaveType} accent={T.primary}/>
                      <InfoRow label="Duration" value={`${selectedRequest.duration} ${selectedRequest.duration>1?'days':'day'}`} accent={T.purple}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <InfoRow label="Start Date" value={new Date(selectedRequest.startDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}/>
                      <InfoRow label="End Date" value={new Date(selectedRequest.endDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}/>
                    </div>
                    <InfoRow label="Reason for Leave" value={<p style={{ margin:0, fontSize:'0.85rem', lineHeight:1.6, color:T.textSub }}>{selectedRequest.reason}</p>}/>
                  </div>
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>setShowCancelModal(false)}>Go Back</button>
                  <button style={btnDanger} onClick={handleCancelLeave} disabled={loading}>
                    {loading?<><Clock size={14} style={{animation:'lmvspin 0.7s linear infinite'}}/> Cancelling…</>:<><X size={14}/> Cancel Leave Request</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Details Modal ─────────────────────────────────────── */}
          {showDetailsModal && selectedRequest && (
            <>
              <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', backdropFilter:'blur(3px)', zIndex:40 }} onClick={()=>{ setShowDetailsModal(false); setSelectedRequestDetails(null); }}/>
              <div style={{ ...modalShell('44rem'), zIndex:50, top:'50%', left:'50%', transform:'translate(-50%,-50%)', position:'fixed' }} onClick={e=>e.stopPropagation()}>
                <MHead icon={FileText} title="Leave Request Details" sub={`Request #${selectedRequest.id}`} color={T.primary} onClose={()=>{ setShowDetailsModal(false); setSelectedRequestDetails(null); }}/>
                <div style={mBody}>
                  {detailsLoading ? (
                    <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
                      <div style={{ width:24, height:24, border:`2.5px solid ${T.primaryBorder}`, borderTopColor:T.primary, borderRadius:'50%', animation:'lmvspin 0.7s linear infinite' }}/>
                    </div>
                  ) : selectedRequestDetails ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                      {/* Employee header */}
                      <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'10px' }}>
                        <Avatar name={selectedRequestDetails.user_name||selectedRequest.staffName} size={52}/>
                        <div style={{ flex:1 }}>
                          <p style={{ margin:0, fontWeight:700, fontSize:'1rem', color:T.text }}>{selectedRequestDetails.user_name||selectedRequest.staffName}</p>
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.78rem', color:T.textMuted }}>ID: {selectedRequestDetails.user_id} · {selectedRequest.department} · {selectedRequest.branch}</p>
                        </div>
                        <StatusBadge status={selectedRequestDetails.status}/>
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                        <InfoRow label="Leave Type" value={selectedRequestDetails.leave_type_name||selectedRequest.leaveType} accent={T.primary}/>
                        <InfoRow label="Days Requested" value={`${selectedRequestDetails.days_requested||selectedRequest.duration} days`} accent={T.warning}/>
                        <InfoRow label="Submitted" value={formatDateShort(selectedRequestDetails.created_at)}/>
                        <InfoRow label="Status" value={<span style={{ textTransform:'capitalize' }}>{selectedRequestDetails.status}</span>}/>
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                        <InfoRow label="Start Date" value={formatDate(selectedRequestDetails.start_date)}/>
                        <InfoRow label="End Date" value={formatDate(selectedRequestDetails.end_date)}/>
                      </div>

                      <InfoRow label="Reason for Leave" value={<p style={{ margin:0, fontSize:'0.85rem', lineHeight:1.6, color:T.textSub }}>{selectedRequestDetails.reason}</p>}/>

                      {/* Attachments */}
                      {selectedRequestDetails.attachments?.length>0 && (
                        <div>
                          <p style={{ margin:'0 0 0.6rem', fontSize:'0.72rem', fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                            <Paperclip size={11}/> Attachments ({selectedRequestDetails.attachments.length})
                          </p>
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                            {selectedRequestDetails.attachments.map((att: any, i: number) => (
                              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', padding:'0.75rem 1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'9px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', flex:1, minWidth:0 }}>
                                  <div style={{ width:'2rem', height:'2rem', borderRadius:'6px', background:att.mime_type?.includes('pdf')?T.dangerPale:T.primaryPale, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <FileText size={12} color={att.mime_type?.includes('pdf')?T.danger:T.primary}/>
                                  </div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ margin:0, fontWeight:600, fontSize:'0.8rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:T.text }}>{att.file_name||`Attachment ${i+1}`}</p>
                                    <p style={{ margin:0, fontSize:'0.68rem', color:T.textMuted }}>{att.mime_type||'Unknown'}{att.file_size&&` · ${Math.round(att.file_size/1024)} KB`}</p>
                                  </div>
                                </div>
                                <div style={{ display:'flex', gap:'0.4rem' }}>
                                  {att.file_path && (
                                    <button onClick={()=>setViewingAttachment(att)}
                                      style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.6rem', border:`1px solid ${T.border}`, borderRadius:'6px', background:T.surface, color:T.textSub, cursor:'pointer', fontSize:'0.72rem', fontWeight:600, fontFamily:'inherit' }}>
                                      <Eye size={11}/> View
                                    </button>
                                  )}
                                  <a href={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${att.file_path}`} download={att.file_name}
                                    style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.6rem', border:'none', borderRadius:'6px', background:T.primary, color:'#fff', cursor:'pointer', fontSize:'0.72rem', fontWeight:600, textDecoration:'none' }}>
                                    <Download size={11}/> Download
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Approval info */}
                      {(selectedRequestDetails.reviewed_by||selectedRequestDetails.reviewed_at) && (
                        <div style={{ padding:'0.875rem 1rem', background:selectedRequestDetails.status==='approved'?T.successPale:T.dangerPale, border:`1px solid ${selectedRequestDetails.status==='approved'?T.successBorder:T.dangerBorder}`, borderRadius:'9px' }}>
                          <p style={{ margin:'0 0 0.6rem', fontSize:'0.68rem', fontWeight:700, color:selectedRequestDetails.status==='approved'?T.success:T.danger, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                            {selectedRequestDetails.status==='approved'?'Approval Information':'Rejection Information'}
                          </p>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                            <div>
                              <p style={{ margin:0, fontSize:'0.7rem', color:T.textMuted }}>By</p>
                              <p style={{ margin:'0.1rem 0 0', fontWeight:600, fontSize:'0.82rem', color:T.text }}>{selectedRequestDetails.reviewed_by_name||'Admin'}</p>
                            </div>
                            <div>
                              <p style={{ margin:0, fontSize:'0.7rem', color:T.textMuted }}>Date</p>
                              <p style={{ margin:'0.1rem 0 0', fontWeight:600, fontSize:'0.82rem', color:T.text }}>{selectedRequestDetails.reviewed_at&&formatDate(selectedRequestDetails.reviewed_at,true)}</p>
                            </div>
                          </div>
                          {selectedRequestDetails.notes && (
                            <div style={{ marginTop:'0.6rem', paddingTop:'0.6rem', borderTop:`1px solid rgba(0,0,0,.08)` }}>
                              <p style={{ margin:0, fontSize:'0.7rem', color:T.textMuted, marginBottom:'0.25rem' }}>Comments</p>
                              <p style={{ margin:0, fontSize:'0.82rem', lineHeight:1.5, color:T.text }}>{selectedRequestDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding:'3rem', textAlign:'center' }}>
                      <AlertCircle size={36} color={T.warning} style={{ margin:'0 auto 0.875rem' }}/>
                      <p style={{ fontWeight:600, color:T.text, margin:'0 0 0.3rem' }}>Unable to load details</p>
                      <p style={{ fontSize:'0.8rem', color:T.textMuted, margin:0 }}>Please try again later</p>
                    </div>
                  )}
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>{ setShowDetailsModal(false); setSelectedRequestDetails(null); }}>Close</button>
                </div>
              </div>
            </>
          )}

          {/* ── Create Leave Type Modal ───────────────────────────── */}
          {showCreateLeaveTypeModal && (
            <>
              <div style={overlayS} onClick={()=>setShowCreateLeaveTypeModal(false)}/>
              <div style={modalShell('30rem')}>
                <MHead icon={Calendar} title="Create Leave Type" sub="Define a new leave policy" color={T.primary} onClose={()=>setShowCreateLeaveTypeModal(false)}/>
                <div style={mBody}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <FF label="Name" required>
                      <input className="lmv-inp" type="text" value={createLeaveTypeForm.name} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,name:e.target.value})} placeholder="e.g. Annual Leave" style={inputS}/>
                    </FF>
                    <FF label="Description">
                      <textarea className="lmv-inp" value={createLeaveTypeForm.description} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,description:e.target.value})} placeholder="Brief description" rows={2} style={{...inputS, resize:'vertical'} as React.CSSProperties}/>
                    </FF>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                      <FF label="Days Per Year" required>
                        <input className="lmv-inp" type="number" value={createLeaveTypeForm.daysPerYear||''} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,daysPerYear:e.target.value?parseInt(e.target.value):null})} min="0" style={inputS}/>
                      </FF>
                      <FF label="Paid Leave">
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
                          <input type="checkbox" className="toggle" checked={createLeaveTypeForm.isPaid} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,isPaid:e.target.checked})} style={{ accentColor:T.primary, width:16, height:16 }}/>
                          <span style={{ fontSize:'0.875rem', color:T.textSub }}>{createLeaveTypeForm.isPaid?'Yes':'No'}</span>
                        </div>
                      </FF>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                      <FF label="Allow Carryover">
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
                          <input type="checkbox" className="toggle" checked={createLeaveTypeForm.allowCarryover} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,allowCarryover:e.target.checked})} style={{ accentColor:T.primary, width:16, height:16 }}/>
                          <span style={{ fontSize:'0.875rem', color:T.textSub }}>{createLeaveTypeForm.allowCarryover?'Yes':'No'}</span>
                        </div>
                      </FF>
                      {createLeaveTypeForm.allowCarryover && (
                        <FF label="Carryover Limit">
                          <input className="lmv-inp" type="number" value={createLeaveTypeForm.carryoverLimit||''} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,carryoverLimit:e.target.value?parseInt(e.target.value):null})} min="0" style={inputS}/>
                        </FF>
                      )}
                    </div>
                    <FF label="Expiry Rule ID">
                      <input className="lmv-inp" type="number" value={createLeaveTypeForm.expiryRuleId||''} onChange={e=>setCreateLeaveTypeForm({...createLeaveTypeForm,expiryRuleId:e.target.value?parseInt(e.target.value):null})} min="1" style={inputS}/>
                    </FF>
                  </div>
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>setShowCreateLeaveTypeModal(false)}>Cancel</button>
                  <button style={{ ...btnPrimary, opacity:(!createLeaveTypeForm.name||createLeaveTypeForm.daysPerYear===null||createLeaveTypeForm.daysPerYear<0)?.45:1, cursor:(!createLeaveTypeForm.name||createLeaveTypeForm.daysPerYear===null||createLeaveTypeForm.daysPerYear<0)?'not-allowed':'pointer' }}
                    onClick={handleCreateLeaveType} disabled={!createLeaveTypeForm.name||createLeaveTypeForm.daysPerYear===null||createLeaveTypeForm.daysPerYear<0}>
                    Create Leave Type
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Edit Leave Type Modal ─────────────────────────────── */}
          {showEditLeaveTypeModal && (
            <>
              <div style={overlayS} onClick={()=>setShowEditLeaveTypeModal(false)}/>
              <div style={modalShell('30rem')}>
                <MHead icon={Calendar} title="Edit Leave Type" sub="Update leave policy settings" color={T.warning} onClose={()=>setShowEditLeaveTypeModal(false)}/>
                <div style={mBody}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <FF label="Name" required>
                      <input className="lmv-inp" type="text" value={editLeaveTypeForm.name} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,name:e.target.value})} placeholder="Enter leave type name" style={inputS}/>
                    </FF>
                    <FF label="Description">
                      <textarea className="lmv-inp" value={editLeaveTypeForm.description} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,description:e.target.value})} placeholder="Enter description" rows={2} style={{...inputS, resize:'vertical'} as React.CSSProperties}/>
                    </FF>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                      <FF label="Days Per Year" required>
                        <input className="lmv-inp" type="number" value={editLeaveTypeForm.daysPerYear||''} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,daysPerYear:e.target.value?parseInt(e.target.value):null})} min="0" style={inputS}/>
                      </FF>
                      <FF label="Paid Leave">
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
                          <input type="checkbox" className="toggle" checked={editLeaveTypeForm.isPaid} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,isPaid:e.target.checked})} style={{ accentColor:T.primary, width:16, height:16 }}/>
                          <span style={{ fontSize:'0.875rem', color:T.textSub }}>{editLeaveTypeForm.isPaid?'Yes':'No'}</span>
                        </div>
                      </FF>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                      <FF label="Allow Carryover">
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.25rem' }}>
                          <input type="checkbox" className="toggle" checked={editLeaveTypeForm.allowCarryover} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,allowCarryover:e.target.checked})} style={{ accentColor:T.primary, width:16, height:16 }}/>
                          <span style={{ fontSize:'0.875rem', color:T.textSub }}>{editLeaveTypeForm.allowCarryover?'Yes':'No'}</span>
                        </div>
                      </FF>
                      {editLeaveTypeForm.allowCarryover && (
                        <FF label="Carryover Limit">
                          <input className="lmv-inp" type="number" value={editLeaveTypeForm.carryoverLimit||''} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,carryoverLimit:e.target.value?parseInt(e.target.value):null})} min="0" style={inputS}/>
                        </FF>
                      )}
                    </div>
                    <FF label="Expiry Rule ID">
                      <input className="lmv-inp" type="number" value={editLeaveTypeForm.expiryRuleId||''} onChange={e=>setEditLeaveTypeForm({...editLeaveTypeForm,expiryRuleId:e.target.value?parseInt(e.target.value):null})} min="1" style={inputS}/>
                    </FF>
                  </div>
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>setShowEditLeaveTypeModal(false)}>Cancel</button>
                  <button style={{ ...btnPrimary, opacity:(!editLeaveTypeForm.name||editLeaveTypeForm.daysPerYear===null||editLeaveTypeForm.daysPerYear<0)?.45:1 }}
                    onClick={handleEditLeaveType} disabled={!editLeaveTypeForm.name||editLeaveTypeForm.daysPerYear===null||editLeaveTypeForm.daysPerYear<0}>
                    Update Leave Type
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Cleanup Modal ─────────────────────────────────────── */}
          {showCleanupModal && (
            <>
              <div style={overlayS} onClick={()=>setShowCleanupModal(false)}/>
              <div style={modalShell('32rem')} onClick={e=>e.stopPropagation()}>
                <MHead icon={Clock} title="Cleanup Expired Leave Requests" sub="Automatically decline pending requests with past dates" color={T.warning} onClose={()=>setShowCleanupModal(false)}/>
                <div style={mBody}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {cleanupStatus && (
                      <div style={{ padding:'1rem', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:'10px' }}>
                        <p style={{ margin:'0 0 0.75rem', fontSize:'0.72rem', fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:'0.4rem' }}><Info size={11}/>Current Status</p>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                          <div style={{ padding:'0.75rem 1rem', background:T.surface, border:`1px solid ${T.border}`, borderRadius:'8px' }}>
                            <p style={{ margin:0, fontSize:'0.72rem', color:T.textMuted }}>Total Pending</p>
                            <p style={{ margin:'0.15rem 0 0', fontSize:'1.4rem', fontWeight:800, color:T.text }}>{cleanupStatus.totalPendingLeaves||0}</p>
                          </div>
                          <div style={{ padding:'0.75rem 1rem', background:T.dangerPale, border:`1px solid ${T.dangerBorder}`, borderRadius:'8px' }}>
                            <p style={{ margin:0, fontSize:'0.72rem', color:T.danger }}>Expired Pending</p>
                            <p style={{ margin:'0.15rem 0 0', fontSize:'1.4rem', fontWeight:800, color:T.danger }}>{cleanupStatus.expiredPendingLeaves||0}</p>
                          </div>
                        </div>
                        {cleanupStatus.lastRunTime && <p style={{ margin:'0.75rem 0 0', fontSize:'0.75rem', color:T.textMuted }}>Last run: {new Date(cleanupStatus.lastRunTime).toLocaleString()}</p>}
                        {cleanupStatus.nextRunTime && <p style={{ margin:'0.25rem 0 0', fontSize:'0.75rem', color:T.textMuted }}>Next run: {new Date(cleanupStatus.nextRunTime).toLocaleString()}</p>}
                      </div>
                    )}

                    {cleanupStatus?.declinedCount!==undefined && (
                      <div style={{ padding:'0.875rem 1rem', background:T.successPale, border:`1px solid ${T.successBorder}`, borderRadius:'9px', display:'flex', alignItems:'flex-start', gap:'0.6rem' }}>
                        <CheckCircle size={15} color={T.success} style={{ marginTop:1, flexShrink:0 }}/>
                        <div>
                          <p style={{ margin:0, fontWeight:700, fontSize:'0.85rem', color:'#065f46' }}>Cleanup Results</p>
                          <p style={{ margin:'0.2rem 0 0', fontSize:'0.8rem', color:'#047857' }}>Processed {cleanupStatus.processed||0} requests · Declined {cleanupStatus.declinedCount} expired</p>
                          {cleanupStatus.errorCount>0 && <p style={{ margin:'0.2rem 0 0', fontSize:'0.8rem', color:T.warning }}>Errors: {cleanupStatus.errorCount}</p>}
                        </div>
                      </div>
                    )}

                    <div style={{ padding:'0.875rem 1rem', background:T.warningPale, border:`1px solid ${T.warningBorder}`, borderRadius:'9px', display:'flex', alignItems:'flex-start', gap:'0.6rem' }}>
                      <AlertCircle size={15} color={T.warning} style={{ marginTop:1, flexShrink:0 }}/>
                      <div>
                        <p style={{ margin:0, fontWeight:700, fontSize:'0.85rem', color:'#92400e' }}>What will happen?</p>
                        <ul style={{ margin:'0.4rem 0 0', paddingLeft:'1.1rem', fontSize:'0.8rem', color:'#b45309', lineHeight:1.8 }}>
                          <li>All pending leave requests with end dates in the past will be declined</li>
                          <li>Status will be changed to "rejected"</li>
                          <li>Notes will be set to "Automatically declined: Leave dates have passed"</li>
                          <li>This action cannot be undone automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={mFoot}>
                  <button style={btnOutline} onClick={()=>setShowCleanupModal(false)} disabled={cleanupLoading}>Cancel</button>
                  <button style={btnPrimary} onClick={handleLeaveCleanup} disabled={cleanupLoading}>
                    {cleanupLoading?<><Clock size={14} style={{animation:'lmvspin 0.7s linear infinite'}}/> Running…</>:<><Check size={14}/> Run Cleanup Now</>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Attachment Viewer Modal ───────────────────────────── */}
          {viewingAttachment && (
            <>
              <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(3px)', zIndex:40 }} onClick={()=>setViewingAttachment(null)}/>
              <div style={{ ...modalShell('56rem'), maxHeight:'88vh', zIndex:50, top:'50%', left:'50%', transform:'translate(-50%,-50%)', position:'fixed' }}>
                <div style={mHead}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <FileText size={18} color={T.primary}/>
                    <div>
                      <p style={{ margin:0, fontSize:'0.9rem', fontWeight:700, color:T.text }}>{viewingAttachment.file_name||'Attachment'}</p>
                      <p style={{ margin:0, fontSize:'0.72rem', color:T.textMuted }}>{viewingAttachment.mime_type||'Unknown'}{viewingAttachment.file_size&&` · ${Math.round(viewingAttachment.file_size/1024)} KB`}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <a href={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${viewingAttachment.file_path}`} download={viewingAttachment.file_name}
                      style={{ ...btnPrimary, textDecoration:'none' }}><Download size={13}/> Download</a>
                    <a href={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${viewingAttachment.file_path}`} target="_blank" rel="noopener noreferrer"
                      style={{ ...btnOutline, textDecoration:'none' }}><Eye size={13}/> Full Screen</a>
                    <button onClick={()=>setViewingAttachment(null)} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'1.75rem', height:'1.75rem', border:'none', background:'transparent', cursor:'pointer', color:T.textMuted, borderRadius:'6px' }}><X size={16}/></button>
                  </div>
                </div>
                <div style={{ flex:1, overflow:'auto', background:T.surfaceMuted, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.25rem' }}>
                  {viewingAttachment.mime_type?.includes('image') ? (
                    <img src={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${viewingAttachment.file_path}`} alt={viewingAttachment.file_name||'Attachment'} style={{ maxWidth:'100%', maxHeight:'70vh', objectFit:'contain', borderRadius:'8px', boxShadow:'0 4px 24px rgba(15,23,42,.15)' }}/>
                  ) : viewingAttachment.mime_type?.includes('pdf') ? (
                    <iframe src={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${viewingAttachment.file_path}`} style={{ width:'100%', minHeight:'70vh', border:'none', borderRadius:'8px' }} title={viewingAttachment.file_name||'Attachment'}/>
                  ) : (
                    <div style={{ textAlign:'center', padding:'2rem', background:T.surface, borderRadius:'12px', boxShadow:'0 2px 12px rgba(15,23,42,.08)' }}>
                      <FileText size={48} color={T.primary} style={{ margin:'0 auto 1rem' }}/>
                      <p style={{ fontWeight:700, color:T.text, margin:'0 0 0.4rem' }}>{viewingAttachment.file_name||'Attachment'}</p>
                      <p style={{ color:T.textMuted, fontSize:'0.85rem', margin:'0 0 1.25rem' }}>This file type cannot be previewed. Please download to view.</p>
                      <a href={`${import.meta.env.VITE_API_Endpoint||'http://localhost:3000/api'}${viewingAttachment.file_path}`} download={viewingAttachment.file_name} style={{ ...btnPrimary, textDecoration:'none' }}><Download size={14}/> Download File</a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveManagementView;