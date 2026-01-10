// This file manages branch data for the HR dashboard
// It provides functionality to store, retrieve, and manipulate branch information

// Default list of branches as a readonly tuple
const BRANCH_LIST = [
  'TAIWO IT BRANCH', // IT services branch
  'TAIWO MOBILITY BRANCH', // Mobility solutions branch
  'TAIWO SOLAR BRANCH', // Solar energy branch
  'TAIWO REPAIR BRANCH', // Repair services branch
  'FATE BRANCH', // Fate location branch
  'OSOGBO BRANCH', // Osogbo location branch
  'IKEJA BRANCH', // Ikeja location branch
  'TAIWO FITI BRANCH', // Fiti location branch
  'OFFA BRANCH', // Offa location branch
  'TAIWO WAREHOUSE', // Main warehouse location
  'TANKE BRANCH', // Tanke location branch
  'CHALLENGE REPAIR BRANCH', // Challenge repair services branch
] as const; // Ensures the array is immutable

// Key used for storing branch data in localStorage
const STORAGE_KEY = 'branches_data';

// Function to load branches from localStorage or return defaults
function loadBranches(): string[] {
  try {
    const stored = localStorage?.getItem(STORAGE_KEY); // Attempt to get stored data
    if (stored) {
      return JSON.parse(stored); // Parse and return stored branches
    }
  } catch (error) {
    console.warn('Failed to load branches from localStorage:', error); // Log warning on error
  }
  return [...BRANCH_LIST]; // Return copy of default branches
}

// Mutable branches array for runtime updates
let branches: string[] = loadBranches();

// Function to persist branches to localStorage
function persistBranches(): void {
  try {
    localStorage?.setItem(STORAGE_KEY, JSON.stringify(branches)); // Store branches as JSON
  } catch (error) {
    console.warn('Failed to persist branches to localStorage:', error); // Log warning on error
  }
}

// Exported constant for default branches
export const BRANCHES = BRANCH_LIST;

// Type derived from the BRANCHES array for type safety
export type Branch = typeof BRANCHES[number];

// Function to get a copy of the current branches array
export function getBranches(): string[] {
  return [...branches]; // Return shallow copy to prevent external mutation
}

// Function to set the entire branches array
export function setBranches(newBranches: string[]): void {
  branches = [...newBranches]; // Update with copy of new branches
  persistBranches(); // Save to localStorage
}

// Function to add a new branch if it doesn't already exist
export function addBranch(branchName: string): void {
  if (branchName.trim() && !branches.includes(branchName.trim())) { // Check if valid and not duplicate
    branches.push(branchName.trim()); // Add trimmed branch name
    persistBranches(); // Save changes
  }
}

// Function to remove a branch by name
export function removeBranch(branchName: string): void {
  branches = branches.filter(b => b !== branchName); // Filter out the specified branch
  persistBranches(); // Save changes
}

// Function to reset branches to default values
export function resetBranches(): void {
  branches = [...BRANCH_LIST]; // Reset to default branches
  persistBranches(); // Save reset data
}

// Default export object containing all branch-related functions and constants
export default {
  BRANCHES, // Default branches constant
  getBranches, // Function to get branches
  setBranches, // Function to set branches
  addBranch, // Function to add a branch
  removeBranch, // Function to remove a branch
  resetBranches, // Function to reset branches
};
