# Attendance Management System Interface Description

## Overview
The Attendance Management System is a comprehensive HR module that enables organizations to track, monitor, and analyze employee attendance patterns. The system provides real-time attendance tracking, detailed reporting, and visual analytics to help HR teams make informed decisions about workforce management.

## Core Components

### 1. Attendance View (`AttendanceView.tsx`)
The main component that serves as the central hub for all attendance management activities. It features multiple sections for different aspects of attendance tracking:

#### A. Statistics Cards Section
- **Present Today Card**: Shows total present employees vs total employees and attendance rate percentage
- **Late Arrivals Card**: Displays count of late arrivals and percentage of total employees
- **Average Working Hours Card**: Shows average working hours with comparison to previous period
- **On Leave Card**: Displays employees currently on leave with breakdown of approved/pending

#### B. Attendance Chart Component (`AttendanceChart.tsx`)
- **Weekly Attendance Trend**: Line chart showing attendance percentages for each day of the week
- **Visual Analytics**: Interactive chart with tooltips and responsive design
- **Data Points**: Monday-Sunday attendance percentages with smooth curve visualization

#### C. Today's Attendance Table
- **Real-time Tracking**: Shows today's attendance records with employee details
- **Check-in/Check-out Times**: Displays arrival and departure times
- **Working Hours**: Shows total hours worked for the day
- **Status Indicators**: Color-coded badges for Present, Late, Absent, etc.

#### D. Monthly Summary Section
- **Historical Data**: Displays attendance statistics for recent months
- **Detailed Breakdown**: Shows present, absent, late, and leave days per month
- **Trend Analysis**: Enables comparison of attendance patterns over time

#### E. Attendance Report Table
- **Comprehensive Records**: Detailed attendance data for all staff members
- **Multiple Metrics**: Present, early, late, permitted, absent, off days, leave days, and average time
- **Sorting Capabilities**: Sort by various criteria (name, department, attendance metrics)

#### F. Performance Metrics Section
- **Punctuality Rate**: Percentage of early arrivals vs total present
- **Late Arrival Rate**: Percentage of late arrivals vs total present
- **Absence Rate**: Overall absence rate across the organization

## User Interface Features

### Search and Filtering
- Global search by name, department, or ID
- Branch filtering with dropdown selector
- Date range filtering (Today, Week, Month, Quarter, Year, Custom)
- Status filtering (All Staff, Early Arrivals, Late Arrivals, Absent)
- Sort by various criteria (Name, Department, Present Days, etc.)

### Visual Elements
- Color-coded status badges (Success, Warning, Danger)
- Icon-based navigation and actions
- Progress bars for performance metrics
- Interactive cards with hover effects
- Responsive grid layouts for all screen sizes

### Data Visualization
- Line charts for attendance trends
- Progress bars for performance metrics
- Statistical cards with trend indicators
- Department-wise attendance charts

## Backend Integration Points

### API Endpoints
```
GET /api/attendance - Retrieve all attendance records
GET /api/attendance/{id} - Retrieve specific attendance record
POST /api/attendance/check-in - Mark attendance check-in
POST /api/attendance/check-out - Mark attendance check-out
POST /api/attendance/manual - Create manual attendance record
PUT /api/attendance/{id} - Update attendance record
GET /api/attendance/summary - Get attendance summary
GET /api/attendance/staff-data - Get staff attendance data
GET /api/attendance/monthly-stats - Get monthly attendance statistics
GET /api/attendance/attendance-locations - Manage attendance locations
POST /api/attendance/attendance-locations - Create attendance location
PUT /api/attendance/attendance-locations/{id} - Update attendance location
DELETE /api/attendance/attendance-locations/{id} - Delete attendance location
POST /api/branches/global-attendance-mode - Update global attendance mode
GET /api/branches/global-attendance-mode - Get global attendance mode status
```

### Data Models

#### Attendance Record Model
```typescript
interface AttendanceRecord {
  id: string;                           // Unique attendance record identifier
  staff_id: string;                     // ID of the staff member
  date: string;                         // Date of attendance (YYYY-MM-DD format)
  check_in_time?: string;               // Check-in time (HH:MM format)
  check_out_time?: string;              // Check-out time (HH:MM format)
  status: 'present' | 'late' | 'absent' | 'half_day' | 'on_leave'; // Attendance status
  location_coordinates?: {              // GPS coordinates for location verification
    longitude: number;
    latitude: number;
  };
  location_address?: string;            // Physical address of check-in location
  location_verified?: boolean;          // Whether location was verified
  hours_worked?: number;                // Total hours worked in the day
  createdAt: string;                    // Timestamp of record creation
  updatedAt: string;                    // Timestamp of last update
}
```

#### Staff Attendance Record Model
```typescript
interface StaffAttendanceRecord {
  id: string;                           // Staff member ID
  fullName: string;                     // Full name of the staff member
  department: string;                   // Department the staff belongs to
  branch?: string;                      // Branch location (optional)
  present: number;                      // Number of days present
  early: number;                        // Number of early arrivals
  late: number;                         // Number of late arrivals
  permitted: number;                    // Number of permitted absences
  absent: number;                       // Number of unexcused absences
  offDays: number;                      // Number of off days
  leaveDays: number;                    // Number of leave days
  averageTime: string;                  // Average working time
}
```

#### Attendance Summary Model
```typescript
interface AttendanceSummary {
  total_present: number;                // Total present days across all staff
  total_late: number;                   // Total late arrivals across all staff
  total_absent: number;                 // Total absent days across all staff
  total_half_day: number;               // Total half-day absences across all staff
  total_on_leave: number;               // Total leave days across all staff
  attendance_rate: number;              // Overall attendance rate percentage
  date_range: {                         // Date range for the summary
    start: string;                      // Start date (YYYY-MM-DD)
    end: string;                        // End date (YYYY-MM-DD)
  };
}
```

#### Attendance Location Model
```typescript
interface AttendanceLocation {
  id: string;                           // Unique location identifier
  name: string;                         // Name of the attendance location
  location_coordinates: string;         // Location coordinates as POINT string
  location_radius_meters: number;       // Radius around location for check-ins
  branch_id: number;                    // Associated branch ID
  is_active: boolean;                   // Whether location is active
  createdAt: string;                    // Timestamp of location creation
  updatedAt: string;                    // Timestamp of last update
}
```

### Authentication and Authorization
- JWT token authentication for all API requests
- Role-based access control (HR Manager, Department Manager, Employee)
- Permission validation for attendance modifications

### Error Handling
- Validation for attendance data parameters
- Location verification for check-ins
- Proper error messaging for failed operations
- Retry mechanisms for failed API calls

## User Experience Flow

### For HR Managers
1. Navigate to Attendance Management section
2. View dashboard with key attendance metrics
3. Monitor real-time attendance for the current day
4. Review historical attendance patterns
5. Filter and search attendance records as needed
6. Access detailed reports and performance metrics

### For Employees
1. Check in/out using location-verified system
2. View their personal attendance records
3. Request corrections for attendance discrepancies

## Responsive Design
- Mobile-first approach with responsive grid layouts
- Collapsible filter panels for smaller screens
- Adaptive table layouts with horizontal scrolling on mobile
- Touch-friendly buttons and controls

## Accessibility Features
- Semantic HTML structure
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader compatibility

## Performance Considerations
- Efficient data fetching with pagination
- Client-side filtering for improved responsiveness
- Lazy loading for large datasets
- Optimized rendering of chart components

## Security Measures
- Input validation and sanitization
- Secure API communication with HTTPS
- Role-based access controls
- Location verification for attendance tracking
- Audit logging for attendance modifications