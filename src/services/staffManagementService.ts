import axios from 'axios';
import { API_ENDPOINT } from '../config/config';
import { Role } from './roleManagementService';
import {
  StaffMember,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffInvitation,
  StaffInvitationRequest,
  BulkInviteInvitation,
  BulkInviteResult,
  InvitationStats,
  StaffMemberRequest,
  StaffMemberExtended
} from './apiInterfaces';

export {
  type StaffMember,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffInvitation,
  type StaffInvitationRequest,
  type BulkInviteInvitation,
  type BulkInviteResult,
  type InvitationStats,
  type StaffMemberRequest,
  type StaffMemberExtended
};

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateStaffData = (staffData: CreateStaffRequest | StaffMemberRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!staffData.firstName || staffData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!staffData.lastName || staffData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  // Check for email depending on the type of object
  const email = staffData.email;
  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if ('phone' in staffData && staffData.phone && !validatePhone(staffData.phone)) {
    errors.push('Valid phone number is required');
  }

  if ('roleId' in staffData && !staffData.roleId) {
    errors.push('Role is required');
  }

  if ('branchId' in staffData && !staffData.branchId) {
    errors.push('Branch is required');
  }

  if ('departmentId' in staffData && !staffData.departmentId) {
    errors.push('Department is required');
  }

  if ('position' in staffData && !staffData.position) {
    errors.push('Position is required');
  }

  if ('startDate' in staffData && !staffData.startDate) {
    errors.push('Start date is required');
  }

  if ('base_salary' in staffData && staffData.base_salary <= 0) {
    errors.push('Salary must be greater than zero');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStaffInvitationData = (invitationData: StaffInvitationRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!invitationData.firstName || invitationData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!invitationData.lastName || invitationData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!invitationData.personalEmail || !validateEmail(invitationData.personalEmail)) {
    errors.push('Valid personal email is required');
  }

  if (!invitationData.roleId) {
    errors.push('Role is required');
  }

  if (!invitationData.branchId) {
    errors.push('Branch is required');
  }

  if (!invitationData.departmentId) {
    errors.push('Department is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Invite new staff member
export const inviteStaff = async (invitationData: StaffInvitationRequest): Promise<{ success: boolean; invitation?: StaffInvitation; message?: string }> => {
  try {
    const validation = validateStaffInvitationData(invitationData);
    if (!validation.isValid) {
      return { success: false, message: `Validation failed: ${validation.errors.join(', ')}` };
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Authentication token not found. Please log in again.' };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff-invitation`, invitationData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    return { success: true, invitation: response.data.invitation || response.data };
  } catch (error: any) {
    console.error('Error inviting staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return { success: false, message: 'Access denied. Please check your permissions or log in again.' };
    }
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to invite staff' };
  }
};

// Bulk invite multiple staff members
export const bulkInviteStaff = async (invitations: BulkInviteInvitation[]): Promise<{
  success: boolean;
  total: number;
  successCount: number;
  failureCount: number;
  results: BulkInviteResult[];
  message?: string;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, total: 0, successCount: 0, failureCount: 0, results: [], message: 'Not authenticated' };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff-invitation/bulk`, { invitations }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    const data = response.data;
    return {
      success: data.success,
      total: data.data?.total || invitations.length,
      successCount: data.data?.successCount || 0,
      failureCount: data.data?.failureCount || 0,
      results: data.data?.results || [],
      message: data.message,
    };
  } catch (error: any) {
    console.error('Error bulk inviting staff:', error);
    return {
      success: false,
      total: invitations.length,
      successCount: 0,
      failureCount: invitations.length,
      results: [],
      message: error.response?.data?.message || error.message || 'Failed to send bulk invitations',
    };
  }
};

// Get invitation statistics
export const getInvitationStats = async (): Promise<{ success: boolean; stats?: InvitationStats; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff-invitation/stats`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    return { success: true, stats: response.data.data };
  } catch (error: any) {
    console.error('Error fetching invitation stats:', error);
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to fetch stats' };
  }
};

// Get all staff invitations
export const getAllStaffInvitations = async (): Promise<{ success: boolean; invitations?: StaffInvitation[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log('Fetching invitations from:', `${API_ENDPOINT}/staff-invitation/invitations`);
    const response = await axios.get(`${API_ENDPOINT}/staff-invitation/invitations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Invitations response:', response.data);
    return {
      success: true,
      invitations: response.data.data?.invitations || response.data.invitations || [],
    };
  } catch (error: any) {
    console.error('Error fetching staff invitations:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff invitations',
    };
  }
};

// Get available roles for staff invitation
export const getAvailableRolesForInvitation = async (): Promise<{ success: boolean; roles?: Role[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff-invitation/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      roles: response.data.data?.roles || response.data.roles || [],
    };
  } catch (error: any) {
    console.error('Error fetching available roles for invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch available roles',
    };
  }
};

// Get all staff members with pagination support
export const getAllStaff = async (page: number = 1, limit: number = 20, filters?: {
  status?: string;
  department?: string;
  search?: string;
}): Promise<{ 
  success: boolean; 
  staff?: StaffMember[]; 
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string 
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(`${API_ENDPOINT}/staff?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data) {
      responseData = response.data.data;
    }

    // Extract staff array and pagination
    let staffArray: StaffMember[] = [];
    let paginationData = undefined;
    
    if (responseData.staff && Array.isArray(responseData.staff)) {
      staffArray = responseData.staff.map(mapStaffResponse);
    } else if (Array.isArray(responseData)) {
      staffArray = responseData.map(mapStaffResponse);
    }
    
    // Extract pagination info
    if (responseData.pagination) {
      paginationData = responseData.pagination;
    } else if (response.data.data?.pagination) {
      paginationData = response.data.data.pagination;
    }

    return {
      success: true,
      staff: staffArray,
      pagination: paginationData,
    };
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff',
    };
  }
};

// Helper function to map backend snake_case to frontend camelCase
function mapStaffResponse(backendData: any): any {
  if (!backendData) return backendData;

  console.log('[mapStaffResponse] Input data:', backendData);

  // Handle full_name from users table (split into first, middle, last)
  let firstName = backendData.firstName || backendData.first_name || '';
  let middleName = backendData.middleName || backendData.middle_name || '';
  let lastName = backendData.lastName || backendData.last_name || '';
  
  // If backend returns full_name, split it
  if (backendData.full_name && !backendData.first_name && !backendData.last_name) {
    const nameParts = backendData.full_name.trim().split(/\s+/);
    firstName = nameParts[0] || '';
    lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
  }

  const mapped = {
    ...backendData,
    // Map name fields (from full_name or individual fields)
    firstName: firstName,
    lastName: lastName,
    middleName: middleName,
    // Map other fields - ensure ALL fields are mapped
    personalEmail: backendData.personal_email || backendData.personal_email,
    phoneNumber: backendData.phone_number || backendData.phoneNumber,
    alternatePhone: backendData.alternate_phone_number || backendData.alternate_phone || backendData.alternatePhone,
    dateOfBirth: backendData.date_of_birth || backendData.dateOfBirth,
    bloodGroup: backendData.blood_group || backendData.bloodGroup,
    stateOfOrigin: backendData.state_of_origin || backendData.stateOfOrigin,
    lga: backendData.lga,
    maritalStatus: backendData.marital_status || backendData.maritalStatus,
    currentAddress: backendData.current_address || backendData.currentAddress,
    permanentAddress: backendData.permanent_address || backendData.permanentAddress,
    town: backendData.town,
    zipCode: backendData.zip_code || backendData.zipCode,
    highestQualification: backendData.highest_qualification || backendData.highestQualification,
    universitySchool: backendData.university_school || backendData.universitySchool,
    courseOfStudy: backendData.course_of_study || backendData.courseOfStudy,
    yearOfGraduation: backendData.year_of_graduation || backendData.yearOfGraduation,
    professionalCertifications: backendData.professional_certifications || backendData.professionalCertifications,
    languagesKnown: backendData.languages_known || backendData.languagesKnown,
    primarySkills: backendData.primary_skills || backendData.primarySkills,
    emergencyContactName: backendData.emergency_contact_name || backendData.emergencyContactName,
    emergencyContactPhone: backendData.emergency_contact_phone || backendData.emergencyContactPhone,
    emergencyContactRelationship: backendData.emergency_contact_relationship || backendData.emergencyContactRelationship,
    bankName: backendData.bank_name || backendData.bankName,
    bankAccountNumber: backendData.bank_account_number || backendData.bankAccountNumber,
    bankIfscCode: backendData.bank_ifsc_code || backendData.bankIfscCode,
    taxIdentificationNumber: backendData.tax_identification_number || backendData.taxIdentificationNumber,
    providentFundId: backendData.provident_fund_id || backendData.providentFundId,
    medicalInsuranceId: backendData.medical_insurance_id || backendData.medicalInsuranceId,
    weeklyWorkingHours: backendData.weekly_working_hours || backendData.weeklyWorkingHours,
    probationEndDate: backendData.probation_end_date || backendData.probationEndDate,
    contractEndDate: backendData.contract_end_date || backendData.contractEndDate,
    noticePeriodDays: backendData.notice_period_days || backendData.noticePeriodDays,
    overtimeEligibility: backendData.overtime_eligibility !== undefined ? (backendData.overtime_eligibility === 1 || backendData.overtime_eligibility === true || backendData.overtime_eligibility === '1' ? 'Yes' : 'No') : backendData.overtimeEligibility,
    gratuityApplicable: backendData.gratuity_applicable !== undefined ? (backendData.gratuity_applicable === 1 || backendData.gratuity_applicable === true || backendData.gratuity_applicable === '1' ? 'Yes' : 'No') : backendData.gratuityApplicable,
    workMode: backendData.work_mode || backendData.workMode,
    resignationDate: backendData.resignation_date || backendData.resignationDate,
    noticePeriodStart: backendData.notice_period_start_date || backendData.noticePeriodStart,
    noticePeriodEnd: backendData.notice_period_end_date || backendData.noticePeriodEnd,
    lastWorkingDate: backendData.last_working_date || backendData.lastWorkingDate,
    relievingDate: backendData.relieving_date || backendData.relievingDate,
    reasonForLeaving: backendData.reason_for_leaving || backendData.reasonForLeaving,
    previousCompany: backendData.previous_company || backendData.previousCompany,
    experienceYears: backendData.experience_years || backendData.experienceYears,
    referenceCheckStatus: backendData.reference_check_status || backendData.referenceCheckStatus,
    backgroundVerificationStatus: backendData.background_verification_status || backendData.backgroundVerificationStatus,
    // Ensure these are preserved if already in camelCase
    email: backendData.email,
    department: backendData.department,
    designation: backendData.designation,
    departmentRole: backendData.departmentRole || backendData.designation,
    branchId: backendData.branch_id || backendData.branchId,
    branch: backendData.branch_name || backendData.branch || backendData.branch,
    employmentType: backendData.employment_type || backendData.employmentType,
    joiningDate: backendData.joining_date || backendData.joiningDate,
    dateEmployed: backendData.date_employed || backendData.joining_date || backendData.dateEmployed,
    jobStatus: backendData.job_status || backendData.jobStatus,
    status: backendData.status,
    // Construct full URL for profile picture
    avatar: backendData.employee_photo 
      ? (backendData.employee_photo.startsWith('http') ? backendData.employee_photo : `${API_ENDPOINT}${backendData.employee_photo}`) 
      : backendData.profile_picture 
        ? (backendData.profile_picture.startsWith('http') ? backendData.profile_picture : `${API_ENDPOINT}${backendData.profile_picture}`) 
        : backendData.avatar,
    profilePicture: backendData.employee_photo 
      ? (backendData.employee_photo.startsWith('http') ? backendData.employee_photo : `${API_ENDPOINT}${backendData.employee_photo}`) 
      : backendData.profile_picture 
        ? (backendData.profile_picture.startsWith('http') ? backendData.profile_picture : `${API_ENDPOINT}${backendData.profile_picture}`) 
        : backendData.profilePicture,
    profile_picture: backendData.employee_photo 
      ? (backendData.employee_photo.startsWith('http') ? backendData.employee_photo : `${API_ENDPOINT}${backendData.employee_photo}`) 
      : backendData.profile_picture 
        ? (backendData.profile_picture.startsWith('http') ? backendData.profile_picture : `${API_ENDPOINT}${backendData.profile_picture}`) 
        : backendData.profile_picture,
    allergies: backendData.allergies,
    specialMedicalNotes: backendData.special_medical_notes || backendData.specialMedicalNotes,
    payGrade: backendData.pay_grade || backendData.payGrade,
    baseSalary: backendData.base_salary || backendData.baseSalary,
    // Location fields
    assignedLocationId: backendData.assigned_location_id || backendData.assignedLocationId,
    locationAssignments: backendData.location_assignments || backendData.locationAssignments,
    locationNotes: backendData.location_notes || backendData.locationNotes
  };

  console.log('[mapStaffResponse] Mapped data:', mapped);
  return mapped;
}

// Get staff by ID
export const getStaffById = async (staffId: string): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/${staffId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data && response.data.data.staff) {
      staffData = response.data.data.staff;
    } else if (response.data.data) {
      staffData = response.data.data;
    } else if (response.data.staff) {
      staffData = response.data.staff;
    }

    // Map backend snake_case to frontend camelCase
    const mappedStaff = mapStaffResponse(staffData);

    return {
      success: true,
      staff: mappedStaff,
    };
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff',
    };
  }
};

// Create new staff member directly
export const createStaff = async (staffData: CreateStaffRequest): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    // Validate input data
    const validation = validateStaffData(staffData as any); // Casting to any to satisfy TypeScript
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.post(`${API_ENDPOINT}/staff`, staffData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data && response.data.data.staff) {
      responseData = response.data.data.staff;
    } else if (response.data.data) {
      responseData = response.data.data;
    } else if (response.data.staff) {
      responseData = response.data.staff;
    }

    return {
      success: true,
      staff: responseData,
    };
  } catch (error: any) {
    console.error('Error creating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    // Return error but don't crash the app
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create staff',
    };
  }
};


// Get staff by department
export const getStaffByDepartment = async (department: string): Promise<{ success: boolean; staff?: StaffMember[]; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/department/${department}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data) {
      staffData = response.data.data;
    }

    // Extract staff array from different possible field names
    let staffArray: StaffMember[] = [];
    if (Array.isArray(staffData)) {
      staffArray = staffData.map(mapStaffResponse);
    } else if (staffData.staff && Array.isArray(staffData.staff)) {
      staffArray = staffData.staff.map(mapStaffResponse);
    } else if (staffData.data && Array.isArray(staffData.data)) {
      staffArray = staffData.data.map(mapStaffResponse);
    } else if (staffData.results && Array.isArray(staffData.results)) {
      staffArray = staffData.results.map(mapStaffResponse);
    }

    return {
      success: true,
      staff: staffArray,
    };
  } catch (error: any) {
    console.error('Error fetching staff by department:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch staff by department',
    };
  }
};

// Update existing staff member
export const updateStaff = async (staffId: string, staffData: Partial<UpdateStaffRequest>): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.put(`${API_ENDPOINT}/staff/${staffId}`, staffData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let responseData = response.data;
    if (response.data.data && response.data.data.staff) {
      responseData = response.data.data.staff;
    } else if (response.data.data) {
      responseData = response.data.data;
    } else if (response.data.staff) {
      responseData = response.data.staff;
    }

    // Map backend snake_case to frontend camelCase
    const mappedStaff = mapStaffResponse(responseData);

    return {
      success: true,
      staff: mappedStaff,
    };
  } catch (error: any) {
    console.error('Error updating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    // Return error but don't crash the app
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update staff',
    };
  }
};

// Get own staff details
export const getOwnStaffDetails = async (): Promise<{ success: boolean; staff?: StaffMember; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    const response = await axios.get(`${API_ENDPOINT}/staff/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle different possible response structures
    let staffData = response.data;
    if (response.data.data && response.data.data.staff) {
      staffData = response.data.data.staff;
    } else if (response.data.data) {
      staffData = response.data.data;
    } else if (response.data.staff) {
      staffData = response.data.staff;
    }

    return {
      success: true,
      staff: staffData,
    };
  } catch (error: any) {
    console.error('Error fetching own staff details:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch own staff details',
    };
  }
};

// Resend staff invitation
export const resendStaffInvitation = async (invitationId: string): Promise<{ success: boolean; invitation?: StaffInvitation; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Resending invitation ${invitationId}...`);
    const response = await axios.post(`${API_ENDPOINT}/staff-invitation/invitations/${invitationId}/resend`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Resend response:', response.data);
    return {
      success: true,
      invitation: response.data.data?.invitation || response.data.invitation || response.data,
    };
  } catch (error: any) {
    console.error('Error resending staff invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to resend staff invitation',
    };
  }
};

// Revoke staff invitation
export const revokeStaffInvitation = async (invitationId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    console.log(`Revoking invitation ${invitationId}...`);
    await axios.delete(`${API_ENDPOINT}/staff-invitation/invitations/${invitationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Staff invitation revoked successfully',
    };
  } catch (error: any) {
    console.error('Error revoking staff invitation:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to revoke staff invitation',
    };
  }
};

// Activate staff member
export const activateStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.patch(`${API_ENDPOINT}/staff/${staffId}/activate`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Staff member activated successfully',
    };
  } catch (error: any) {
    console.error('Error activating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to activate staff',
    };
  }
};

// Deactivate staff member
export const deactivateStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.patch(`${API_ENDPOINT}/staff/${staffId}/deactivate`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Staff member deactivated successfully',
    };
  } catch (error: any) {
    console.error('Error deactivating staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to deactivate staff',
    };
  }
};

// Delete staff member
export const deleteStaff = async (staffId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please log in again.'
      };
    }

    await axios.delete(`${API_ENDPOINT}/staff/${staffId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      success: true,
      message: 'Staff member deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Access denied. Please check your permissions or log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete staff',
    };
  }
};

