# GitHub Issues Creation Prompt for ImiRezervimi.al

## Context
You are helping create GitHub issues for the ImiRezervimi.al project - an Albanian beauty salon booking platform that connects Instagram discovery to WhatsApp confirmations. The project uses Next.js, Supabase, and Twilio for a complete booking workflow.

## Task
Create detailed GitHub issues from the implementation tasks below. Each issue should be actionable by AI coding agents and include Monday.com integration for project management automation.

## Issue Template Structure
For each task, create a GitHub issue with this format:

```markdown
**Title:** [Task ID] - [Brief Description]

**Monday Item ID:** MONDAY_[TASK_NUMBER]

**Labels:** 
- `feature`
- `core-booking-workflow` 
- `priority-high` (for tasks 1-10)
- `priority-medium` (for tasks 11-20)

**Milestone:** MVP Core Booking Workflow

**Description:**

## 🎯 Objective
[Clear description of what needs to be implemented]

## 📋 Acceptance Criteria
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Specific deliverable 3]
- [ ] [Testing requirements]
- [ ] [Documentation requirements]

## 🔧 Technical Requirements
- **Technology Stack:** [Relevant tech for this task]
- **Files to Create/Modify:** [Specific file paths]
- **Dependencies:** [Other tasks that must be completed first]

## 📚 Implementation Details
[Detailed technical guidance including:]
- Code structure and patterns to follow
- Albanian localization requirements (where applicable)
- Database schema considerations
- API endpoint specifications
- Error handling requirements

## 🧪 Testing Requirements
- [ ] Unit tests for core functionality
- [ ] Integration tests for API endpoints
- [ ] Albanian text validation (where applicable)
- [ ] Mobile responsiveness testing (for UI tasks)

## 📖 Documentation
- [ ] Update API documentation
- [ ] Add inline code comments
- [ ] Update README if needed

## 🔗 Related Requirements
[Reference to specific requirements from the spec: e.g., Requirements 1.1, 2.3, 3.4]

## 🚀 Definition of Done
- [ ] Code implemented and tested
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging environment
- [ ] Monday.com item status updated to "Done"

**Branch Naming Convention:** `feature/MONDAY_[TASK_NUMBER]-[brief-description]`
**PR Title Convention:** `[MONDAY_[TASK_NUMBER]] [Brief Description]`
```

## Implementation Tasks to Convert

### Task 1: Set up core data models and database schema
**Monday Item ID:** MONDAY_001
- Create TypeScript interfaces for Customer, Salon, Appointment, Service entities
- Implement Supabase database migrations for all core tables
- Set up Row Level Security policies for data protection
- Create database indexes for performance optimization
- Requirements: 1.1, 2.1, 3.1, 4.1, 7.5

### Task 2: Implement customer phone verification system
**Monday Item ID:** MONDAY_002
- Create SMS verification API endpoint using Twilio
- Build verification code generation and validation logic
- Implement rate limiting for SMS requests (1 per minute)
- Create verification UI components with Albanian messages
- Add phone number validation for Albanian format (+355)
- Requirements: 1.3, 1.4, 7.1, 7.2

### Task 3: Build salon availability calculation engine
**Monday Item ID:** MONDAY_003
- Implement working hours configuration system
- Create time slot generation algorithm
- Build conflict detection for double-booking prevention
- Add blocked time slot management functionality
- Create availability caching for performance
- Requirements: 4.1, 4.2, 4.3, 4.4, 4.5

### Task 4: Create customer priority scoring system
**Monday Item ID:** MONDAY_004
- Implement priority calculation algorithm with weighted factors
- Build customer rating and history tracking
- Add no-show and cancellation penalty logic
- Create priority score display in salon dashboard
- Implement automatic priority updates after appointments
- Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

### Task 5: Build mobile booking interface
**Monday Item ID:** MONDAY_005
- Create responsive salon profile page with service listings
- Implement service selection UI with pricing display
- Build mobile-optimized time slot picker calendar
- Create customer information form with Albanian validation
- Add booking confirmation page with Albanian success messages
- Implement loading states and error handling
- Requirements: 1.1, 1.2, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6

### Task 6: Implement appointment request processing
**Monday Item ID:** MONDAY_006
- Create appointment request submission API
- Build request validation and anti-spam checks
- Implement pending request limits (max 2 per customer)
- Add booking window validation (max 10 days advance)
- Create request status tracking and updates
- Requirements: 1.1, 1.2, 1.6, 1.7, 7.2, 7.3

### Task 7: Build salon dashboard for request management
**Monday Item ID:** MONDAY_007
- Create dashboard layout with pending requests queue
- Implement priority-sorted request display
- Build customer details panel with history and ratings
- Add approve/decline action buttons
- Create real-time updates using Supabase subscriptions
- Implement today's appointments overview
- Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

### Task 8: Implement WhatsApp notification system
**Monday Item ID:** MONDAY_008
- Set up Twilio WhatsApp Business API integration
- Create Albanian message templates for all notification types
- Build notification sending service with retry logic
- Implement immediate notifications for new requests
- Add 24-hour appointment reminder system
- Create notification delivery tracking and logging
- Requirements: 2.1, 2.4, 2.5, 2.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7

### Task 9: Create appointment approval/decline workflow
**Monday Item ID:** MONDAY_009
- Build approval API endpoint with time slot blocking
- Implement decline functionality with reason options
- Add automatic WhatsApp confirmations for customers
- Create conflict detection for simultaneous approvals
- Implement 2-hour response reminder system
- Add appointment status tracking and history
- Requirements: 2.4, 2.5, 2.6, 2.7, 4.6, 4.7

### Task 10: Implement anti-spam and security measures
**Monday Item ID:** MONDAY_010
- Add rate limiting middleware for all booking endpoints
- Create suspicious activity detection algorithms
- Implement IP blocking for repeated violations
- Add customer account flagging for high-risk users
- Create data encryption for sensitive customer information
- Implement GDPR-compliant data deletion
- Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

### Task 11: Build time slot management system
**Monday Item ID:** MONDAY_011
- Create salon working hours configuration interface
- Implement time slot blocking/unblocking functionality
- Add holiday and break period management
- Create calendar view for salon availability
- Implement automatic slot release on cancellation
- Add bulk time slot operations
- Requirements: 4.1, 4.2, 4.3, 4.5, 4.6

### Task 12: Create customer rating and feedback system
**Monday Item ID:** MONDAY_012
- Build post-appointment rating interface for salons
- Implement customer rating storage and calculation
- Add feedback collection for service quality
- Create rating display in customer profiles
- Implement rating-based priority adjustments
- Add rating analytics for salon insights
- Requirements: 3.3, 3.4, 3.5

### Task 13: Implement real-time dashboard updates
**Monday Item ID:** MONDAY_013
- Set up Supabase real-time subscriptions for salon dashboard
- Create live request queue updates
- Implement real-time appointment status changes
- Add live notification indicators
- Create connection status monitoring
- Implement graceful fallback for connection issues
- Requirements: 2.1, 2.2

### Task 14: Build comprehensive error handling
**Monday Item ID:** MONDAY_014
- Create Albanian error message system
- Implement client-side form validation with helpful messages
- Add server-side error handling with proper HTTP status codes
- Create error logging and monitoring
- Implement graceful degradation for network issues
- Add retry mechanisms for failed operations
- Requirements: 6.5, 7.7

### Task 15: Create mobile performance optimizations
**Monday Item ID:** MONDAY_015
- Implement lazy loading for booking interface components
- Add image optimization for salon photos
- Create service worker for offline functionality
- Implement request caching for better performance
- Add loading indicators and skeleton screens
- Optimize bundle size for 3G connections
- Requirements: 6.1, 6.6

### Task 16: Implement Instagram bio link integration
**Monday Item ID:** MONDAY_016
- Create unique salon booking URLs with slug system
- Build salon profile detection from bio links
- Add Instagram branding and styling consistency
- Create mobile browser compatibility testing
- Implement deep linking for specific services
- Add analytics tracking for bio link conversions
- Requirements: 1.1, 6.1

### Task 17: Build appointment reminder system
**Monday Item ID:** MONDAY_017
- Create 24-hour reminder job scheduler
- Implement reminder message customization
- Add reminder delivery tracking
- Create reminder preferences for customers
- Implement multiple reminder channels (WhatsApp + SMS)
- Add reminder analytics and effectiveness tracking
- Requirements: 5.4

### Task 18: Create comprehensive testing suite
**Monday Item ID:** MONDAY_018
- Write unit tests for all business logic functions
- Create integration tests for booking workflow
- Implement end-to-end tests for complete user journeys
- Add performance tests for high-load scenarios
- Create WhatsApp integration testing with test numbers
- Implement security testing for authentication flows
- Requirements: All requirements validation

### Task 19: Implement salon onboarding workflow
**Monday Item ID:** MONDAY_019
- Create salon registration and profile setup
- Build service configuration interface
- Implement working hours setup wizard
- Add WhatsApp number verification for salons
- Create Instagram account linking
- Build onboarding progress tracking
- Requirements: 2.1, 4.1, 5.1

### Task 20: Build analytics and reporting system
**Monday Item ID:** MONDAY_020
- Create booking conversion tracking
- Implement salon performance metrics
- Add customer behavior analytics
- Create revenue tracking and reporting
- Build appointment success rate monitoring
- Implement system health monitoring and alerts
- Requirements: 3.6, 2.7

## Project Context
- **Repository:** ImiRezervimi.al
- **Tech Stack:** Next.js 15, TypeScript, Supabase, Tailwind CSS, Twilio
- **Target:** Albanian beauty salon booking platform
- **MVP Timeline:** 4 weeks
- **Key Features:** Instagram integration, WhatsApp notifications, Albanian localization

## Special Considerations
1. **Albanian Localization:** All user-facing text must be in Albanian
2. **Mobile-First:** Optimized for Instagram in-app browser
3. **WhatsApp Integration:** All notifications via WhatsApp Business API
4. **Anti-Spam:** Phone verification and rate limiting required
5. **Real-time Updates:** Use Supabase subscriptions for live data

## Monday.com Integration Notes
- Each issue includes Monday Item ID for automation
- Branch names include Monday ID for tracking
- PR titles include Monday ID for automatic status updates
- Use Monday webhooks to sync issue status with project board

Please create all 20 GitHub issues following this template and structure.