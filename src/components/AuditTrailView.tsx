import { useState, useEffect } from 'react';
import { History, Search, RefreshCw, ChevronLeft, ChevronRight, User, Filter } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: number;
  before_data: string | null;
  after_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
}

const ENTITY_TYPES = ['', 'attendance', 'staff_branch_time_mapping', 'staff', 'user', 'leave_request', 'shift', 'role'];
const ACTIONS = ['', 'create', 'update', 'delete'];

export function AuditTrailView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total_records: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  };

  const fetchLogs = async (p: number = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: '50' });
      if (filterEntityType) params.append('entity_type', filterEntityType);
      if (filterAction) params.append('action', filterAction);

      const res = await axios.get(`${API_ENDPOINT}/audit-logs?${params.toString()}`, getAuthHeaders());
      const data = res.data?.data || {};
      setLogs(data.logs || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filterEntityType, filterAction]);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const actionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'badge-success',
      update: 'badge-warning',
      delete: 'badge-error',
    };
    return `badge ${colors[action] || 'badge-secondary'}`;
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Audit Trail</h1>
            <p className="page-subtitle">View all changes made across the system</p>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select className="input" value={filterEntityType} onChange={e => { setFilterEntityType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              {ENTITY_TYPES.filter(Boolean).map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select className="input" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
              <option value="">All Actions</option>
              {ACTIONS.filter(Boolean).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-outline self-end" onClick={() => fetchLogs(page)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell whitespace-nowrap">User</th>
                <th className="table-header-cell whitespace-nowrap">Action</th>
                <th className="table-header-cell whitespace-nowrap">Entity</th>
                <th className="table-header-cell whitespace-nowrap">Entity ID</th>
                <th className="table-header-cell whitespace-nowrap">Date</th>
                <th className="table-header-cell whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No audit logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <>
                    <tr key={log.id} className="table-row cursor-pointer" onClick={() => toggleExpand(log.id)}>
                      <td className="table-cell">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {log.user_name || `User #${log.user_id}`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={actionBadge(log.action)}>{log.action}</span>
                      </td>
                      <td className="table-cell text-sm">{log.entity_type}</td>
                      <td className="table-cell text-sm">{log.entity_id}</td>
                      <td className="table-cell text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="table-cell">
                        <button className="btn btn-sm btn-ghost" onClick={() => toggleExpand(log.id)}>
                          {expandedId === log.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr key={`${log.id}-details`}>
                        <td colSpan={6} className="bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {log.before_data && (
                              <div>
                                <p className="font-medium mb-1 text-gray-700">Before</p>
                                <pre className="bg-white border rounded p-2 text-xs overflow-auto max-h-40">
                                  {JSON.stringify(JSON.parse(log.before_data), null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.after_data && (
                              <div>
                                <p className="font-medium mb-1 text-gray-700">After</p>
                                <pre className="bg-white border rounded p-2 text-xs overflow-auto max-h-40">
                                  {JSON.stringify(JSON.parse(log.after_data), null, 2)}
                                </pre>
                              </div>
                            )}
                            {!log.before_data && !log.after_data && (
                              <p className="text-gray-500 col-span-2">No additional data recorded for this action.</p>
                            )}
                          </div>
                          {log.ip_address && (
                            <p className="text-xs text-gray-400 mt-2">IP: {log.ip_address}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages} ({pagination.total_records} records)
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
