// This file manages time-related data for the HR dashboard
// It handles branch time settings and individual staff time schedules

// Interface defining the structure of branch time settings
export interface BranchTime {
  id: string; // Unique identifier for the branch time setting
  branchName: string; // Name of the branch
  resumptionTime: string; // Default resumption time (e.g., "08:00")
  closeTime: string; // Default closing time (e.g., "17:00")
  workingDays: string[]; // Array of working days (e.g., ["Monday", "Tuesday", ...])
  saturdayResumptionTime: string; // Resumption time for Saturdays (e.g., "09:00")
  lastSaturdayResumptionTime: string; // Resumption time for last Saturday of month (e.g., "10:30")
  specialDates: { date: string, resumptionTime: string, closeTime: string }[]; // Special dates with custom times
}

// Interface defining the structure of individual staff time settings
export interface IndividualTime {
  id: string; // Unique identifier for the individual time setting
  staffId: string; // ID of the staff member
  staffName: string; // Name of the staff member
  department: string; // Department of the staff member
  resumptionTime: string; // Custom resumption time (e.g., "09:00 AM")
  closeTime: string; // Custom closing time (e.g., "06:00 PM")
  isCustom: boolean; // Flag indicating if this is a custom schedule
}

// Import function to get branches from branchData module
import { getBranches } from './branchData';

// Function to generate default branch times based on current branches
function getDefaultBranchTimes(): BranchTime[] {
  const branches = getBranches(); // Get current branches
  // Create default time settings for each branch
  return branches.map((branch: any, idx: number) => ({
    id: branch.id || `BR${(idx + 1).toString().padStart(3, '0')}`, // Generate ID if not present
    branchName: branch.name || branch, // Use branch name
    resumptionTime: '08:00', // Default 8 AM resumption
    closeTime: '17:00', // Default 5 PM close
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Standard working days
    saturdayResumptionTime: '09:00', // Saturday starts at 9 AM
    lastSaturdayResumptionTime: '10:30', // Last Saturday starts at 10:30 AM
    specialDates: [] // No special dates by default
  }));
}

// Default individual time settings array
const DEFAULT_INDIVIDUAL_TIMES: IndividualTime[] = [
  {
    id: 'IT001', // Unique ID for this time setting
    staffId: 'STF001', // Staff member ID
    staffName: 'Chukwuemeka J. Okonkwo', // Staff member name
    department: 'IT Department', // Department
    resumptionTime: '09:00 AM', // Custom start time
    closeTime: '06:00 PM', // Custom end time
    isCustom: true // This is a custom schedule
  },
  {
    id: 'IT002', // Unique ID for this time setting
    staffId: 'STF005', // Staff member ID
    staffName: 'Abdullahi M. Abubakar', // Staff member name
    department: 'Operations', // Department
    resumptionTime: '07:00 AM', // Early start time
    closeTime: '04:00 PM', // Early end time
    isCustom: true // This is a custom schedule
  }
];

// Storage keys for localStorage persistence
const BRANCH_TIME_STORAGE_KEY = 'branch_time_data'; // Key for branch time data
const INDIVIDUAL_TIME_STORAGE_KEY = 'individual_time_data'; // Key for individual time data

// Function to load branch times from localStorage or generate defaults
function loadBranchTimes(): BranchTime[] {
  const data = localStorage.getItem(BRANCH_TIME_STORAGE_KEY); // Get stored data
  if (data) return JSON.parse(data); // Parse and return if exists
  // Generate from current branches if not in storage
  return getDefaultBranchTimes();
}

// Function to load individual times from localStorage or use defaults
function loadIndividualTimes(): IndividualTime[] {
  const data = localStorage.getItem(INDIVIDUAL_TIME_STORAGE_KEY); // Get stored data
  return data ? JSON.parse(data) : DEFAULT_INDIVIDUAL_TIMES; // Parse or return defaults
}

// Mutable arrays for runtime data management
let branchTimes: BranchTime[] = loadBranchTimes(); // Current branch time settings
let individualTimes: IndividualTime[] = loadIndividualTimes(); // Current individual time settings

// Function to persist branch times to localStorage
export function persistBranchTimes() {
  localStorage.setItem(BRANCH_TIME_STORAGE_KEY, JSON.stringify(branchTimes)); // Store as JSON
}

// Function to persist individual times to localStorage
export function persistIndividualTimes() {
  localStorage.setItem(INDIVIDUAL_TIME_STORAGE_KEY, JSON.stringify(individualTimes)); // Store as JSON
}

// Function to get all branch times
export function getBranchTimes(): BranchTime[] {
  return branchTimes; // Return current branch times
}

// Function to get all individual times
export function getIndividualTimes(): IndividualTime[] {
  return individualTimes; // Return current individual times
}

// Function to update a branch time setting
export function updateBranchTime(id: string, updates: Partial<BranchTime>): boolean {
  const idx = branchTimes.findIndex(b => b.id === id); // Find branch by ID
  if (idx === -1) return false; // Return false if not found
  branchTimes[idx] = { ...branchTimes[idx], ...updates }; // Apply updates
  persistBranchTimes(); // Save changes
  return true; // Return success
}

// Function to update an individual time setting
export function updateIndividualTime(id: string, updates: Partial<IndividualTime>): boolean {
  const idx = individualTimes.findIndex(i => i.id === id); // Find individual time by ID
  if (idx === -1) return false; // Return false if not found
  individualTimes[idx] = { ...individualTimes[idx], ...updates }; // Apply updates
  persistIndividualTimes(); // Save changes
  return true; // Return success
}

// Function to add a new individual time setting
export function addIndividualTime(time: Omit<IndividualTime, 'id'>): IndividualTime {
  const newId = `IT${(individualTimes.length + 1).toString().padStart(3, '0')}`; // Generate new ID
  const newTime: IndividualTime = { id: newId, ...time }; // Create new time object
  individualTimes.push(newTime); // Add to array
  persistIndividualTimes(); // Save changes
  return newTime; // Return the new time setting
}

// Function to remove an individual time setting
export function removeIndividualTime(id: string): boolean {
  const idx = individualTimes.findIndex(i => i.id === id); // Find index by ID
  if (idx === -1) return false; // Return false if not found
  individualTimes.splice(idx, 1); // Remove from array
  persistIndividualTimes(); // Save changes
  return true; // Return success
}

// Function to reset all time data to defaults
export function resetTimeData() {
  branchTimes = getDefaultBranchTimes(); // Reset branch times
  individualTimes = [...DEFAULT_INDIVIDUAL_TIMES]; // Reset individual times
  persistBranchTimes(); // Save branch times
  persistIndividualTimes(); // Save individual times
}
