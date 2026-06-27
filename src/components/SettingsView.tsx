// src/components/SettingsView.tsx
// Simplified Settings - Only features with backend implementation

import React, { useState, useEffect } from 'react';
import {
  getBranchAttendanceSettings,
  updateBranchAttendanceSettings,
  getGlobalAttendanceSettings,
  updateGlobalAttendanceSettings,
} from '../services/attendanceSettingsService';
import {
  getLeavePolicy,
  updateLeavePolicy,
} from '../services/leavePolicyService';
import { getAllBranches, Branch } from '../services/branchManagementService';
import {
  Settings, Clock, Save, AlertCircle, MapPin, Timer, CheckCircle, X,
  Building, ChevronDown, Info, Calendar
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

// ─── Design tokens ────────────────────────────────────────────────────────
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
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
  surfaceMuted:  '#f1f5f9',
  border:        '#e2e8f0',
  borderStrong:  '#cbd5e1',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
};

// ─── Shared style primitives ──────────────────────────────────────────────
const card: React.CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
};

const inputS: React.CSSProperties = {
  width: '100%',
  padding: '0.575rem 0.875rem',
  border: `1.5px solid ${T.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: T.text,
  background: T.surface,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box' as const,
};

const labelS: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: T.textSub,
  marginBottom: '0.4rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const hintS: React.CSSProperties = {
  margin: '0.3rem 0 0',
  fontSize: '0.75rem',
  color: T.textMuted,
  lineHeight: 1.5,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.575rem 1.1rem',
  background: T.primary,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.13s',
  boxShadow: `0 1px 3px rgba(30,64,175,0.28)`,
  whiteSpace: 'nowrap' as const,
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.575rem 1.1rem',
  background: T.surface,
  color: T.textSub,
  border: `1.5px solid ${T.border}`,
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.13s',
  whiteSpace: 'nowrap' as const,
};

// ─── Reusable UI primitives ───────────────────────────────────────────────

/** Section container with title + description */
const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.75rem' }}>
    <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${T.border}` }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: T.text }}>{title}</p>
      {desc && <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: T.textMuted }}>{desc}</p>}
    </div>
    {children}
  </div>
);

/** Form field wrapper */
const Field = ({ label, hint, children, half }: { label: string; hint?: string; children: React.ReactNode; half?: boolean }) => (
  <div style={{ marginBottom: '1.1rem', width: half ? 'calc(50% - 0.4rem)' : '100%' }}>
    <label style={labelS}>{label}</label>
    {children}
    {hint && <p style={hintS}>{hint}</p>}
  </div>
);

/** Two-column grid */
const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>{children}</div>
);

/** Custom toggle switch */
const Toggle = ({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    id={id}
    onClick={() => onChange(!checked)}
    style={{
      position: 'relative',
      width: '2.75rem',
      height: '1.5rem',
      borderRadius: '99px',
      background: checked ? T.primary : T.borderStrong,
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.2s',
      flexShrink: 0,
      padding: 0,
    }}
  >
    <span style={{
      position: 'absolute',
      top: '2px',
      left: checked ? 'calc(100% - 1.25rem - 2px)' : '2px',
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }}/>
  </button>
);

/** Toggle row: label + description on left, toggle on right */
const ToggleRow = ({
  label,
  desc,
  checked,
  onChange,
  id,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.875rem 1rem',
    background: checked ? T.primaryPale : T.surfaceAlt,
    border: `1px solid ${checked ? T.primaryBorder : T.border}`,
    borderRadius: '10px',
    marginBottom: '0.875rem',
    transition: 'background 0.15s, border-color 0.15s',
  }}>
    <label htmlFor={id} style={{ flex: 1, cursor: 'pointer' }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: T.text }}>{label}</p>
      {desc && <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: T.textMuted, lineHeight: 1.45 }}>{desc}</p>}
    </label>
    <Toggle checked={checked} onChange={onChange} id={id} />
  </div>
);

/** Toast banner */
const Toast = ({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    background: type === 'success' ? T.successPale : T.dangerPale,
    border: `1px solid ${type === 'success' ? T.successBorder : T.dangerBorder}`,
    borderRadius: '10px',
    marginBottom: '1.25rem',
  }}>
    {type === 'success'
      ? <CheckCircle size={15} color={T.success}/>
      : <AlertCircle size={15} color={T.danger}/>}
    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, flex: 1, color: type === 'success' ? '#065f46' : '#7f1d1d' }}>{message}</p>
    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: type === 'success' ? T.success : T.danger, display: 'flex', padding: 0 }}>
      <X size={14}/>
    </button>
  </div>
);

/** Save footer bar */
const SaveBar = ({ onSave, loading, disabled }: { onSave: () => void; loading: boolean; disabled?: boolean }) => (
  <div style={{ paddingTop: '1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
    <button style={{ ...btnPrimary, opacity: (loading || disabled) ? 0.65 : 1, cursor: (loading || disabled) ? 'not-allowed' : 'pointer' }}
      onClick={onSave} disabled={loading || disabled}>
      {loading
        ? <><Timer size={15} style={{ animation: 'sv-spin 0.7s linear infinite' }}/> Saving…</>
        : <><Save size={15}/> Save Changes</>}
    </button>
  </div>
);

/** Branch selector used in every tab */
const BranchSelect = ({
  branches,
  value,
  onChange,
  disabled,
}: {
  branches: Branch[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => (
  <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: `1px solid ${T.border}` }}>
    <label style={labelS}>Branch</label>
    <div style={{ position: 'relative' }}>
      <Building size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="sv-inp"
        style={{ ...inputS, paddingLeft: '2.1rem', appearance: 'none', cursor: 'pointer' }}
      >
        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <ChevronDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
    </div>
    <p style={hintS}>Settings are applied per-branch. Select the branch you want to configure.</p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────
const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'working-days' | 'auto-mark' | 'leave-policy'>('attendance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);

  const [branchForm, setBranchForm] = useState({
    attendance_mode: 'branch_based' as 'branch_based' | 'multiple_locations' | 'flexible',
    grace_period_minutes: 0,
    auto_checkout_enabled: false,
    auto_checkout_minutes_after_close: 30,
    enable_location_verification: false,
    strict_location_mode: false,
    allow_manual_attendance_entry: true,
    auto_mark_absent_enabled: true,
    auto_mark_absent_time: '12:00',
    auto_mark_absent_timezone: 'Africa/Nairobi',
  });

  const [workingDaysLoading, setWorkingDaysLoading] = useState(false);
  const [leavePolicyLoading, setLeavePolicyLoading] = useState(false);
  const [leavePolicySaving, setLeavePolicySaving] = useState(false);
  const [leavePolicy, setLeavePolicy] = useState({
    exclude_sundays_from_leave: false,
  });
  const [globalSettings, setGlobalSettings] = useState({
    last_saturday_resumption_time: '10:30',
  });
  const [globalSettingsLoading, setGlobalSettingsLoading] = useState(false);
  const [globalSettingsSaving, setGlobalSettingsSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [workingDays, setWorkingDays] = useState<any[]>([
    { day_of_week: 'monday',    is_working_day: true,  start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'tuesday',   is_working_day: true,  start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'wednesday', is_working_day: true,  start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'thursday',  is_working_day: true,  start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'friday',    is_working_day: true,  start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 },
    { day_of_week: 'saturday',  is_working_day: false, start_time: '',       end_time: '',       break_duration_minutes: 0 },
    { day_of_week: 'sunday',    is_working_day: false, start_time: '',       end_time: '',       break_duration_minutes: 0 },
  ]);

  useEffect(() => {
    loadBranches();
    loadLeavePolicy();
    loadGlobalSettings();
  }, []);
  useEffect(() => { if (selectedBranchId) loadBranchSettings(Number(selectedBranchId)); }, [selectedBranchId]);

  const loadBranches = async () => {
    try {
      const response = await getAllBranches();
      if (response.success && response.branches) {
        setBranches(response.branches);
        if (response.branches.length > 0 && !selectedBranchId) setSelectedBranchId(String(response.branches[0].id));
      }
    } catch (err) { console.error('Error loading branches:', err); }
  };

  const loadBranchSettings = async (branchId: number) => {
    setBranchSettingsLoading(true);
    try {
      if (!branchId) return;
      const response = await getBranchAttendanceSettings(branchId);
      if (response.success && response.settings) {
        const s = response.settings;
        setBranchForm({
          attendance_mode: s.attendance_mode || 'branch_based',
          grace_period_minutes: s.grace_period_minutes ?? 0,
          auto_checkout_enabled: s.auto_checkout_enabled ?? false,
          auto_checkout_minutes_after_close: s.auto_checkout_minutes_after_close ?? 30,
          enable_location_verification: s.enable_location_verification ?? false,
          strict_location_mode: s.strict_location_mode ?? false,
          allow_manual_attendance_entry: s.allow_manual_attendance_entry ?? true,
          auto_mark_absent_enabled: s.auto_mark_absent_enabled ?? true,
          auto_mark_absent_time: s.auto_mark_absent_time || '12:00',
          auto_mark_absent_timezone: s.auto_mark_absent_timezone || 'Africa/Nairobi',
        });
      }
    } catch (err: any) { console.error('Error loading branch settings:', err); }
    finally { setBranchSettingsLoading(false); }
  };

  const handleSaveBranchSettings = async () => {
    if (!selectedBranchId) { setError('Please select a branch'); return; }
    setLoading(true); setError(null);
    try {
      const response = await updateBranchAttendanceSettings({ branchId: Number(selectedBranchId), settings: branchForm });
      if (response.success) { setSuccessMessage('Settings saved successfully'); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(response.message || 'Failed to save settings');
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setLoading(false); }
  };

  const handleSaveAutoMarkSettings = async () => {
    if (!selectedBranchId) { setError('Please select a branch'); return; }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINT}/attendance/settings/auto-mark`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: Number(selectedBranchId),
          auto_mark_absent_enabled: branchForm.auto_mark_absent_enabled,
          auto_mark_absent_time: branchForm.auto_mark_absent_time,
          auto_mark_absent_timezone: branchForm.auto_mark_absent_timezone,
        }),
      });
      const data = await response.json();
      if (data.success) { setSuccessMessage('Auto-mark settings saved successfully'); setTimeout(() => setSuccessMessage(null), 3000); }
      else setError(data.message || 'Failed to save auto-mark settings');
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setLoading(false); }
  };

  const loadLeavePolicy = async () => {
    setLeavePolicyLoading(true);
    try {
      const response = await getLeavePolicy();
      if (response.success && response.settings) {
        setLeavePolicy({
          exclude_sundays_from_leave: !!response.settings.exclude_sundays_from_leave,
        });
      }
    } catch (err) {
      console.error('Error loading leave policy:', err);
    } finally {
      setLeavePolicyLoading(false);
    }
  };

  const loadGlobalSettings = async () => {
    setGlobalSettingsLoading(true);
    try {
      const response = await getGlobalAttendanceSettings();
      if (response.success && response.settings) {
        setGlobalSettings({
          last_saturday_resumption_time: response.settings.last_saturday_resumption_time || '10:30',
        });
      }
    } catch (err) {
      console.error('Error loading global settings:', err);
    } finally {
      setGlobalSettingsLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setGlobalSettingsSaving(true); setError(null);
    try {
      const response = await updateGlobalAttendanceSettings({ settings: globalSettings });
      if (response.success) {
        setSuccessMessage('Global settings saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to save global settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setGlobalSettingsSaving(false);
    }
  };

  const handleReprocessLastSaturday = async () => {
    setReprocessing(true); setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setError('Not authenticated'); return; }
      const response = await fetch(`${API_ENDPOINT}/attendance/settings/reprocess-last-saturday`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(data.message || 'Failed to reprocess');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setReprocessing(false);
    }
  };

  const handleSaveLeavePolicy = async () => {
    setLeavePolicySaving(true);
    setError(null);
    try {
      const response = await updateLeavePolicy(leavePolicy.exclude_sundays_from_leave);
      if (response.success) {
        setSuccessMessage('Leave policy saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to save leave policy');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLeavePolicySaving(false);
    }
  };

  const tabs = [
    { key: 'attendance',   label: 'Attendance',    icon: Settings },
    { key: 'working-days', label: 'Working Days',  icon: Clock    },
    { key: 'auto-mark',    label: 'Auto-Mark',     icon: Timer    },
    { key: 'leave-policy', label: 'Leave Policy',  icon: Calendar },
    { key: 'global',       label: 'Global',         icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'DM Sans','Geist',system-ui,sans-serif" }}>
      <style>{`
        .sv-inp:focus{border-color:${T.primaryLight}!important;box-shadow:0 0 0 3px rgba(59,130,246,.12)!important}
        @keyframes sv-spin{to{transform:rotate(360deg)}}
        .sv-tab-btn:hover{background:${T.surfaceMuted}!important}
        .sv-day-row:hover{box-shadow:0 2px 10px rgba(15,23,42,.07)}
      `}</style>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: T.text }}>Settings</h1>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: T.textMuted }}>Configure attendance, working hours, and automation rules</p>
      </div>

      {/* Info banner */}
      <div style={{ ...card, padding: '0.875rem 1rem', background: T.primaryPale, border: `1px solid ${T.primaryBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <Info size={15} color={T.primary} style={{ flexShrink: 0, marginTop: 1 }}/>
          <div>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: T.text }}>Working Days Configuration</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: T.textSub, lineHeight: 1.5 }}>
              Working days are determined per-branch using the branch_working_days table. Weekends are <strong>not</strong> automatically non-working days — each day must be explicitly configured.
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ ...card, padding: '0.35rem', display: 'flex', gap: '0.25rem', background: T.surfaceAlt }}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} className={!active ? 'sv-tab-btn' : ''} onClick={() => setActiveTab(key as any)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 700 : 500, background: active ? T.surface : 'transparent', color: active ? T.primary : T.textMuted, boxShadow: active ? '0 1px 4px rgba(15,23,42,.08)' : 'none', transition: 'all 0.15s' }}>
              <Icon size={14}/>{label}
              {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.primary, display: 'inline-block', marginLeft: 1 }}/>}
            </button>
          );
        })}
      </div>

      {/* Global toasts */}
      {error        && <Toast type="error"   message={error}          onClose={() => setError(null)}/>}
      {successMessage && <Toast type="success" message={successMessage} onClose={() => setSuccessMessage(null)}/>}

      {/* ── Attendance Tab ──────────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div style={card}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={14} color={T.primary}/>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Attendance Settings</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Configure how attendance is tracked per branch</p>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <BranchSelect branches={branches} value={selectedBranchId} onChange={setSelectedBranchId} disabled={branchSettingsLoading}/>

            <Section title="Tracking Mode" desc="How attendance is determined for employees in this branch">
              <Field label="Attendance Mode" hint="Branch Based uses location of the branch. Flexible allows check-in from anywhere.">
                <select className="sv-inp" value={branchForm.attendance_mode}
                  onChange={e => setBranchForm({ ...branchForm, attendance_mode: e.target.value as any })}
                  style={{ ...inputS, appearance: 'none', cursor: 'pointer' }}>
                  <option value="branch_based">Branch Based</option>
                  <option value="multiple_locations">Multiple Locations</option>
                  <option value="flexible">Flexible</option>
                </select>
              </Field>

              <Field label="Grace Period" hint="How many minutes late a clock-in is allowed before being flagged as late.">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input className="sv-inp" type="number" min="0" value={branchForm.grace_period_minutes}
                    onChange={e => setBranchForm({ ...branchForm, grace_period_minutes: parseInt(e.target.value) || 0 })}
                    style={{ ...inputS, maxWidth: '120px' }}/>
                  <span style={{ fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>minutes</span>
                </div>
              </Field>
            </Section>

            <Section title="Automation" desc="Automatic actions the system can take on behalf of employees">
              <ToggleRow
                id="auto-checkout"
                label="Enable Auto Checkout"
                desc="Automatically check employees out after closing time, so no one is left as 'clocked in'."
                checked={branchForm.auto_checkout_enabled}
                onChange={v => setBranchForm({ ...branchForm, auto_checkout_enabled: v })}
              />
              {branchForm.auto_checkout_enabled && (
                <div style={{ marginLeft: '0.5rem', marginBottom: '0.875rem' }}>
                  <Field label="Auto checkout after closing" half>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input className="sv-inp" type="number" min="0" value={branchForm.auto_checkout_minutes_after_close}
                        onChange={e => setBranchForm({ ...branchForm, auto_checkout_minutes_after_close: parseInt(e.target.value) || 30 })}
                        style={{ ...inputS, maxWidth: '100px' }}/>
                      <span style={{ fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>min after close</span>
                    </div>
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Access Controls" desc="Who can do what with attendance records">
              <ToggleRow
                id="location-verify"
                label="Require GPS Location Verification"
                desc="Employees must share their location when clocking in. Useful for verifying on-site presence."
                checked={branchForm.enable_location_verification}
                onChange={v => setBranchForm({ ...branchForm, enable_location_verification: v })}
              />
              <ToggleRow
                id="strict-location-mode"
                label="Strict Mode (Assigned Locations Only)"
                desc="When enabled, staff can only check in/out within their assigned attendance location(s). If a staff member has no assigned location, check-in is blocked."
                checked={branchForm.strict_location_mode}
                onChange={v => setBranchForm({ ...branchForm, strict_location_mode: v })}
              />
              <ToggleRow
                id="manual-entry"
                label="Allow Manual Attendance Entry"
                desc="HR administrators can manually create or edit attendance records for employees."
                checked={branchForm.allow_manual_attendance_entry}
                onChange={v => setBranchForm({ ...branchForm, allow_manual_attendance_entry: v })}
              />
            </Section>

            <SaveBar onSave={handleSaveBranchSettings} loading={loading} disabled={branchSettingsLoading}/>
          </div>
        </div>
      )}

      {/* ── Leave Policy Tab ──────────────────────────────────── */}
      {activeTab === 'leave-policy' && (
        <div style={card}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.warningPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Calendar size={14} color={T.warning}/>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Leave Policy</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Configure how leave days are counted across the system</p>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <Section title="Counting Rules" desc="These rules affect leave applications, validations, and reporting.">
              <ToggleRow
                id="exclude-sundays-from-leave"
                label="Exclude Sundays from leave days"
                desc="When enabled, Sundays are not counted when staff apply for leave or when the system calculates leave durations."
                checked={leavePolicy.exclude_sundays_from_leave}
                onChange={(v) => setLeavePolicy({ exclude_sundays_from_leave: v })}
              />
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: T.textMuted, lineHeight: 1.5 }}>
                {leavePolicyLoading ? 'Loading leave policy...' : 'This is a global setting and applies to all leave requests.'}
              </p>
            </Section>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveLeavePolicy}
                style={btnPrimary}
                disabled={leavePolicySaving || leavePolicyLoading}
              >
                {leavePolicySaving
                  ? <><Timer size={15} style={{ animation: 'sv-spin 0.7s linear infinite' }}/> Saving…</>
                  : <><Save size={15}/> Save Leave Policy</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Working Days Tab ────────────────────────────────────── */}
      {activeTab === 'working-days' && (
        <WorkingDaysTab
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          branches={branches}
          workingDays={workingDays}
          setWorkingDays={setWorkingDays}
          workingDaysLoading={workingDaysLoading}
          setWorkingDaysLoading={setWorkingDaysLoading}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {/* ── Auto-Mark Tab ───────────────────────────────────────── */}
      {activeTab === 'auto-mark' && (
        <div style={card}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.warningPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Timer size={14} color={T.warning}/>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Auto-Mark Absent</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Automatically mark employees as absent if they don't clock in by a set time</p>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <BranchSelect branches={branches} value={selectedBranchId} onChange={setSelectedBranchId} disabled={branchSettingsLoading}/>

            <Section title="Auto-Mark Configuration" desc="Set the rules for automatically marking employees absent">
              <ToggleRow
                id="auto-mark-enabled"
                label="Enable Auto-Mark Absent"
                desc="When enabled, any employee who hasn't clocked in by the configured time will automatically be marked as absent for that day."
                checked={branchForm.auto_mark_absent_enabled}
                onChange={v => setBranchForm({ ...branchForm, auto_mark_absent_enabled: v })}
              />

              {branchForm.auto_mark_absent_enabled && (
                <div style={{ padding: '1rem', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: '10px', marginBottom: '0.875rem' }}>
                  <p style={{ margin: '0 0 0.875rem', fontSize: '0.78rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</p>
                  <Grid2>
                    <Field label="Mark Absent At" hint="Employees not clocked in by this time are automatically marked absent." half>
                      <input className="sv-inp" type="time" value={branchForm.auto_mark_absent_time}
                        onChange={e => setBranchForm({ ...branchForm, auto_mark_absent_time: e.target.value })}
                        style={{ ...inputS, maxWidth: '160px' }}/>
                    </Field>
                    <Field label="Timezone" hint="The timezone used to evaluate the cutoff time." half>
                      <div style={{ position: 'relative' }}>
                        <select className="sv-inp" value={branchForm.auto_mark_absent_timezone}
                          onChange={e => setBranchForm({ ...branchForm, auto_mark_absent_timezone: e.target.value })}
                          style={{ ...inputS, appearance: 'none', cursor: 'pointer', paddingRight: '2rem' }}>
                          <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                          <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                          <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                        </select>
                        <ChevronDown size={13} color={T.textMuted} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                      </div>
                    </Field>
                  </Grid2>

                  {/* Preview */}
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: T.warningPale, border: `1px solid ${T.warningBorder}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={13} color={T.warning}/>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#92400e', fontWeight: 500 }}>
                      Employees not clocked in by <strong>{branchForm.auto_mark_absent_time}</strong> ({branchForm.auto_mark_absent_timezone.split('/')[1]?.replace('_', ' ')}) will be marked absent.
                    </p>
                  </div>
                </div>
              )}
            </Section>

            <SaveBar onSave={handleSaveAutoMarkSettings} loading={loading} disabled={branchSettingsLoading}/>
          </div>
        </div>
      )}

      {/* ── Global Tab ─────────────────────────────────────────── */}
      {activeTab === 'global' && (
        <div style={card}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={14} color={T.primary}/>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Global Attendance Settings</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Configure global defaults and special rules</p>
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {globalSettingsLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: T.textMuted, fontSize: '0.875rem' }}>Loading global settings...</p>
            ) : (
              <>
                <Section title="Last Saturday Resumption Time" desc="Set the resumption time for Saturdays. Changing this will automatically recalculate attendance for past Saturdays.">
                  <Field label="Resumption time" hint="Time staff must check in on Saturdays">
                    <input
                      type="time"
                      value={globalSettings.last_saturday_resumption_time}
                      onChange={e => setGlobalSettings({ ...globalSettings, last_saturday_resumption_time: e.target.value })}
                      style={{ ...inputS, maxWidth: '200px' }}
                    />
                  </Field>
                </Section>

                <div style={{ borderTop: `1px solid ${T.border}`, margin: '1.25rem 0' }} />

                <Section title="Reprocess Last Saturday" desc="Recalculate attendance for the most recent Saturday using the current resumption time.">
                  <button
                    onClick={handleReprocessLastSaturday}
                    disabled={reprocessing}
                    style={{
                      ...btnPrimary,
                      opacity: reprocessing ? 0.6 : 1,
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    }}
                  >
                    <Clock size={14} />
                    {reprocessing ? 'Reprocessing...' : 'Reprocess Last Saturday'}
                  </button>
                </Section>

                <SaveBar onSave={handleSaveGlobalSettings} loading={globalSettingsSaving} disabled={globalSettingsLoading}/>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Working Days Tab ─────────────────────────────────────────────────────
const WorkingDaysTab = ({
  selectedBranchId,
  setSelectedBranchId,
  branches,
  workingDays,
  setWorkingDays,
  workingDaysLoading,
  setWorkingDaysLoading,
  setError,
  setSuccessMessage,
}: any) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => { if (selectedBranchId) loadWorkingDays(); }, [selectedBranchId]);

  const loadWorkingDays = async () => {
    setWorkingDaysLoading(true); setLocalError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${API_ENDPOINT}/branch-working-days/${selectedBranchId}/working-days`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to load working days'); }
      const data = await res.json();
      if (data.success && data.data.workingDays) {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        setWorkingDays(days.map(day => {
          const apiDay = data.data.workingDays.find((d: any) => d.day_of_week === day);
          return apiDay || { day_of_week: day, is_working_day: day !== 'saturday' && day !== 'sunday', start_time: '08:00', end_time: '17:00', break_duration_minutes: 30 };
        }));
      }
    } catch (err: any) {
      console.error('Error loading working days:', err);
      setLocalError(err.message || 'Failed to load working days');
      setError(err.message || 'Failed to load working days');
    } finally { setWorkingDaysLoading(false); }
  };

  const handleSaveWorkingDays = async () => {
    if (!selectedBranchId) { setError('Please select a branch'); return; }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_ENDPOINT}/branch-working-days/${selectedBranchId}/working-days`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingDays: workingDays.map((d: any) => ({ day_of_week: d.day_of_week.toLowerCase(), is_working_day: !!d.is_working_day, start_time: d.is_working_day ? d.start_time : null, end_time: d.is_working_day ? d.end_time : null, break_duration_minutes: d.break_duration_minutes || 0 })) })
      });
      const data = await res.json();
      if (data.success) { setLocalSuccess('Working days saved successfully'); setTimeout(() => setLocalSuccess(null), 3000); }
      else setError(data.message || 'Failed to save working days');
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setLoading(false); }
  };

  const updateDay = (idx: number, field: string, value: any) => {
    const updated = [...workingDays];
    updated[idx] = { ...updated[idx], [field]: value };
    setWorkingDays(updated);
  };

  const dayAbbr: Record<string, string> = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
  const workingCount = workingDays.filter((d: any) => d.is_working_day).length;

  return (
    <div style={card}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '7px', background: T.successPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={14} color={T.success}/>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Branch Working Days</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted }}>Configure which days and hours your branch operates</p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.65rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: T.successPale, color: T.success, border: `1px solid ${T.successBorder}` }}>
          {workingCount} working days
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Branch selector */}
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: T.textSub, marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Branch</label>
          <div style={{ position: 'relative' }}>
            <Building size={14} color={T.textMuted} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
            <select className="sv-inp" value={selectedBranchId} onChange={e => setSelectedBranchId(e.target.value)} disabled={workingDaysLoading}
              style={{ ...inputS, paddingLeft: '2.1rem', appearance: 'none', cursor: 'pointer' }}>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: '0.5rem 0.75rem', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hours</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Break</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
        </div>

        {workingDaysLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: T.textMuted, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: 16, height: 16, border: `2px solid ${T.primaryBorder}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'sv-spin 0.7s linear infinite' }}/>
            Loading schedule…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {workingDays.map((day: any, idx: number) => {
              const isWeekend = day.day_of_week === 'saturday' || day.day_of_week === 'sunday';
              return (
                <div key={day.day_of_week} className="sv-day-row"
                  style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: '0.5rem 0.75rem', alignItems: 'center', padding: '0.75rem 1rem', background: day.is_working_day ? T.surface : T.surfaceMuted, border: `1px solid ${day.is_working_day ? T.border : T.border}`, borderRadius: '10px', opacity: day.is_working_day ? 1 : 0.65, transition: 'box-shadow 0.15s, opacity 0.15s' }}>
                  {/* Day name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: T.text }}>{dayAbbr[day.day_of_week]}</span>
                    {isWeekend && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', background: T.surfaceMuted, borderRadius: '4px', color: T.textMuted, fontWeight: 600, letterSpacing: '0.04em' }}>WE</span>}
                  </div>

                  {/* Time range */}
                  {day.is_working_day ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input className="sv-inp" type="time" value={day.start_time || '08:00'}
                        onChange={e => updateDay(idx, 'start_time', e.target.value)}
                        style={{ ...inputS, width: '115px', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}/>
                      <span style={{ color: T.textMuted, fontSize: '0.78rem', flexShrink: 0 }}>→</span>
                      <input className="sv-inp" type="time" value={day.end_time || '17:00'}
                        onChange={e => updateDay(idx, 'end_time', e.target.value)}
                        style={{ ...inputS, width: '115px', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}/>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: T.textMuted, fontStyle: 'italic' }}>Off</span>
                  )}

                  {/* Break */}
                  {day.is_working_day ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input className="sv-inp" type="number" min="0" max="120" value={day.break_duration_minutes || 30}
                        onChange={e => updateDay(idx, 'break_duration_minutes', parseInt(e.target.value) || 0)}
                        style={{ ...inputS, width: '70px', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}/>
                      <span style={{ fontSize: '0.75rem', color: T.textMuted, flexShrink: 0 }}>min</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: T.textMuted }}>—</span>
                  )}

                  {/* Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Toggle checked={day.is_working_day} onChange={v => updateDay(idx, 'is_working_day', v)}/>
                    <span style={{ fontSize: '0.78rem', color: day.is_working_day ? T.success : T.textMuted, fontWeight: 600 }}>
                      {day.is_working_day ? 'Working' : 'Day off'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {localError   && <Toast type="error"   message={localError}   onClose={() => setLocalError(null)}/>}
        {localSuccess && <Toast type="success" message={localSuccess} onClose={() => setLocalSuccess(null)}/>}

        <div style={{ paddingTop: '1.25rem', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: T.textMuted }}>
            <strong style={{ color: T.text }}>{workingCount}</strong> days configured as working days
          </p>
          <button style={{ ...btnPrimary, opacity: (loading || workingDaysLoading) ? 0.65 : 1, cursor: (loading || workingDaysLoading) ? 'not-allowed' : 'pointer' }}
            onClick={handleSaveWorkingDays} disabled={loading || workingDaysLoading}>
            {loading
              ? <><Timer size={15} style={{ animation: 'sv-spin 0.7s linear infinite' }}/> Saving…</>
              : <><Save size={15}/> Save Working Days</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
