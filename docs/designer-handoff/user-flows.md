# User Flows - Designer Handoff

This document outlines the key user flows in the ImiRezervimi.al application to help the designer understand user journeys and design requirements.

## Customer User Flows

### 1. First-Time User Registration & Booking

**Flow**: New User → Homepage → Login → Complete Registration → Browse Salons → Book Appointment

**Steps**:
1. **Homepage** (`/`)
   - User lands on homepage
   - Sees value proposition and call-to-action
   - Clicks "Login" or "Rezervo tani"

2. **Login** (`/login`)
   - User chooses Instagram or Google OAuth
   - Completes authentication
   - Redirected to complete registration if needed

3. **Complete Registration** (`/complete-registration`)
   - User provides phone number
   - Completes profile setup
   - Redirected to dashboard

4. **Customer Dashboard** (`/dashboard`)
   - User sees profile and quick actions
   - Clicks "Zbulo sallone" to browse salons

5. **Salons List** (`/salons`)
   - User browses available salons
   - Clicks on salon to book

6. **Booking Flow** (`/[slug]`)
   - **Step 1**: Select service
   - **Step 2**: Choose date and time
   - **Step 3**: Confirm booking
   - User receives confirmation

**Design Requirements**:
- Clear onboarding progression
- Prominent call-to-action buttons
- Mobile-optimized forms
- Clear success/error states

### 2. Returning User Booking

**Flow**: Returning User → Login → Dashboard → Quick Booking

**Steps**:
1. **Login** (`/login`)
   - User logs in with existing account
   - Redirected to dashboard

2. **Customer Dashboard** (`/dashboard`)
   - User sees recent bookings and quick actions
   - Can browse salons or make new booking

3. **Booking Flow** (`/[slug]`)
   - Streamlined booking process
   - Pre-filled user information
   - Quick service and time selection

**Design Requirements**:
- Quick access to common actions
- Personalized content
- Efficient booking process

### 3. Booking Management

**Flow**: User → Dashboard → View Bookings → Manage Appointments

**Steps**:
1. **Customer Dashboard** (`/dashboard`)
   - User sees recent bookings
   - Clicks "Rezervimet e mia"

2. **Booking History** (`/dashboard/bookings`)
   - User views all appointments
   - Can filter by status
   - Can view appointment details

3. **Appointment Details** (`/booking/[id]/status`)
   - User sees appointment status
   - Can contact salon if needed
   - Can make new booking

**Design Requirements**:
- Clear status indicators
- Easy filtering and search
- Prominent contact information
- Clear next steps

## Salon Owner User Flows

### 1. Salon Registration & Setup

**Flow**: Salon Owner → Registration → Verification → Dashboard Setup

**Steps**:
1. **Salon Registration** (`/salon/register`)
   - Salon owner provides business information
   - Sets up services and pricing
   - Configures working hours

2. **Email Verification** (`/salon/verify`)
   - Salon owner receives verification email
   - Clicks verification link
   - Account activated

3. **Salon Dashboard** (`/salon/dashboard`)
   - Salon owner accesses management interface
   - Views pending requests
   - Manages appointments

**Design Requirements**:
- Clear registration steps
- Business-focused design
- Easy setup process
- Clear verification flow

### 2. Appointment Management

**Flow**: Salon Owner → Dashboard → Review Requests → Approve/Decline → Manage Schedule

**Steps**:
1. **Salon Dashboard** (`/salon/dashboard`)
   - Salon owner sees pending requests
   - Reviews customer details and service requests

2. **Request Review** (Modal/Detail View)
   - Salon owner reviews appointment details
   - Checks availability
   - Makes decision

3. **Approve/Decline** (Action Buttons)
   - Salon owner approves or declines request
   - Provides notes if declining
   - Customer receives notification

4. **Calendar Management** (`/salon/dashboard?view=calendar`)
   - Salon owner views appointment calendar
   - Manages availability
   - Adjusts working hours

**Design Requirements**:
- Clear request information display
- Prominent action buttons
- Easy calendar navigation
- Clear status indicators

### 3. Settings Management

**Flow**: Salon Owner → Dashboard → Settings → Update Information

**Steps**:
1. **Salon Dashboard** (`/salon/dashboard`)
   - Salon owner clicks settings/gear icon
   - Navigates to settings

2. **Settings Page** (`/salon/settings`)
   - Salon owner updates business information
   - Modifies services and pricing
   - Adjusts working hours

3. **Save Changes** (Action)
   - Salon owner saves changes
   - Receives confirmation
   - Returns to dashboard

**Design Requirements**:
- Clear form organization
- Easy navigation between settings
- Clear save/cancel actions
- Confirmation feedback

## Admin User Flows

### 1. Admin Authentication

**Flow**: Admin → Login → Dashboard

**Steps**:
1. **Admin Login** (`/admin`)
   - Admin enters credentials
   - Authenticates with admin system

2. **Admin Dashboard** (`/admin/dashboard`)
   - Admin sees system overview
   - Manages users and salons
   - Views system statistics

**Design Requirements**:
- Secure authentication
- Clear admin interface
- System overview dashboard

## Key Design Considerations

### Mobile-First Design
- All flows must work seamlessly on mobile
- Touch-friendly interface elements
- Optimized for thumb navigation
- Clear visual hierarchy

### Progressive Disclosure
- Show information as needed
- Avoid overwhelming users
- Clear step progression
- Easy navigation between steps

### Error Handling
- Clear error messages
- Helpful recovery actions
- Graceful degradation
- User-friendly error states

### Loading States
- Clear loading indicators
- Progress feedback
- Skeleton screens where appropriate
- Timeout handling

### Success States
- Clear confirmation messages
- Next step guidance
- Celebration of achievements
- Clear call-to-action

## User Flow Pain Points

### Current Issues
1. **Booking Flow Too Complex**: 3 steps feel excessive
2. **Mobile Modal Issues**: Booking modal doesn't fit mobile viewport
3. **Date Selection Problems**: Cannot select today's date
4. **Long Scrolling**: Multiple pages require excessive scrolling
5. **Poor Information Architecture**: Hard to find important information

### Design Solutions Needed
1. **Simplify Booking Flow**: Reduce to 2 steps or improve 3-step design
2. **Mobile-First Modals**: Design modals specifically for mobile
3. **Better Date Pickers**: Intuitive date selection with today's date available
4. **Better Information Architecture**: Organize content to reduce scrolling
5. **Clear Visual Hierarchy**: Guide users through flows with design

## Accessibility Considerations

### Keyboard Navigation
- All flows must work with keyboard only
- Clear focus indicators
- Logical tab order
- Skip links where appropriate

### Screen Reader Support
- Proper heading structure
- Alt text for images
- ARIA labels for interactive elements
- Clear form labels

### Color and Contrast
- Sufficient color contrast
- Not relying on color alone
- Clear visual indicators
- Accessible color schemes

## Performance Considerations

### Loading Times
- Fast initial page load
- Progressive loading
- Optimized images
- Efficient data fetching

### Mobile Performance
- Touch response times
- Smooth scrolling
- Efficient animations
- Battery optimization
