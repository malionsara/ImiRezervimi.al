# 🐛 Bug Report: Salon Dashboard Cannot View Approved Appointments in Calendar

## Issue Summary
Salon owners cannot see their **approved/booked appointments** in the calendar view or anywhere else in the dashboard, despite these appointments existing in the database. The dashboard only shows **pending requests** but provides no way to view the schedule of confirmed bookings.

## Priority
🔴 **HIGH** - Blocks core salon functionality

## Reproduction Steps

### Setup
1. Log in as salon owner
2. Navigate to Salon Dashboard (`/salon/dashboard`)
3. Have at least one appointment with `status = 'approved'` in the database

### Bug #1: Calendar View Doesn't Show Booked Appointments
1. Click on "Kalendari" (Calendar) tab in dashboard
2. **Expected:** Calendar should show:
   - Green indicator for available slots
   - Red indicator for booked/occupied slots (approved appointments)
   - Ability to click on a day and see all approved appointments for that day
3. **Actual:** Calendar shows availability but does NOT display approved appointments

### Bug #2: No Way to View All Appointments by Status
1. Dashboard only shows:
   - ✅ "Kërkesat në pritje" (Pending requests)
   - ✅ "Orari i sotëm" (Today's schedule) - but only for today
   - ✅ "Aktiviteti i fundit" (Recent activity) - limited to 10 items
2. **Missing Views:**
   - ❌ All approved appointments (future bookings)
   - ❌ All declined appointments
   - ❌ All completed appointments
   - ❌ All cancelled appointments
   - ❌ No-show appointments
   - ❌ Calendar view with appointments overlaid

### Bug #3: "Today's Schedule" is Limited
1. "Orari i sotëm" section exists but:
   - Only shows today's appointments
   - Cannot see tomorrow or future dates
   - Not integrated with calendar view
   - Limited to list format, no visual timeline

## Current Behavior

### What Works ✅
- ✅ Pending requests display correctly in "Kërkesat në pritje" queue
- ✅ Approving/declining appointments via API works
- ✅ "Today's Schedule" shows approved appointments for today only
- ✅ "Recent Activity" shows last 10 appointments with any status
- ✅ Dashboard stats show correct counts

### What Doesn't Work ❌
- ❌ **Calendar view doesn't show booked appointments**
- ❌ **No view for "All Appointments"**
- ❌ **Cannot filter appointments by status** (approved, declined, completed, etc.)
- ❌ **Cannot see future bookings in calendar format**
- ❌ **Availability calendar doesn't mark booked time slots as occupied**

## Expected Behavior

### 1. Calendar View Should Show Appointments
The "Kalendari" tab should:
- Display all approved appointments on their respective dates
- Show time slots as:
  - 🟢 Green = Available
  - 🔴 Red = Booked (approved appointments)
  - 🟠 Orange = Blocked by salon
  - ⚪ Gray = Closed/holiday
- Allow clicking on a booked slot to view appointment details
- Show customer name and service on calendar

### 2. New "All Appointments" View
Add a new tab/section showing:
```
📋 Të gjitha rezervimet (All Appointments)

Filters:
[Të gjitha ▼] [Të miratuara] [Të refuzuara] [Të përfunduara] [Të anuluara] [Nuk u paraqitën]

Date Range: [Start Date] - [End Date]

Search: [🔍 Kërko sipas klientit, shërbimit...]

Sort: [Sipas datës ▼] [Sipas klientit] [Sipas shërbimit]

Results:
┌─────────────────────────────────────────────────────┐
│ ✅ E miratuar                                       │
│ Sara Kola • Manikyr • 30 min • 15€                 │
│ 📅 E hënë, 10 Nëntor 2025 • ⏰ 10:00              │
│ 📞 +355 XX XXX XXXX                                │
│ [Detaje] [Anulo] [Rishiko]                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ✅ E miratuar                                       │
│ Elona Hoxha • Ngjyrosje flokësh • 120 min • 50€   │
│ 📅 E martë, 11 Nëntor 2025 • ⏰ 14:00             │
│ 📞 +355 XX XXX XXXX                                │
│ [Detaje] [Anulo] [Rishiko]                        │
└─────────────────────────────────────────────────────┘
```

### 3. Enhanced Calendar Integration
When viewing calendar:
- Clicking on a date should show all appointments for that day
- Visual timeline view with time slots (09:00, 10:00, 11:00, etc.)
- Color-coded by appointment status
- Drag-and-drop rescheduling (future enhancement)

## Technical Investigation

### Files Involved

#### 1. `/frontend/pages/salon/dashboard.tsx`
**Lines 743-853:** Main dashboard view with three tabs:
- `'requests'` - Pending requests (✅ works)
- `'availability'` - Calendar view (❌ doesn't show appointments)
- `'working-hours'` - Working hours config (✅ works)

**Issue:** The calendar view (`currentView === 'availability'`) only shows availability management, not actual bookings.

```typescript
// Line 856-864: Calendar view
{currentView === 'availability' && salonId && (
  <div className="space-y-6">
    <AvailabilityCalendar
      salonId={salonId}
      allowMultiSelect={true}
      onSelectionChange={() => handleAvailabilityChange()}
      className="w-full"
    />
  </div>
)}
```

#### 2. `/frontend/components/salon/AvailabilityCalendar.tsx`
**Lines 85-91:** Calendar day status calculation:
```typescript
const getDayStatus = (day: CalendarDay) => {
  if (!day.isWorkingDay) return 'closed'
  if (day.date < today) return 'past'
  if (day.availableSlots === 0 && day.totalSlots > 0) return 'full'
  if (day.blockedSlots === day.totalSlots) return 'blocked'
  return 'available'
}
```

**Issue:** This checks `availableSlots`, `totalSlots`, and `blockedSlots` but doesn't show which specific time slots have approved appointments.

**Lines 179-183:** Shows booked slot count:
```typescript
{day.bookedSlots > 0 && (
  <div className="flex items-center">
    <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
    <span>{day.bookedSlots} të zëna</span>
  </div>
)}
```

**Issue:** Shows count but not the actual appointments or time slots.

#### 3. `/frontend/lib/salon-dashboard.ts`
**Lines 225-280:** Three data-fetching functions:

1. **`getPendingRequests()`** (Line 155-223)
   - ✅ Fetches `status = 'pending'`
   - ✅ Works correctly

2. **`getTodaySchedule()`** (Line 228-280)
   - ✅ Fetches `status = 'approved'` for today only
   - ⚠️ Limited to today's date

3. **`getRecentActivity()`** (Line 285-336)
   - ✅ Fetches all statuses: `approved, declined, completed, cancelled, no_show`
   - ⚠️ Limited to last 10 items
   - ⚠️ Not filterable

**Missing Function:**
```typescript
// NEEDED: Function to fetch all appointments with filtering
export async function getAllAppointments(
  salonId: string,
  filters?: {
    status?: appointment_status[]
    startDate?: string
    endDate?: string
    searchQuery?: string
  }
): Promise<Appointment[]>
```

#### 4. `/frontend/lib/availability.ts`
**Missing Integration:** The availability calculation should check for conflicts with approved appointments but needs to return appointment details, not just counts.

### Database Query Analysis

From `/database/schema.sql` (Line 14):
```sql
CREATE TYPE appointment_status AS ENUM (
  'pending',    -- Waiting for salon approval
  'approved',   -- Confirmed by salon ← THESE ARE NOT VISIBLE
  'declined',   -- Rejected by salon
  'completed',  -- Service finished
  'no_show',    -- Customer didn't show up
  'cancelled'   -- Cancelled by customer or salon
);
```

**Current Queries:**
```sql
-- ✅ Pending requests (works)
SELECT * FROM appointments
WHERE salon_id = ? AND status = 'pending'
ORDER BY priority_score DESC

-- ✅ Today's schedule (works but limited)
SELECT * FROM appointments
WHERE salon_id = ?
  AND appointment_date = CURRENT_DATE
  AND status = 'approved'
ORDER BY start_time ASC

-- ❌ Missing: All approved appointments
SELECT * FROM appointments
WHERE salon_id = ?
  AND status = 'approved'
  AND appointment_date >= CURRENT_DATE
ORDER BY appointment_date ASC, start_time ASC
```

## Proposed Solution

### Phase 1: Quick Fix (High Priority)
1. **Add "All Appointments" tab to dashboard**
   - New tab: "Rezervimet" (Appointments)
   - Shows all appointments with status filters
   - Filterable by date range
   - Searchable by customer name, phone, service

2. **Enhance calendar to show booked slots**
   - Query approved appointments for displayed month
   - Display appointment details on calendar day cells
   - Click on date to see all appointments for that day

### Phase 2: Enhanced Features (Medium Priority)
3. **Appointment Management Actions**
   - View appointment details
   - Reschedule appointment
   - Cancel appointment
   - Mark as completed/no-show
   - Add notes

4. **Timeline View**
   - Visual timeline for selected day
   - Time slots from opening to closing
   - Color-coded by status
   - Gaps showing available times

### Phase 3: Advanced Features (Low Priority)
5. **Week View**
   - 7-day calendar with all appointments
   - Drag-and-drop rescheduling
   - Multi-staff support (future)

6. **Filters & Reporting**
   - Export appointments to CSV
   - Revenue by date range
   - Most popular services
   - Customer analytics

## Implementation Plan

### Step 1: Create `getAllAppointments()` Function
**File:** `/frontend/lib/salon-dashboard.ts`

```typescript
export interface AppointmentFilters {
  status?: ('pending' | 'approved' | 'declined' | 'completed' | 'cancelled' | 'no_show')[]
  startDate?: string
  endDate?: string
  searchQuery?: string
  sortBy?: 'date' | 'customer' | 'service' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export async function getAllAppointments(
  salonId: string,
  filters?: AppointmentFilters
): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      duration_minutes,
      status,
      salon_notes,
      customer_notes,
      service_name,
      service_price,
      created_at,
      updated_at,
      customers!inner (
        id,
        first_name,
        last_name,
        phone,
        rating
      )
    `)
    .eq('salon_id', salonId)

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (filters?.startDate) {
    query = query.gte('appointment_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('appointment_date', filters.endDate)
  }

  // Search
  if (filters?.searchQuery) {
    // Need to implement full-text search
  }

  // Sort
  const sortBy = filters?.sortBy || 'date'
  const sortOrder = filters?.sortOrder || 'asc'

  if (sortBy === 'date') {
    query = query.order('appointment_date', { ascending: sortOrder === 'asc' })
                 .order('start_time', { ascending: sortOrder === 'asc' })
  }

  const { data, error } = await query

  // Transform and return
  return data || []
}
```

### Step 2: Create `AllAppointments` Component
**File:** `/frontend/components/salon/AllAppointments.tsx`

```typescript
interface AllAppointmentsProps {
  salonId: string
}

export default function AllAppointments({ salonId }: AllAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: ['approved'], // Default to approved
    startDate: new Date().toISOString().split('T')[0],
    endDate: null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch appointments
  useEffect(() => {
    loadAppointments()
  }, [salonId, filters])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const data = await getAllAppointments(salonId, {
        ...filters,
        searchQuery
      })
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status filter buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({...filters, status: ['approved']})}
              className={`pill ${filters.status?.includes('approved') ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              ✅ Të miratuara
            </button>
            <button
              onClick={() => setFilters({...filters, status: ['declined']})}
              className={`pill ${filters.status?.includes('declined') ? 'bg-red-100' : 'bg-gray-100'}`}
            >
              ❌ Të refuzuara
            </button>
            <button
              onClick={() => setFilters({...filters, status: ['completed']})}
              className={`pill ${filters.status?.includes('completed') ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              ✔️ Të përfunduara
            </button>
            <button
              onClick={() => setFilters({...filters, status: ['cancelled']})}
              className={`pill ${filters.status?.includes('cancelled') ? 'bg-orange-100' : 'bg-gray-100'}`}
            >
              🚫 Të anuluara
            </button>
            <button
              onClick={() => setFilters({...filters, status: ['no_show']})}
              className={`pill ${filters.status?.includes('no_show') ? 'bg-purple-100' : 'bg-gray-100'}`}
            >
              👻 Nuk u paraqitën
            </button>
          </div>

          {/* Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="self-center">-</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Kërko klient, shërbim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm flex-1"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Duke ngarkuar...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Asnjë rezervim i gjetur
            </h3>
            <p className="text-gray-600">
              Nuk ka rezervime me kriteret e zgjedhura
            </p>
          </div>
        ) : (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onUpdate={loadAppointments}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

### Step 3: Update Dashboard to Include New Tab
**File:** `/frontend/pages/salon/dashboard.tsx`

Add new view option:
```typescript
const [currentView, setCurrentView] = useState<
  'requests' | 'appointments' | 'availability' | 'working-hours'
>('requests')
```

Add new tab button (line ~486):
```typescript
<button
  onClick={() => setCurrentView('appointments')}
  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
    currentView === 'appointments'
      ? 'bg-white text-gray-900 shadow-sm'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  Rezervimet
</button>
```

Add new view section (after line 853):
```typescript
{/* All Appointments View */}
{currentView === 'appointments' && salonId && (
  <AllAppointments salonId={salonId} />
)}
```

### Step 4: Enhance Calendar with Appointments
**File:** `/frontend/lib/availability.ts`

Update `calculateAvailability()` to return appointment details:
```typescript
export interface AvailabilityResult {
  date: string
  timeSlots: TimeSlot[]
  appointments: Appointment[]  // ← Add this
  workingHours: { open: string; close: string }
  holidays: Holiday[]
}
```

Update calendar component to display appointments on day cells.

## Testing Checklist

### Manual Testing
- [ ] Log in as salon owner
- [ ] Approve a pending request
- [ ] Navigate to new "Rezervimet" tab
- [ ] Verify approved appointment appears in list
- [ ] Test status filters (approved, declined, etc.)
- [ ] Test date range filtering
- [ ] Test search functionality
- [ ] Navigate to "Kalendari" tab
- [ ] Verify calendar shows red indicators on booked dates
- [ ] Click on a booked date
- [ ] Verify appointment details appear
- [ ] Test mobile responsive design

### Edge Cases
- [ ] Salon with no appointments
- [ ] Multiple appointments same day
- [ ] Appointments in different statuses
- [ ] Long customer names/notes
- [ ] Date range spanning multiple months

## Related Issues
- Relates to #47 (Booking conflict detection) - Need to show existing bookings to detect conflicts
- Relates to #46 (Salon availability management) - Calendar should show both availability and bookings
- Relates to #19 (Salon dashboard) - Core dashboard functionality

## Labels
`bug`, `high-priority`, `salon-dashboard`, `calendar`, `appointments`, `user-experience`

## Assignee
@malionsara (Backend)

## Estimated Effort
- **Phase 1 (Quick Fix):** 2-3 days
- **Phase 2 (Enhanced Features):** 3-4 days
- **Phase 3 (Advanced Features):** 5-7 days

**Total:** 1-2 weeks for complete solution

## Success Criteria
✅ Salon owners can view all approved appointments in a list
✅ Appointments are filterable by status (approved, declined, completed, etc.)
✅ Calendar view shows booked time slots visually
✅ Clicking on a calendar date shows all appointments for that day
✅ Search and date range filters work correctly
✅ Mobile responsive design maintained

---

**Created:** November 5, 2025
**Reporter:** Claude Code Assistant
**Version:** MVP (Week 4)
