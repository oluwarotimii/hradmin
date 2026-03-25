# HR Management System - Complete Integration Plan

**Project:** Femtech HR Frontend
**Stack:** React + Vite + Tailwind CSS v4 + TypeScript + Radix UI
**Last Updated:** March 9, 2026
**Status:** 🔍 Cross-Checking & Building Missing Features

---

## 📊 SYSTEM OVERVIEW

### The Big Picture

Your system has **4 modules** that work together:

```
BRANCHES → Set the rules (where, how, grace period, location mode)
   ↓
SHIFTS → Set expectations (when to work, scheduled times)
   ↓
LEAVE → Set exceptions (approved absences)
   ↓
ATTENDANCE → Records reality (what actually happened)
```

**Every attendance record is the result of all four modules combining.**

---

## 🎯 CURRENT STATUS - COMPREHENSIVE AUDIT

### ✅ What's Already Built (No Action Needed)

| Module | Feature | Component | Service | Status |
|--------|---------|-----------|---------|--------|
| **Branches** | Branch CRUD | `BranchManagementView.tsx` | `branchManagementService.ts` | ✅ Complete |
| **Branches** | Attendance Settings | `SettingsView.tsx` | `attendanceSettingsService.ts` | ✅ Complete |
| **Branches** | Grace Period Config | `SettingsView.tsx` | `attendanceSettingsService.ts` | ✅ Complete |
| **Shifts** | Shift Templates | `ShiftSchedulingView.tsx` | `shiftSchedulingService.ts` | ✅ Complete |
| **Shifts** | Shift Assignments | `ShiftSchedulingView.tsx` | `shiftSchedulingService.ts` | ✅ Complete |
| **Shifts** | Schedule Requests | `ShiftSchedulingView.tsx` | `shiftSchedulingService.ts` | ⚠️ Partial (no approval UI) |
| **Leave** | Leave Types | `LeaveManagementView.tsx` | `leaveManagementService.ts` | ✅ Complete |
| **Leave** | Leave Requests | `LeaveManagementView.tsx` | `leaveManagementService.ts` | ✅ Complete |
| **Leave** | Leave Allocations | `LeaveAllocationView.tsx` | `leaveAllocationService.ts` | ✅ Complete |
| **Attendance** | Check-in/Check-out | `AttendanceView.tsx` | `attendanceService.ts` | ✅ Complete |
| **Attendance** | Manual Entry | `AttendanceView.tsx` | `attendanceService.ts` | ✅ Complete |
| **Attendance** | View Records | `AttendanceView.tsx` | `attendanceService.ts` | ✅ Complete |
| **Attendance** | Process Attendance | `ProcessAttendanceModal.tsx` | `attendanceService.ts` | ✅ Complete |
| **Attendance** | Locations CRUD | `AttendanceLocationsView.tsx` | `attendanceService.ts` | ✅ Complete |
| **Attendance** | Reports | `AttendanceReportView.tsx` | `attendanceService.ts` | ✅ Complete |
| **Holidays** | Holiday CRUD | `HolidayManagementView.tsx` | `holidayService.ts` | ✅ Complete |
| **Time** | Shift Timings | `TimeManagementView.tsx` | `attendanceService.ts` | ✅ Complete |

---

### ❌ What's Missing (Need to Build)

| Priority | Feature | Backend Endpoint | Frontend Component | Service | Effort |
|----------|---------|------------------|-------------------|---------|--------|
| 🔴 **P1** | **Shift Exceptions** | `/api/shift-scheduling/exceptions` | ❌ Missing | ❌ Missing | Medium |
| 🔴 **P1** | **Holiday Duty Roster** | `/api/holiday-duty-roster` | ❌ Missing | ❌ Missing | Medium |
| 🟡 **P2** | **Schedule Request Approval** | `/api/shift-scheduling/schedule-requests/:id/approve` | ⚠️ Partial | ✅ Exists | Small |

---

### ⚠️ What Needs Verification

| Component | What to Check | Action Needed |
|-----------|---------------|---------------|
| `ShiftSchedulingView.tsx` | Exceptions tab exists in state but not implemented | Build full exceptions CRUD |
| `shiftSchedulingService.ts` | No exception methods | Add exception service functions |
| `holidayService.ts` | No duty roster methods | Add duty roster service functions |
| `HolidayManagementView.tsx` | No duty roster UI | Add duty roster tab and modals |

---

## 📋 IMPLEMENTATION PLAN

---

## Phase 1: Shift Exceptions (🔴 HIGH PRIORITY)

**Why First:**
- Affects daily attendance accuracy
- Employees with recurring exceptions (e.g., "every Monday 10am start") get marked late incorrectly
- Used every single day
- Self-contained (no dependencies on other missing features)

### 1.1 Backend Verification

**Check if these endpoints exist:**

```
GET    /api/shift-scheduling/exceptions
GET    /api/shift-scheduling/exceptions?userId=X
POST   /api/shift-scheduling/exceptions
PUT    /api/shift-scheduling/exceptions/:id
DELETE /api/shift-scheduling/exceptions/:id
```

**Action:** Test with Postman or check backend codebase

---

### 1.2 Service Layer

**File:** `src/services/shiftSchedulingService.ts`

**Add these interfaces:**

```typescript
interface ShiftException {
  id: number;
  user_id: number;
  exception_date?: string;           // For one-off exceptions
  day_of_week?: string;              // For recurring: "monday", "tuesday", etc.
  is_recurring: boolean;
  exception_type: 'special_day' | 'makeup_day' | 'half_day' | 'overtime';
  new_start_time: string;
  new_end_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'active' | 'cancelled';
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
}

interface CreateShiftExceptionRequest {
  user_id: number;
  exception_date?: string;
  day_of_week?: string;
  is_recurring: boolean;
  exception_type: 'special_day' | 'makeup_day' | 'half_day' | 'overtime';
  new_start_time: string;
  new_end_time: string;
  reason: string;
  effective_from: string;
  effective_to?: string;
}

interface UpdateShiftExceptionRequest {
  exception_date?: string;
  day_of_week?: string;
  exception_type?: 'special_day' | 'makeup_day' | 'half_day' | 'overtime';
  new_start_time?: string;
  new_end_time?: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'active' | 'cancelled';
  effective_from?: string;
  effective_to?: string;
}
```

**Add these methods to `ShiftSchedulingService` class:**

```typescript
// Shift Exception methods
async getShiftExceptions(params?: { userId?: number; isRecurring?: boolean })
async getShiftExceptionById(id: number)
async createShiftException(data: CreateShiftExceptionRequest)
async updateShiftException(id: number, data: UpdateShiftExceptionRequest)
async deleteShiftException(id: number)
async approveShiftException(id: number)
async rejectShiftException(id: number)
```

---

### 1.3 UI Component

**File:** `src/components/ShiftSchedulingView.tsx`

**Add to existing component:**

#### State Management
```typescript
// Exceptions data state
const [exceptions, setExceptions] = useState<ShiftException[]>([]);
const [exceptionFilter, setExceptionFilter] = useState<'all' | 'recurring' | 'one-off'>('all');
const [selectedExceptionEmployee, setSelectedExceptionEmployee] = useState<number | ''>('');

// Exception form state
const [showExceptionModal, setShowExceptionModal] = useState(false);
const [editingException, setEditingException] = useState<ShiftException | null>(null);
const [exceptionForm, setExceptionForm] = useState({
  user_id: 0,
  exception_date: new Date().toISOString().split('T')[0],
  day_of_week: '',
  is_recurring: false,
  exception_type: 'special_day' as 'special_day' | 'makeup_day' | 'half_day' | 'overtime',
  new_start_time: '09:00:00',
  new_end_time: '17:00:00',
  reason: '',
  effective_from: new Date().toISOString().split('T')[0],
  effective_to: '',
});
```

#### Exceptions Tab UI

**Two sub-tabs:**
1. **Recurring Exceptions** - "Every Monday, John starts at 10am"
2. **One-Off Exceptions** - "On March 15th, Sarah finishes at 3pm"

**Recurring Exceptions Table:**
- Employee name
- Day of week (Mon, Tue, Wed, etc.)
- New start time
- New end time
- Reason
- Effective from → to
- Actions (Edit, Delete)

**One-Off Exceptions Table:**
- Employee name
- Specific date
- New start time
- New end time
- Reason
- Actions (Edit, Delete)

#### Exception Modal Fields

**For Recurring:**
- Employee selector (dropdown)
- Day of week checkboxes (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- Exception type selector
- New start time
- New end time
- Reason (textarea)
- Effective from (date picker)
- Effective to (date picker, optional)

**For One-Off:**
- Employee selector (dropdown)
- Specific date picker
- Exception type selector
- New start time
- New end time
- Reason (textarea)

#### Stats Cards
- Total exceptions
- Recurring count
- One-off count
- Employees with exceptions

---

### 1.4 Integration Testing

**Test Scenarios:**

1. **Recurring Exception Flow:**
   - Create recurring exception: "John, every Monday, 10:00-17:00"
   - Check attendance for next Monday
   - Verify: scheduled start time = 10:00 (not 09:00)
   - Verify: John not marked late if arrives at 10:10

2. **One-Off Exception Flow:**
   - Create one-off exception: "Sarah, March 15th, 09:00-15:00"
   - Check attendance for March 15th
   - Verify: scheduled end time = 15:00
   - Verify: not marked as early departure if leaves at 15:00

3. **Priority Test:**
   - Employee has permanent assignment: 09:00-17:00
   - Employee has recurring exception: every Monday 10:00-17:00
   - Employee has one-off exception: March 15th 09:00-15:00
   - Check March 15th (if it's a Monday):
     - Should use one-off exception (15:00 end)
     - NOT recurring exception
     - NOT permanent assignment

---

## Phase 2: Holiday Duty Roster (🔴 HIGH PRIORITY)

**Why Second:**
- Required for holiday attendance tracking
- Affects specific dates (not daily)
- Depends on holidays being set up first

### 2.1 Backend Verification

**Check if these endpoints exist:**

```
GET    /api/holiday-duty-roster?holidayId=X
POST   /api/holiday-duty-roster
POST   /api/holiday-duty-roster/bulk
DELETE /api/holiday-duty-roster/:id
```

**Action:** Test with Postman or check backend codebase

---

### 2.2 Service Layer

**File:** `src/services/holidayService.ts` (or create new `src/services/holidayDutyRosterService.ts`)

**Add these interfaces:**

```typescript
interface HolidayDutyRoster {
  id: number;
  holiday_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  notes?: string;
  assigned_by: number;
  assigned_at: string;
}

interface CreateDutyRosterRequest {
  holiday_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  notes?: string;
}

interface BulkDutyRosterRequest {
  holiday_id: number;
  assignments: Array<{
    user_id: number;
    start_time: string;
    end_time: string;
    break_duration_minutes: number;
    notes?: string;
  }>;
}
```

**Add these methods:**

```typescript
async getHolidayDutyRoster(holidayId: number)
async assignDutyRoster(data: CreateDutyRosterRequest)
async bulkAssignDutyRoster(data: BulkDutyRosterRequest)
async removeFromDutyRoster(id: number)
```

---

### 2.3 UI Component

**File:** `src/components/HolidayManagementView.tsx`

**Add new tab:** "Duty Roster"

#### Duty Roster Tab Structure

**Holiday Selector:**
- Dropdown to select holiday (if not already viewing specific holiday)
- Shows: Holiday name, date, branch
- "Assign Duty" button

**Assign Duty Modal:**
- Holiday (read-only if pre-selected)
- Employee multi-select (searchable)
- Start time
- End time
- Break duration (minutes)
- Notes (optional)
- "Assign" button

**Duty Roster Table:**
- Employee name
- Start time
- End time
- Break duration
- Notes
- Actions (Remove button)

#### Stats Cards
- Total holidays with duty roster
- Employees assigned to duty
- Upcoming holidays (next 30 days)

---

### 2.4 Integration Testing

**Test Scenarios:**

1. **Duty Roster Flow:**
   - Create holiday: "Christmas Day, December 25"
   - Assign 3 employees to duty roster (09:00-17:00)
   - On December 25th, check attendance for:
     - Duty employees: should be able to check in, marked as "holiday-working"
     - Non-duty employees: marked as "holiday" (not absent)

2. **Holiday + Leave Conflict:**
   - Employee on approved leave on December 25th
   - Also assigned to duty roster
   - System should prioritize: leave > holiday duty
   - Attendance marked as "leave", not "holiday-working"

---

## Phase 3: Schedule Request Approval (🟡 MEDIUM PRIORITY)

**Why Third:**
- Manager workflow (not employee-facing)
- Can be done manually in meantime
- Nice-to-have, not critical

### 3.1 What Exists

- Backend endpoints exist: `/api/shift-scheduling/schedule-requests/:id/approve`, `/reject`
- Service methods exist in `shiftSchedulingService.ts`
- No UI for managers to see pending requests

### 3.2 What to Build

**Option A:** Add tab to `ShiftSchedulingView.tsx`
- Tab: "Requests" (alongside Templates, Assignments, Exceptions)
- Table of pending requests
- Approve/Reject buttons

**Option B:** Separate component
- New file: `src/components/ScheduleRequestInbox.tsx`
- Accessible from main navigation or dashboard

---

## Design System Compliance Checklist

For every component we build, verify:

### Code Quality
- [ ] TypeScript with no `any` types
- [ ] All props typed with interfaces
- [ ] Named exports (no anonymous defaults)
- [ ] Proper import order (React → Third-party → Icons → UI → Local → Utils)
- [ ] No console.log in production code

### Visual Design
- [ ] Uses design system colors (`var(--primary-600)`, etc.)
- [ ] Proper shadow depth (`shadow-sm`, `shadow-md`, `shadow-lg`)
- [ ] Smooth animations on interactive elements (`transition-all`, `hover-lift`)
- [ ] Consistent spacing (4px grid: `gap-2`, `gap-4`, `gap-6`)
- [ ] Mobile-first responsive design (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)

### UX & States
- [ ] Loading state handled (spinner or skeleton)
- [ ] Error state handled (error banner with message)
- [ ] Empty state handled (illustration + message + CTA)
- [ ] Hover states visible on interactive elements
- [ ] Focus rings present on all interactive elements

### Accessibility
- [ ] All images have `alt` text
- [ ] Inputs have connected labels
- [ ] Icon buttons have `aria-label`
- [ ] Keyboard navigable
- [ ] Color not sole indicator of state

### Component Structure
- [ ] Component under 150 lines (or broken into sub-components)
- [ ] File in correct folder per structure guide
- [ ] Named per conventions (PascalCase components, camelCase hooks)

---

## File Structure

```
src/
├── components/
│   ├── ShiftSchedulingView.tsx      ← ADD: Exceptions tab
│   ├── HolidayManagementView.tsx    ← ADD: Duty Roster tab
│   └── ...
│
├── services/
│   ├── shiftSchedulingService.ts    ← ADD: Exception methods
│   ├── holidayService.ts            ← ADD: Duty roster methods
│   └── ...
│
└── ...
```

---

## Testing Strategy

### Unit Testing (Service Layer)
- [ ] Test each service function with mock data
- [ ] Test error handling (401, 403, 404, 500)
- [ ] Test edge cases (empty arrays, null values)

### Integration Testing (Component + Service)
- [ ] Test full CRUD flows for exceptions
- [ ] Test full CRUD flows for duty roster
- [ ] Test integration with attendance module

### E2E Testing (User Workflows)
- [ ] Create exception → check attendance
- [ ] Create duty roster → check holiday attendance
- [ ] Test conflict scenarios (exception + leave + holiday)

---

## Success Criteria

### Phase 1 (Shift Exceptions) - Done When:
- [ ] Service methods implemented and tested
- [ ] Exceptions tab fully functional
- [ ] Can create recurring exceptions
- [ ] Can create one-off exceptions
- [ ] Can edit/delete exceptions
- [ ] Exceptions properly affect attendance records
- [ ] All design system requirements met

### Phase 2 (Holiday Duty Roster) - Done When:
- [ ] Service methods implemented and tested
- [ ] Duty roster tab fully functional
- [ ] Can assign employees to holiday duty
- [ ] Can remove employees from duty
- [ ] Duty roster properly affects holiday attendance
- [ ] All design system requirements met

### Phase 3 (Schedule Request Approval) - Done When:
- [ ] Manager can view pending requests
- [ ] Manager can approve requests
- [ ] Manager can reject requests
- [ ] Approved requests create/modify assignments
- [ ] All design system requirements met

---

## Timeline Estimate

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| **Phase 1: Shift Exceptions** | 4-6 hours | Backend verification |
| **Phase 2: Holiday Duty Roster** | 4-6 hours | Backend verification |
| **Phase 3: Schedule Requests** | 2-3 hours | None |
| **Testing & Polish** | 2-3 hours | All phases complete |
| **Total** | **12-18 hours** | - |

---

## Next Steps

1. **Verify Backend Endpoints**
   - Test `/api/shift-scheduling/exceptions` endpoints
   - Test `/api/holiday-duty-roster` endpoints
   - Document any missing endpoints

2. **Start Phase 1: Shift Exceptions**
   - Add service layer methods
   - Build exceptions tab UI
   - Test integration

3. **Move to Phase 2: Holiday Duty Roster**
   - Add service layer methods
   - Build duty roster tab UI
   - Test integration

4. **Phase 3: Schedule Requests (Optional)**
   - Add approval UI
   - Test workflow

---

## Notes

### Grace Period Location ✅
- **Found in:** `SettingsView.tsx`
- **Service:** `attendanceSettingsService.ts`
- **Fields:** `grace_period_minutes` (branch + global)
- **Status:** ✅ Already implemented, no action needed

### Shift Exceptions Status ⚠️
- **Tab exists** in `ShiftSchedulingView.tsx` state
- **Form state exists** but not connected to API
- **No service methods** in `shiftSchedulingService.ts`
- **Action:** Build from scratch

### Holiday Duty Roster Status ❌
- **No UI** in `HolidayManagementView.tsx`
- **No service methods** in `holidayService.ts`
- **Action:** Build from scratch

---

**Last Updated:** March 9, 2026
**Status:** Ready to start Phase 1
**Next Action:** Verify backend endpoints for shift exceptions
