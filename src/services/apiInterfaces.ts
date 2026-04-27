// src/services/apiInterfaces.ts

// Holiday/Off-day interfaces
export interface Holiday {
  id: number;
  holiday_name: string;
  date: string; // ISO date string
  branch_id: number | null;
  branch_name?: string; // Optional, for display purposes
  is_mandatory: boolean;
  description: string | null;
  created_by: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateHolidayRequest {
  holiday_name: string;
  date: string; // ISO date string
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
}

export interface UpdateHolidayRequest {
  holiday_name?: string;
  date?: string; // ISO date string
  branch_id?: number | null;
  is_mandatory?: boolean;
  description?: string | null;
}

// Shift Template interfaces
export interface ShiftTemplate {
  id: number;
  name: string;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  break_duration_minutes: number;
  recurrence_pattern: string | null;
  recurrence_days: string | null; // JSON string
  created_by: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateShiftTemplateRequest {
  name: string;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  break_duration_minutes: number;
  recurrence_pattern?: string;
  recurrence_days?: string; // JSON string
}

export interface UpdateShiftTemplateRequest {
  name?: string;
  start_time?: string; // HH:MM:SS format
  end_time?: string; // HH:MM:SS format
  break_duration_minutes?: number;
  recurrence_pattern?: string;
  recurrence_days?: string; // JSON string
}

// Employee Shift Assignment interfaces
export interface EmployeeShiftAssignment {
  id: number;
  user_id: number;
  shift_template_id: number;
  effective_from: string; // ISO date string
  effective_to: string | null; // ISO date string or null
  assignment_type: 'permanent' | 'temporary' | 'rotating';
  status: 'active' | 'inactive' | 'expired' | 'pending' | 'cancelled';
  recurrence_pattern?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_days?: string | string[];
  recurrence_day_of_week?: string;
  recurrence_end_date?: string;
  created_by: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  // Joined fields
  user_name?: string;
  template_name?: string;
  assigned_by_name?: string;
  approved_by_name?: string;
}

export interface AssignShiftToEmployeeRequest {
  user_id: number;
  shift_template_id: number;
  effective_from: string; // ISO date string
  effective_to?: string | null; // ISO date string or null
  assignment_type?: 'permanent' | 'temporary' | 'rotating';
}

export interface UpdateEmployeeShiftAssignmentRequest {
  shift_template_id?: number;
  effective_from?: string; // ISO date string
  effective_to?: string | null; // ISO date string or null
  assignment_type?: 'permanent' | 'temporary' | 'rotating';
  status?: 'active' | 'inactive' | 'expired';
}

// Schedule Request interfaces
export interface ScheduleRequest {
  id: number;
  user_id: number;
  request_type: 'shift_change' | 'time_off_request' | 'compensatory_time' | 'other';
  request_data: any; // Flexible structure depending on request type
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string | null;
  approved_by: number | null;
  rejected_by: number | null;
  approved_at: string | null; // ISO datetime string
  rejected_at: string | null; // ISO datetime string
  created_by: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateScheduleRequestRequest {
  request_type: 'shift_change' | 'time_off_request' | 'compensatory_time' | 'other';
  request_data: any; // Flexible structure depending on request type
  reason?: string;
}

export interface UpdateScheduleRequestRequest {
  status?: 'approved' | 'rejected' | 'cancelled';
  reason?: string;
}

// Time Off Bank interfaces
export interface TimeOffBank {
  id: number;
  user_id: number;
  program_name: string;
  description: string | null;
  total_entitled_days: number;
  used_days: number;
  available_days: number;
  valid_from: string; // ISO date string
  valid_to: string; // ISO date string
  created_by: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  user_name?: string;
  created_by_name?: string;
}

export interface CreateTimeOffBankRequest {
  user_id: number;
  program_name: string;
  description?: string;
  total_entitled_days: number;
  valid_from: string; // ISO date string
  valid_to: string; // ISO date string
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Payroll Run interface
export interface PayrollRun {
  id: number;
  run_name: string;
  pay_period: string; // YYYY-MM
  start_date: string;
  end_date: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  total_employees: number;
  total_amount: number;
  processed_by: number;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Appraisal interface
export interface Appraisal {
  id: number;
  template_id: number;
  user_id: number;
  evaluator_id: number; // Manager or evaluator
  period: string; // YYYY-MM or YYYY-Q format
  status: 'draft' | 'in_progress' | 'submitted' | 'evaluated' | 'completed';
  overall_score: number | null;
  evaluator_notes: string | null;
  employee_self_assessment: string | null;
  created_at: string;
  updated_at: string;
}

// KPI interface
export interface KPI {
  id: number;
  name: string;
  description: string;
  target_value: number;
  unit_of_measurement: string;
  weight: number; // Weight in appraisal
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Shift Schedule interface
export interface ShiftSchedule {
  id: number;
  employee_id: number;
  shift_type: string;
  date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  department: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Shift Exception interfaces
export interface ShiftException {
  id: number;
  user_id: number;
  shift_assignment_id?: number | null;
  exception_date: string; // ISO date string (YYYY-MM-DD)
  exception_type: 'early_release' | 'late_start' | 'day_off' | 'special_schedule' | 'holiday_work';
  original_start_time?: string; // HH:MM:SS format
  original_end_time?: string; // HH:MM:SS format
  new_start_time: string; // HH:MM:SS format
  new_end_time: string; // HH:MM:SS format
  new_break_duration_minutes?: number;
  reason: string;
  approved_by?: number | null;
  approved_at?: string | null; // ISO datetime string
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'cancelled';
  created_by?: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  user_name?: string;
}

export interface CreateShiftExceptionRequest {
  user_id: number;
  exception_date: string; // ISO date string (YYYY-MM-DD)
  exception_type: 'early_release' | 'late_start' | 'day_off' | 'special_schedule' | 'holiday_work';
  new_start_time: string; // HH:MM:SS format
  new_end_time: string; // HH:MM:SS format
  new_break_duration_minutes?: number;
  reason: string;
  status?: 'pending' | 'approved' | 'active' | 'rejected' | 'cancelled';
}

export interface UpdateShiftExceptionRequest {
  exception_date?: string;
  exception_type?: 'early_release' | 'late_start' | 'day_off' | 'special_schedule' | 'holiday_work';
  new_start_time?: string;
  new_end_time?: string;
  new_break_duration_minutes?: number;
  reason?: string;
  status?: 'pending' | 'approved' | 'active' | 'rejected' | 'cancelled';
}

// Holiday Duty Roster interfaces
export interface HolidayDutyRoster {
  id: number;
  holiday_id: number;
  user_id: number;
  shift_type: 'morning' | 'afternoon' | 'night' | 'full_day';
  notes: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  holiday_name?: string;
  holiday_date?: string;
}

export interface CreateHolidayDutyRosterRequest {
  holiday_id: number;
  user_id: number;
  shift_type: 'morning' | 'afternoon' | 'night' | 'full_day';
  notes?: string | null;
}

export interface UpdateHolidayDutyRosterRequest {
  holiday_id?: number;
  user_id?: number;
  shift_type?: 'morning' | 'afternoon' | 'night' | 'full_day';
  notes?: string | null;
}

export interface BulkCreateHolidayDutyRosterRequest {
  holiday_id: number;
  assignments: Array<{
    user_id: number;
    shift_type: 'morning' | 'afternoon' | 'night' | 'full_day';
    notes?: string | null;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Staff-related interfaces
export interface StaffMember {
  id: string;
  user_id: number;
  employee_id: string;
  employeeId?: string;
  first_name: string;
  firstName: string; 
  last_name: string;
  lastName: string;
  middle_name?: string;
  middleName?: string;
  email: string;
  personal_email: string;
  personalEmail?: string;
  phone_number?: string;
  phoneNumber: string; 
  alternate_phone?: string;
  alternatePhone?: string;
  date_of_birth?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  religion?: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  designation?: string;
  departmentRole: string;
  department: string;
  branch_id?: number;
  branchId?: number;
  branch_name?: string;
  branchName?: string;
  branchType?: 'Single' | 'Multiple' | 'All';
  branches?: any[];
  status: 'active' | 'inactive' | 'terminated' | 'Active' | 'Inactive' | 'Suspended' | 'Terminated' | 'Resigned';
  joining_date?: string;
  joiningDate?: string;
  date_employed?: string;
  dateEmployed?: string;
  employment_type?: string;
  employmentType?: string;
  jobStatus?: string;
  employee_photo?: string;
  profile_picture?: string;
  profilePicture?: string;
  avatar?: string;
  education?: any[];
  leaves?: any[];
  offDays?: any[];
  documents?: any[];
  guardianFirstName?: string;
  guardianLastName?: string;
  guardianDOB?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianAddress?: string;
  guardianBusinessName?: string;
  guardianBusinessAddress?: string;
  [key: string]: any;
}

export interface CreateStaffRequest {
  user_id?: number;
  designation: string;
  department: string;
  branch_id?: number;
  personal_email: string;
  email: string;
  [key: string]: any;
}

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {
  status?: 'active' | 'inactive' | 'terminated';
}

export interface StaffInvitation {
  id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined';
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  first_login_at?: string | null;
  profile_completed?: boolean;
  roleName?: string;
  branchName?: string;
  departmentName?: string;
  invitedByName?: string;
}

export interface StaffInvitationRequest {
  firstName: string;
  lastName: string;
  personalEmail: string;
  roleId: string;
  branchId: string;
  departmentId: string;
}

export interface BulkInviteInvitation {
  firstName: string;
  lastName: string;
  personalEmail: string;
  phone?: string;
  roleId: string;
  branchId?: string;
  departmentId?: string;
}

export interface BulkInviteResult {
  index: number;
  email: string;
  success: boolean;
  message?: string;
  code?: string;
  data?: any;
}

export interface InvitationStats {
  overview: {
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
    declined: number;
  };
  acceptedTracking: {
    total_accepted: number;
    first_logged_in: number;
    accepted_not_logged_in: number;
    profile_completed_count: number;
    logged_in_not_completed: number;
  };
  recent7Days: {
    total: number;
    pending: number;
    recently_accepted: number;
    expired: number;
  };
  expiringSoon: number;
  byRole: { role_name: string; count: number }[];
  byBranch: { branch_name: string; count: number }[];
}

export interface StaffMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  position: string;
  startDate: string;
  salary: number;
}

export interface StaffMemberExtended extends StaffMember {
  phone: string;
  position: string;
  startDate: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}
