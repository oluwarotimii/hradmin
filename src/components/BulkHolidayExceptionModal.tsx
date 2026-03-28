// BulkHolidayExceptionModal.tsx
// Modal for creating bulk shift exceptions for holiday staffing

import React, { useState, useEffect } from 'react';
import { X, Users, Clock, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

interface BulkHolidayExceptionModalProps {
  holiday: {
    id: number;
    holiday_name: string;
    date: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface StaffMember {
  user_id: number;
  full_name: string;
  email: string;
  employee_id?: string;
  department?: string;
}

const BulkHolidayExceptionModal: React.FC<BulkHolidayExceptionModalProps> = ({
  holiday,
  onClose,
  onSuccess
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all staff on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_ENDPOINT}/staff?paginate=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data) {
        setStaff(response.data.data.staff || []);
      }
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffSelection = (userId: number) => {
    setSelectedStaff(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    const filteredIds = filteredStaff.map(s => s.user_id);
    setSelectedStaff(filteredIds);
  };

  const deselectAll = () => {
    setSelectedStaff([]);
  };

  const filteredStaff = staff.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (selectedStaff.length === 0) {
      setError('Please select at least one staff member');
      return;
    }

    if (!workStartTime || !workEndTime) {
      setError('Please set work start and end times');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken');
      
      // Call bulk exception endpoint
      const response = await axios.post(
        `${API_ENDPOINT}/shift-exceptions/bulk/holiday`,
        {
          holiday_id: holiday.id,
          date: new Date(holiday.date).toISOString().split('T')[0],
          staff_ids: selectedStaff,
          work_start_time: `${workStartTime}:00`,
          work_end_time: `${workEndTime}:00`,
          reason: reason || `Holiday work: ${holiday.holiday_name}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { created, failed } = response.data.data;
        setSuccess(`Successfully created ${created} exception(s)${failed > 0 ? ` (${failed} failed)` : ''}`);
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create exceptions');
      }
    } catch (err: any) {
      console.error('Error creating exceptions:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to create exceptions';
      setError(errorMsg);
      
      // If there are partial failures, show them
      if (err.response?.data?.data?.errors) {
        console.error('Failed exceptions:', err.response.data.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Design tokens
  const T = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryPale: '#eff6ff',
    primaryBorder: '#bfdbfe',
    success: '#059669',
    successPale: '#ecfdf5',
    successBorder: '#a7f3d0',
    danger: '#dc2626',
    dangerPale: '#fef2f2',
    dangerBorder: '#fecaca',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    surfaceMuted: '#f1f5f9',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    text: '#0f172a',
    textSub: '#475569',
    textMuted: '#94a3b8'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(3px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: T.surface,
        borderRadius: '12px',
        border: `1px solid ${T.border}`,
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: T.surfaceAlt
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: T.text
            }}>
              Assign Staff to Work on Holiday
            </h2>
            <p style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              color: T.textSub
            }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              {holiday.holiday_name} • {new Date(holiday.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.textMuted,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = T.surfaceMuted)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {/* Work Hours */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: T.surfaceAlt,
            borderRadius: '8px',
            border: `1px solid ${T.border}`
          }}>
            <h3 style={{
              margin: '0 0 0.75rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: T.text,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={16} color={T.primary} />
              Work Hours
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: '0.375rem'
                }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={e => setWorkStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1.5px solid ${T.border}`,
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: T.text,
                    background: T.surface,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: '0.375rem'
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={e => setWorkEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1.5px solid ${T.border}`,
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: T.text,
                    background: T.surface,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: T.text,
                marginBottom: '0.375rem'
              }}>
                Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g., Holiday Coverage, Customer Support"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: `1.5px solid ${T.border}`,
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: T.text,
                  background: T.surface,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Staff Selection */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: T.text,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={16} color={T.primary} />
                Select Staff ({selectedStaff.length})
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={selectAll}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: T.primary,
                    background: T.primaryPale,
                    border: `1px solid ${T.primaryBorder}`,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: T.textSub,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: `1.5px solid ${T.border}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: T.text,
                background: T.surface,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '0.75rem'
              }}
            />

            {/* Staff List */}
            <div style={{
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {loading ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: T.textMuted
                }}>
                  Loading staff...
                </div>
              ) : filteredStaff.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: T.textMuted
                }}>
                  No staff found
                </div>
              ) : (
                filteredStaff.map(staff => (
                  <div
                    key={staff.user_id}
                    onClick={() => toggleStaffSelection(staff.user_id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid ' + T.border,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: selectedStaff.includes(staff.user_id)
                        ? T.primaryPale
                        : T.surface,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = selectedStaff.includes(staff.user_id)
                      ? T.primaryPale
                      : T.surfaceMuted
                    )}
                    onMouseLeave={e => (e.currentTarget.style.background = selectedStaff.includes(staff.user_id)
                      ? T.primaryPale
                      : T.surface
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(staff.user_id)}
                      onChange={() => {}}
                      style={{
                        width: '1.125rem',
                        height: '1.125rem',
                        cursor: 'pointer',
                        accentColor: T.primary
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: T.text
                      }}>
                        {staff.full_name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: T.textSub,
                        marginTop: '0.125rem'
                      }}>
                        {staff.email}
                        {staff.employee_id && ` • ${staff.employee_id}`}
                        {staff.department && ` • ${staff.department}`}
                      </div>
                    </div>
                    {selectedStaff.includes(staff.user_id) && (
                      <CheckCircle size={18} color={T.primary} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: T.dangerPale,
              border: `1px solid ${T.dangerBorder}`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: T.danger
            }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: T.successPale,
              border: `1px solid ${T.successBorder}`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: T.success
            }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: '0.875rem' }}>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: T.surfaceAlt
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: T.textSub
          }}>
            {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: T.textSub,
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedStaff.length === 0}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#fff',
                background: (submitting || selectedStaff.length === 0) ? T.textMuted : T.primary,
                border: 'none',
                borderRadius: '6px',
                cursor: (submitting || selectedStaff.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (submitting || selectedStaff.length === 0) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: (submitting || selectedStaff.length === 0) ? 'none' : '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Creating...' : `Create ${selectedStaff.length} Exception${selectedStaff.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkHolidayExceptionModal;
