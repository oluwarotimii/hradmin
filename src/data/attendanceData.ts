// This file manages attendance data for the HR dashboard
// It provides interfaces and functions for handling attendance records and monthly statistics

// Interface defining the structure of an attendance record
export interface AttendanceRecord {
  id: string; // Unique identifier for the attendance record
  name: string; // Name of the employee
  checkIn: string; // Check-in time (e.g., "08:45 AM")
  checkOut: string; // Check-out time (e.g., "05:30 PM")
  hours: string; // Total hours worked (e.g., "8.75")
  status: 'Present' | 'Late' | 'Absent' | 'Half Day'; // Attendance status
  date: string; // Date of the attendance record
}

// Interface defining the structure of monthly attendance statistics
export interface MonthlyStat {
  month: string; // Month and year (e.g., "Oct 2025")
  present: number; // Number of present days
  absent: number; // Number of absent days
  late: number; // Number of late days
  leaves: number; // Number of leave days
}

// Default attendance records array with sample data
const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: "1", name: "Akeem Abdulrasheed", checkIn: "08:45 AM", checkOut: "05:30 PM", hours: "8.75", status: "Present", date: "Nov 5, 2025" }, // Present employee
  { id: "2", name: "Ayodele Joses", checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8.75", status: "Present", date: "Nov 5, 2025" }, // Present employee
  { id: "3", name: "Okhai Benjamin", checkIn: "08:30 AM", checkOut: "05:15 PM", hours: "8.75", status: "Present", date: "Nov 5, 2025" }, // Present employee
  { id: "4", name: "Ihimire Jones", checkIn: "---", checkOut: "---", hours: "0", status: "Absent", date: "Nov 5, 2025" }, // Absent employee
  { id: "5", name: "Ariyo Suliha", checkIn: "10:45 AM", checkOut: "---", hours: "---", status: "Late", date: "Nov 5, 2025" }, // Late employee
  { id: "6", name: "Bolorunduro Tolulope", checkIn: "08:00 AM", checkOut: "02:00 PM", hours: "6", status: "Half Day", date: "Nov 5, 2025" }, // Half day employee
  { id: "7", name: "Fatimah Ariyo", checkIn: "09:00 AM", checkOut: "05:45 PM", hours: "8.75", status: "Present", date: "Nov 5, 2025" }, // Present employee
];

// Default monthly statistics array with sample data
const DEFAULT_MONTHLY_STATS: MonthlyStat[] = [
  { month: "Oct 2025", present: 22, absent: 2, late: 3, leaves: 1 }, // October statistics
  { month: "Sep 2025", present: 21, absent: 1, late: 2, leaves: 2 }, // September statistics
  { month: "Aug 2025", present: 23, absent: 0, late: 1, leaves: 1 }, // August statistics
];

// Storage keys for localStorage
const STORAGE_KEY_ATTENDANCE = 'attendance_records'; // Key for attendance records
const STORAGE_KEY_MONTHLY = 'monthly_stats'; // Key for monthly statistics

// Function to load attendance records from localStorage or return defaults
function loadAttendanceRecords(): AttendanceRecord[] {
  try {
    const stored = localStorage?.getItem(STORAGE_KEY_ATTENDANCE); // Attempt to get stored data
    if (stored) {
      return JSON.parse(stored); // Parse and return stored records
    }
  } catch (error) {
    console.warn('Failed to load attendance records from localStorage:', error); // Log warning on error
  }
  return [...DEFAULT_ATTENDANCE_RECORDS]; // Return copy of default records
}

// Function to load monthly stats from localStorage or return defaults
function loadMonthlyStat(): MonthlyStat[] {
  try {
    const stored = localStorage?.getItem(STORAGE_KEY_MONTHLY); // Attempt to get stored data
    if (stored) {
      return JSON.parse(stored); // Parse and return stored stats
    }
  } catch (error) {
    console.warn('Failed to load monthly stats from localStorage:', error); // Log warning on error
  }
  return [...DEFAULT_MONTHLY_STATS]; // Return copy of default stats
}

// Mutable arrays for runtime updates
let mockAttendanceRecords: AttendanceRecord[] = loadAttendanceRecords(); // Current attendance records
let mockMonthlyStat: MonthlyStat[] = loadMonthlyStat(); // Current monthly statistics

// Function to persist attendance records to localStorage
function persistAttendanceRecords(): void {
  try {
    localStorage?.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(mockAttendanceRecords)); // Store records as JSON
  } catch (error) {
    console.warn('Failed to persist attendance records to localStorage:', error); // Log warning on error
  }
}

// Function to persist monthly stats to localStorage
function persistMonthlyStat(): void {
  try {
    localStorage?.setItem(STORAGE_KEY_MONTHLY, JSON.stringify(mockMonthlyStat)); // Store stats as JSON
  } catch (error) {
    console.warn('Failed to persist monthly stats to localStorage:', error); // Log warning on error
  }
}

// Function to get all attendance records
export function getAttendanceRecords(): AttendanceRecord[] {
  return mockAttendanceRecords; // Return current records
}

// Function to get all monthly stats
export function getMonthlyStat(): MonthlyStat[] {
  return mockMonthlyStat; // Return current stats
}

// Function to add a new attendance record
export function addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
  const maxId = mockAttendanceRecords.length > 0
    ? Math.max(...mockAttendanceRecords.map(r => parseInt(r.id))) // Find maximum existing ID
    : 0; // Default to 0 if no records
  const newRecord: AttendanceRecord = {
    ...record, // Spread provided record data
    id: String(maxId + 1) // Generate new ID
  };
  mockAttendanceRecords.push(newRecord); // Add to array
  persistAttendanceRecords(); // Save to localStorage
  return newRecord; // Return the new record
}

// Function to update an existing attendance record
export function updateAttendanceRecord(id: string | number, updates: Partial<AttendanceRecord>): boolean {
  const record = mockAttendanceRecords.find(r => r.id === id || r.id === id.toString()); // Find record by ID
  if (record) {
    Object.assign(record, updates); // Apply updates
    persistAttendanceRecords(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to remove an attendance record
export function removeAttendanceRecord(id: string | number): boolean {
  const index = mockAttendanceRecords.findIndex(r => r.id === id || r.id === id.toString()); // Find index by ID
  if (index > -1) {
    mockAttendanceRecords.splice(index, 1); // Remove from array
    persistAttendanceRecords(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to add a new monthly stat
export function addMonthlyStat(stat: MonthlyStat): void {
  mockMonthlyStat.push(stat); // Add to array
  persistMonthlyStat(); // Save to localStorage
}

// Function to update an existing monthly stat
export function updateMonthlyStat(month: string, updates: Partial<MonthlyStat>): boolean {
  const stat = mockMonthlyStat.find(s => s.month === month); // Find stat by month
  if (stat) {
    Object.assign(stat, updates); // Apply updates
    persistMonthlyStat(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to remove a monthly stat
export function removeMonthlyStat(month: string): boolean {
  const index = mockMonthlyStat.findIndex(s => s.month === month); // Find index by month
  if (index > -1) {
    mockMonthlyStat.splice(index, 1); // Remove from array
    persistMonthlyStat(); // Save changes
    return true; // Return success
  }
  return false; // Return failure
}

// Function to reset all attendance data to defaults
export function resetAttendanceData(): void {
  mockAttendanceRecords = [...DEFAULT_ATTENDANCE_RECORDS]; // Reset records
  mockMonthlyStat = [...DEFAULT_MONTHLY_STATS]; // Reset stats
  persistAttendanceRecords(); // Save records
  persistMonthlyStat(); // Save stats
}
