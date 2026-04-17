// This file contains mock data and interfaces for staff members in the HR dashboard
// It includes TypeScript interfaces for various data structures and utility functions for data management

// Interface defining the structure of education information for staff members
export interface Education {
  id: string; // Unique identifier for the education record
  school: string; // Name of the educational institution
  courseOfStudy: string; // Field of study or major
  certification: string; // Degree or certification obtained
  startYear: string; // Year when education started
  endYear: string; // Year when education ended
}

// Interface defining the structure of branch information
export interface Branch {
  id: string; // Unique identifier for the branch
  name: string; // Name of the branch location
  baseStatus: 'Primary' | 'Secondary'; // Status indicating if it's primary or secondary branch
}

// Interface defining the structure of leave requests
export interface Leave {
  id: string; // Unique identifier for the leave request
  type: string; // Type of leave (e.g., annual, sick, maternity)
  startDate: string; // Start date of the leave in string format
  endDate: string; // End date of the leave in string format
  reason: string; // Reason for the leave request
  status: 'Pending' | 'Approved' | 'Declined'; // Current status of the leave request
  reply?: string; // Optional reply or comment from HR/admin
}

// Interface defining the structure of off days
export interface OffDay {
  id: string; // Unique identifier for the off day
  date: string; // Date of the off day in string format
  reason: string; // Reason for the off day
}

// Interface defining the structure of documents uploaded by staff
export interface Document {
  id: string; // Unique identifier for the document
  name: string; // Name of the document file
  type: string; // Type of document (e.g., PDF, image)
  uploadedDate: string; // Date when the document was uploaded
  status: 'Approved' | 'Pending' | 'Rejected'; // Approval status of the document
}

// Interface defining leave balance structure for each staff member
export interface LeaveBalance {
  staffId: string; // Staff member ID
  sick: { used: number; total: number }; // Sick leave balance
  annual: { used: number; total: number; firstHalf: number; secondHalf: number; rollover: number }; // Annual leave with half-year breakdown
  paternity: { used: number; total: number }; // Paternity leave balance
  bereaved: { used: number; total: number }; // Bereavement leave balance
  maternity: { used: number; total: number }; // Maternity leave balance
}

// Import function to get available branches from branchData.ts
import { getBranches } from './branchData';

// Array of available departments in the company as a readonly tuple
export const DEPARTMENTS = ['Sales', 'Tecnical', 'Solar', 'Logistics', 'Audit', 'HR', 'RMS', 'Digital Media Team', 'Operation Management', 'Procurement', 'Warehouse'] as const;

// Type derived from the DEPARTMENTS array for type safety
export type Department = typeof DEPARTMENTS[number];

// Main interface defining the complete structure of a staff member
export interface StaffMember {
  id: string; // Unique identifier for the staff member
  firstName: string; // First name of the staff member
  middleName: string; // Middle name (can be empty)
  lastName: string; // Last name of the staff member
  dateOfBirth: string; // Date of birth in string format
  placeOfBirth: string; // Place where the staff member was born
  gender: 'Male' | 'Female'; // Gender of the staff member
  stateOfOrigin: string; // State of origin in Nigeria
  lga: string; // Local Government Area

  // Contact Details section
  phoneNumber: string; // Phone number of the staff member
  email: string; // Email address of the staff member
  address: string; // Residential address

  // Education section
  education: Education[]; // Array of education records

  // Employment Details section
  department: Department; // Department the staff member belongs to
  departmentRole: string; // Specific role within the department
  branchType: 'Single' | 'Multiple' | 'All'; // Type of branch assignment
  jobStatus: 'Permanent' | 'Ad hoc' | 'Intern' | 'Temporary'; // Employment status
  dateEmployed: string; // Date when employment started
  branches: Branch[]; // Array of branches the staff member is assigned to

  // Guardian Details section (next of kin information)
  guardianFirstName: string; // First name of the guardian
  guardianLastName: string; // Last name of the guardian
  guardianDOB: string; // Date of birth of the guardian
  guardianPhone: string; // Phone number of the guardian
  guardianEmail: string; // Email address of the guardian
  guardianAddress: string; // Address of the guardian
  guardianBusinessName: string; // Name of the guardian's business
  guardianBusinessAddress: string; // Address of the guardian's business

  // Leave and Off Days section
  leaves: Leave[]; // Array of leave requests
  offDays: OffDay[]; // Array of off days

  // Documents section
  documents: Document[]; // Array of uploaded documents

  // Status section
  status: 'Active' | 'Inactive'; // Current employment status

  // Avatar section
  avatar?: string; // Optional avatar image URL or path
}

// Helper function to create a branch object with formatted ID
function makeBranch(index: number, baseStatus: 'Primary' | 'Secondary' = 'Primary') {
  const AVAILABLE_BRANCHES = getBranches(); // Get list of available branches
  const name = AVAILABLE_BRANCHES[index] ?? `Branch ${index + 1}`; // Use branch name or fallback
  return { id: `BR${String(index + 1).padStart(3, '0')}`, name, baseStatus }; // Return formatted branch object
}

// Default staff data array containing sample staff members
const DEFAULT_STAFF_DATA: StaffMember[] = [
  {
    id: 'STF001', // Unique staff ID
    firstName: 'Adenuga', // First name
    middleName: '', // Middle name (empty)
    lastName: 'Victor', // Last name
    dateOfBirth: '1990-05-15', // Date of birth
    placeOfBirth: 'Lagos, Nigeria', // Place of birth
    gender: 'Male', // Gender
    stateOfOrigin: 'Lagos', // State of origin
    lga: 'Lagos Mainland', // Local Government Area
    phoneNumber: '+234 803 456 7890', // Phone number
    email: 'adenuga.victor@company.com', // Email address
    address: '45 Independence Layout, Lagos', // Residential address
    education: [], // Empty education array
    department: 'Sales', // Department
    departmentRole: 'Sales Officer', // Role in department
    branchType: 'Single', // Branch assignment type
    jobStatus: 'Permanent', // Employment status
    dateEmployed: '2020-03-15', // Employment start date
    branches: [makeBranch(0)], // Assigned branches
    guardianFirstName: 'John', // Guardian first name
    guardianLastName: 'Victor', // Guardian last name
    guardianDOB: '1965-08-20', // Guardian date of birth
    guardianPhone: '+234 802 345 6789', // Guardian phone
    guardianEmail: 'john.victor@email.com', // Guardian email
    guardianAddress: '12 Coal Camp Road, Lagos', // Guardian address
    guardianBusinessName: 'Victor Enterprises Ltd', // Guardian business name
    guardianBusinessAddress: 'Plot 15, Industrial Layout, Lagos', // Guardian business address
    leaves: [], // Empty leaves array
    offDays: [], // Empty off days array
    documents: [], // Empty documents array
    status: 'Active' // Employment status
  },
  {
    id: 'STF002', // Second staff member
    firstName: 'Ogunniyi',
    middleName: '',
    lastName: 'Victoria',
    dateOfBirth: '1992-11-08',
    placeOfBirth: 'Ibadan, Nigeria',
    gender: 'Female',
    stateOfOrigin: 'Oyo',
    lga: 'Ibadan North',
    phoneNumber: '+234 805 678 9012',
    email: 'ogunniyi.victoria@company.com',
    address: '78 Zoo Road, Ibadan',
    education: [],
    department: 'Sales',
    departmentRole: 'Sales Officer',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2019-06-01',
    branches: [makeBranch(1)],
    guardianFirstName: 'Ibrahim',
    guardianLastName: 'Ogunniyi',
    guardianDOB: '1960-03-12',
    guardianPhone: '+234 803 234 5678',
    guardianEmail: 'i.ogunniyi@email.com',
    guardianAddress: '25 Murtala Mohammed Way, Ibadan',
    guardianBusinessName: 'Ogunniyi Trading',
    guardianBusinessAddress: 'Dugbe Market, Ibadan',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF003', // Third staff member
    firstName: 'Inioluwa',
    middleName: '',
    lastName: 'Ajala',
    dateOfBirth: '1995-02-22',
    placeOfBirth: 'Port Harcourt, Nigeria',
    gender: 'Male',
    stateOfOrigin: 'Rivers',
    lga: 'Port Harcourt',
    phoneNumber: '+234 806 789 0123',
    email: 'inioluwa.ajala@company.com',
    address: '12 Ring Road, Port Harcourt',
    education: [],
    department: 'Tecnical',
    departmentRole: 'Technical Officer',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2021-01-10',
    branches: [makeBranch(2)],
    guardianFirstName: 'Folake',
    guardianLastName: 'Ajala',
    guardianDOB: '1968-07-15',
    guardianPhone: '+234 802 678 9012',
    guardianEmail: 'f.ajala@email.com',
    guardianAddress: '34 Bodija Estate, Port Harcourt',
    guardianBusinessName: 'Ajala Tech Services',
    guardianBusinessAddress: '15 Tech Park, Port Harcourt',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF004', // Fourth staff member
    firstName: 'Abiodun',
    middleName: '',
    lastName: 'Adeyinka',
    dateOfBirth: '1998-09-30',
    placeOfBirth: 'Oshogbo, Nigeria',
    gender: 'Male',
    stateOfOrigin: 'Osun',
    lga: 'Osogbo',
    phoneNumber: '+234 807 890 1234',
    email: 'abiodun.adeyinka@company.com',
    address: '56 Wetheral Road, Oshogbo',
    education: [],
    department: 'Tecnical',
    departmentRole: 'Junior Technical Officer',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2023-01-15',
    branches: [makeBranch(3)],
    guardianFirstName: 'Emeka',
    guardianLastName: 'Adeyinka',
    guardianDOB: '1970-04-18',
    guardianPhone: '+234 803 456 7891',
    guardianEmail: 'e.adeyinka@email.com',
    guardianAddress: '89 Douglas Road, Oshogbo',
    guardianBusinessName: 'Adeyinka Construction Ltd',
    guardianBusinessAddress: 'Plot 23, Oshogbo',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF005', // Fifth staff member
    firstName: 'Jolayemi',
    middleName: '',
    lastName: 'Emmanuel',
    dateOfBirth: '1988-12-05',
    placeOfBirth: 'Lagos, Nigeria',
    gender: 'Male',
    stateOfOrigin: 'Lagos',
    lga: 'Lagos Island',
    phoneNumber: '+234 808 901 2345',
    email: 'jolayemi.emmanuel@company.com',
    address: '23 Sultan Road, Lagos',
    education: [],
    department: 'Digital Media Team',
    departmentRole: 'Media Specialist',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2018-09-01',
    branches: [makeBranch(0)],
    guardianFirstName: 'Fatima',
    guardianLastName: 'Emmanuel',
    guardianDOB: '1963-06-25',
    guardianPhone: '+234 802 890 1234',
    guardianEmail: 'f.emmanuel@email.com',
    guardianAddress: '67 Airport Road, Lagos',
    guardianBusinessName: 'Emmanuel Motors',
    guardianBusinessAddress: 'Opposite Central Market, Lagos',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF006', // Sixth staff member
    firstName: 'Oluwakemi',
    middleName: '',
    lastName: 'Alabi',
    dateOfBirth: '1993-07-18',
    placeOfBirth: 'Asaba, Nigeria',
    gender: 'Female',
    stateOfOrigin: 'Delta',
    lga: 'Oshimili South',
    phoneNumber: '+234 809 012 3456',
    email: 'oluwakemi.alabi@company.com',
    address: '90 Nnebisi Road, Asaba',
    education: [],
    department: 'Warehouse',
    departmentRole: 'Warehouse Officer',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2020-06-01',
    branches: [makeBranch(4)],
    guardianFirstName: 'Chukwuma',
    guardianLastName: 'Alabi',
    guardianDOB: '1965-11-30',
    guardianPhone: '+234 803 789 0123',
    guardianEmail: 'c.alabi@email.com',
    guardianAddress: '45 Cable Point, Asaba',
    guardianBusinessName: 'Alabi Pharmaceuticals',
    guardianBusinessAddress: 'Summit Road, Asaba',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF007', // Seventh staff member
    firstName: 'Kayode',
    middleName: '',
    lastName: 'Fagbamila',
    dateOfBirth: '1991-03-20',
    placeOfBirth: 'Ilorin, Nigeria',
    gender: 'Male',
    stateOfOrigin: 'Kwara',
    lga: 'Ilorin West',
    phoneNumber: '+234 810 234 5678',
    email: 'kayode.fagbamila@company.com',
    address: '34 Ahmadu Bello Way, Ilorin',
    education: [],
    department: 'Procurement',
    departmentRole: 'Procurement Officer',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2019-09-01',
    branches: [makeBranch(5)],
    guardianFirstName: 'Grace',
    guardianLastName: 'Fagbamila',
    guardianDOB: '1964-05-10',
    guardianPhone: '+234 802 456 7890',
    guardianEmail: 'g.fagbamila@email.com',
    guardianAddress: '78 Stadium Road, Ilorin',
    guardianBusinessName: 'Fagbamila Trading Company',
    guardianBusinessAddress: '12 Market Square, Ilorin',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  },
  {
    id: 'STF008', // Eighth staff member
    firstName: 'Aderibigbe',
    middleName: '',
    lastName: 'Victoria',
    dateOfBirth: '1994-08-12',
    placeOfBirth: 'Abeokuta, Nigeria',
    gender: 'Female',
    stateOfOrigin: 'Ogun',
    lga: 'Abeokuta North',
    phoneNumber: '+234 811 345 6789',
    email: 'aderibigbe.victoria@company.com',
    address: '56 Olusegun Obasanjo Way, Abeokuta',
    education: [],
    department: 'Operation Management',
    departmentRole: 'Operations Coordinator',
    branchType: 'Single',
    jobStatus: 'Permanent',
    dateEmployed: '2021-05-01',
    branches: [makeBranch(6)],
    guardianFirstName: 'Samuel',
    guardianLastName: 'Victoria',
    guardianDOB: '1966-02-14',
    guardianPhone: '+234 803 567 8901',
    guardianEmail: 's.victoria@email.com',
    guardianAddress: '23 Okada Estate, Abeokuta',
    guardianBusinessName: 'Victoria Enterprises',
    guardianBusinessAddress: '45 Ibara Road, Abeokuta',
    leaves: [],
    offDays: [],
    documents: [],
    status: 'Active'
  }
];

// Mock leave balances data for demonstration
export const mockLeaveBalances: LeaveBalance[] = [
  {
    staffId: 'STF001',
    sick: { used: 0, total: 3 },
    annual: { used: 5, total: 14, firstHalf: 2, secondHalf: 3, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF002',
    sick: { used: 2, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF003',
    sick: { used: 0, total: 3 },
    annual: { used: 6, total: 14, firstHalf: 0, secondHalf: 6, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF004',
    sick: { used: 0, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 0, total: 3 },
    maternity: { used: 90, total: 90 } // Maternity leave used
  },
  {
    staffId: 'STF005',
    sick: { used: 0, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 0, total: 3 },
    bereaved: { used: 3, total: 3 }, // Bereavement leave used
    maternity: { used: 0, total: 90 }
  },
  {
    staffId: 'STF006',
    sick: { used: 0, total: 3 },
    annual: { used: 0, total: 14, firstHalf: 0, secondHalf: 0, rollover: 0 },
    paternity: { used: 3, total: 3 }, // Paternity leave used
    bereaved: { used: 0, total: 3 },
    maternity: { used: 0, total: 90 }
  }
];

// Key used for storing staff data in localStorage
const STORAGE_KEY = 'staff_data';

// Function to load staff data from localStorage or return defaults
function loadStaffData(): StaffMember[] {
  try {
    const stored = localStorage?.getItem(STORAGE_KEY); // Attempt to get stored data
    if (stored) {
      return JSON.parse(stored); // Parse and return stored data
    }
  } catch (error) {
    console.warn('Failed to load staff data from localStorage:', error); // Log warning on error
  }
  return [...DEFAULT_STAFF_DATA]; // Return copy of default data
}

// Mutable array for runtime staff data updates
export let mockStaffData: StaffMember[] = loadStaffData();

// Function to persist staff data to localStorage
function persistStaffData(): void {
  try {
    localStorage?.setItem(STORAGE_KEY, JSON.stringify(mockStaffData)); // Store data as JSON
  } catch (error) {
    console.warn('Failed to persist staff data to localStorage:', error); // Log warning on error
  }
}

// Function to generate the next available staff ID
function getNextStaffId(): string {
  const ids = mockStaffData.map(s => parseInt(s.id.replace('STF', ''), 10)).filter(id => !isNaN(id)); // Extract numeric IDs
  const maxId = ids.length > 0 ? Math.max(...ids) : 0; // Find maximum ID
  return `STF${String(maxId + 1).padStart(3, '0')}`; // Return formatted next ID
}

// Function to add a new staff member to the data
export function addStaffMember(staff: Omit<StaffMember, 'id'>): StaffMember {
  const newStaff: StaffMember = {
    ...staff, // Spread provided staff data
    id: getNextStaffId() // Generate new ID
  };
  mockStaffData.push(newStaff); // Add to array
  persistStaffData(); // Save to localStorage
  return newStaff; // Return the new staff member
}

// Function to update the status of a staff member
export function updateStaffStatus(staffId: string, status: 'Active' | 'Inactive'): boolean {
  const staff = mockStaffData.find(s => s.id === staffId); // Find staff by ID
  if (staff) {
    staff.status = status; // Update status
    persistStaffData(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to update a staff member's information
export function updateStaffMember(staffId: string, updates: Partial<StaffMember>): boolean {
  const staff = mockStaffData.find(s => s.id === staffId); // Find staff by ID
  if (staff) {
    Object.assign(staff, updates); // Apply updates
    persistStaffData(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to reset staff data to default values
export function resetStaffData(): void {
  mockStaffData = [...DEFAULT_STAFF_DATA]; // Reset to defaults
  persistStaffData(); // Save reset data
}

// Interface defining the structure of notifications
export interface Notification {
  id: string; // Unique identifier for the notification
  staffId: string; // ID of the staff member related to the notification
  staffName: string; // Name of the staff member
  action: string; // Action that triggered the notification
  section: string; // Section of the app where the action occurred
  timestamp: string; // Timestamp of when the notification was created
  read: boolean; // Whether the notification has been read
  details: string; // Additional details about the notification
}

// Array of mock notifications for demonstration
export const mockNotifications: Notification[] = [
  {
    id: 'NOT001', // Unique notification ID
    staffId: 'STF001', // Related staff ID
    staffName: 'Adenuga Victor', // Staff name
    action: 'Joined Sales Team', // Action description
    section: 'Onboarding', // App section
    timestamp: '2024-11-12 09:30 AM', // Timestamp
    read: false, // Unread status
    details: 'New staff member added to Sales department' // Additional details
  },
  {
    id: 'NOT002',
    staffId: 'STF002',
    staffName: 'Ogunniyi Victoria',
    action: 'Joined Sales Team',
    section: 'Onboarding',
    timestamp: '2024-11-12 08:15 AM',
    read: false,
    details: 'New staff member added to Sales department'
  },
  {
    id: 'NOT003',
    staffId: 'STF003',
    staffName: 'Inioluwa Ajala',
    action: 'Joined Technical Team',
    section: 'Onboarding',
    timestamp: '2024-11-11 04:45 PM',
    read: true,
    details: 'New staff member added to Technical department'
  },
  {
    id: 'NOT004',
    staffId: 'STF004',
    staffName: 'Abiodun Adeyinka',
    action: 'Joined Technical Team',
    section: 'Onboarding',
    timestamp: '2024-11-11 02:20 PM',
    read: true,
    details: 'New staff member added to Technical department'
  },
  {
    id: 'NOT005',
    staffId: 'STF005',
    staffName: 'Jolayemi Emmanuel',
    action: 'Joined Digital Media Team',
    section: 'Onboarding',
    timestamp: '2024-11-11 11:00 AM',
    read: true,
    details: 'New staff member added to Digital Media Team department'
  },
  {
    id: 'NOT006',
    staffId: 'STF006',
    staffName: 'Oluwakemi Alabi',
    action: 'Joined Warehouse Team',
    section: 'Onboarding',
    timestamp: '2024-11-10 03:30 PM',
    read: true,
    details: 'New staff member added to Warehouse department'
  }
];

// ============================================
// Utility Functions & Derived Data
// ============================================

/**
 * Get department statistics from staff data
 * Returns an array of department stats with counts and percentages
 */
export function getDepartmentStats() {
  const departmentMap = new Map<Department, number>(); // Map to count staff per department

  mockStaffData.forEach(staff => {
    const count = departmentMap.get(staff.department) || 0; // Get current count or 0
    departmentMap.set(staff.department, count + 1); // Increment count
  });

  const total = mockStaffData.length; // Total number of staff

  return DEPARTMENTS.map(dept => {
    const count = departmentMap.get(dept) || 0; // Get count for department
    const percentage = total > 0 ? (count / total) * 100 : 0; // Calculate percentage
    return {
      name: dept, // Department name
      count, // Number of staff
      percentage: parseFloat(percentage.toFixed(1)) // Percentage with 1 decimal place
    };
  }).filter(dept => dept.count > 0); // Filter out departments with no staff
}

/**
 * Get employee table data formatted for display
 * Returns an array of objects suitable for table display
 */
export function getEmployeeTableData() {
  return mockStaffData.map((staff, index) => ({
    id: index + 1, // Sequential ID for table
    name: `${staff.firstName} ${staff.lastName}`, // Full name
    email: staff.email, // Email address
    department: staff.department, // Department name
    position: staff.departmentRole, // Job position
    status: staff.status === 'Active' ? 'Active' : 'Inactive', // Status string
    avatar: `${staff.firstName[0]}${staff.lastName[0]}` // Initials for avatar
  }));
}

/**
 * Get department chart data
 * Returns data formatted for chart visualization
 */
export function getDepartmentChartData() {
  return getDepartmentStats().map(dept => ({
    name: dept.name, // Department name
    value: dept.count // Number of staff for chart value
  }));
}

/**
 * Get staff by department
 * Returns an array of staff members filtered by department
 */
export function getStaffByDepartment(department: Department) {
  return mockStaffData.filter(staff => staff.department === department); // Filter staff by department
}

/**
 * Update staff member data
 * Updates the staff member with the given ID with new data
 */
export function updateStaff(staffId: string, updatedStaff: StaffMember): boolean {
  const index = mockStaffData.findIndex(s => s.id === staffId);
  if (index !== -1) {
    mockStaffData[index] = updatedStaff;
    return true;
  }
  return false;
}

/**
 * Get total employee count
 * Returns the total number of employees
 */
export function getTotalEmployeeCount() {
  return mockStaffData.length; // Return length of staff array
}

/**
 * Get active employee count
 * Returns the number of active employees
 */
export function getActiveEmployeeCount() {
  return mockStaffData.filter(staff => staff.status === 'Active').length; // Count active staff
}

/**
 * Get inactive employee count
 * Returns the number of inactive employees
 */
export function getInactiveEmployeeCount() {
  return mockStaffData.filter(staff => staff.status === 'Inactive').length; // Count inactive staff
}

/**
 * Get attendance data for all staff
 * Returns mock attendance data for each staff member
 */
export function getAttendanceData() {
  return mockStaffData.map(staff => ({
    id: staff.id, // Staff ID
    fullName: `${staff.firstName} ${staff.lastName}`, // Full name
    department: staff.department, // Department
    present: Math.floor(Math.random() * 5) + 18, // Random present days (18-22)
    early: Math.floor(Math.random() * 5) + 14, // Random early days (14-18)
    late: Math.floor(Math.random() * 6), // Random late days (0-5)
    permitted: Math.floor(Math.random() * 3), // Random permitted days (0-2)
    absent: Math.floor(Math.random() * 4), // Random absent days (0-3)
    offDays: 2, // Fixed off days
    leaveDays: 0, // Fixed leave days
    averageTime: `08:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` // Random average time
  }));
}

/**
 * Get total attendance metrics
 * Returns aggregated attendance statistics
 */
export function getAttendanceMetrics() {
  const attendance = getAttendanceData(); // Get attendance data
  const totalPresent = attendance.reduce((sum, r) => sum + r.present, 0); // Sum present days
  const totalEarly = attendance.reduce((sum, r) => sum + r.early, 0); // Sum early days
  const totalLate = attendance.reduce((sum, r) => sum + r.late, 0); // Sum late days
  const totalAbsent = attendance.reduce((sum, r) => sum + r.absent, 0); // Sum absent days
  const avgAttendanceRate = ((totalPresent / (attendance.length * 22)) * 100).toFixed(1); // Calculate average rate

  return {
    totalPresent, // Total present days
    totalEarly, // Total early days
    totalLate, // Total late days
    totalAbsent, // Total absent days
    avgAttendanceRate: parseFloat(avgAttendanceRate as string), // Average attendance rate
    totalWorkingDays: 22, // Total working days in period
    activeBranches: getBranches().length // Number of active branches
  };
}

/**
 * Check if a staff member is on an active off day today
 * Returns true if the staff member has an off day for today's date
 */
export function isStaffOnActiveOffDay(staff: any): boolean {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  // Check if staff has any off days that match today's date
  if (!staff.offDays || !Array.isArray(staff.offDays)) return false;
  return staff.offDays.some((offDay: any) => offDay.date === todayString);
}

/**
 * Returns the leave balance for a specific staff member
 * @param staffId - The ID of the staff member
 * @returns The leave balance object or null if not found
 */
export function getLeaveBalance(staffId: string): LeaveBalance | null {
  return mockLeaveBalances.find(balance => balance.staffId === staffId) || null;
}
