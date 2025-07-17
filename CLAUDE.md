# Claude Context & Conventions for ImiRezervimi.al

## Project Overview
**ImiRezervimi.al** - Albanian beauty salon booking platform that connects Instagram discovery to WhatsApp confirmations.

### Core Technology Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Supabase
- **Authentication:** NextAuth.js, Instagram Basic Display API
- **Notifications:** Twilio WhatsApp Business API
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics, Vercel Speed Insights

### Key Features
- Instagram-based discovery and authentication
- WhatsApp notification system
- Albanian localization (primary language)
- Mobile-first design (Instagram in-app browser optimized)
- Real-time booking management
- Customer priority scoring system

## Development Conventions

### Branch Naming Convention
```
feature/MONDAY_[TASK_ID]-[brief-description]
```
**Examples:**
- `feature/MONDAY_2048009326-instagram-login`
- `feature/MONDAY_2048009327-twilio-setup`

### PR Title Convention
```
[MONDAY_[TASK_ID]] [Brief Description]
```
**Examples:**
- `[MONDAY_2048009326] Build Instagram login component`
- `[MONDAY_2048009327] Set up Twilio account and WhatsApp sandbox`

### Commit Message Convention
```
feat/fix/docs: [description]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## GitHub Issues Template Structure

### Required Fields
- **Title:** `MONDAY_[TASK_ID] - [Brief Description]`
- **Monday Item ID:** `MONDAY_[TASK_NUMBER]`
- **Labels:** `feature`, `priority-high/medium/low`, specific labels
- **Milestone:** `MVP Core Booking Workflow`

### Issue Template Sections
1. **🎯 Objective** - Clear description of implementation goal
2. **📋 Acceptance Criteria** - Specific deliverables checklist
3. **🔧 Technical Requirements** - Tech stack, files, dependencies
4. **📚 Implementation Details** - Detailed technical guidance
5. **🧪 Testing Requirements** - Unit, integration, localization tests
6. **📖 Documentation** - API docs, inline comments, README updates
7. **🔗 Related Requirements** - Reference to spec requirements
8. **🚀 Definition of Done** - Completion criteria including Monday.com update

## Monday.com Integration

### Task Management
- **Monday.com Board:** Main project tracking
- **GitHub Issues:** Development task tracking
- **Integration:** Monday Item IDs link GitHub issues to Monday tasks

### Current Monday.com Task Status
- **Done:** Tasks 1-7 (setup, auth, database)
- **Ready to Start:** Tasks 8-25 (core features)
- **Week 1:** Environment setup, authentication
- **Week 2:** Core booking workflow
- **Week 3:** Advanced features, testing
- **Week 4:** Production deployment, launch

### Priority Levels
- **Critical:** Core booking workflow components
- **High:** Essential features for MVP
- **Medium:** Nice-to-have features

## Technical Requirements

### Albanian Localization
- **Primary Language:** Albanian (sq)
- **Framework:** react-i18next
- **Coverage:** All user-facing text, error messages, notifications
- **Phone Format:** +355 (Albanian format)
- **Cultural Context:** Proper Albanian grammar and business etiquette

### Mobile-First Design
- **Primary Target:** Instagram in-app browser
- **Responsive:** Mobile-first approach
- **Performance:** Optimized for 3G connections
- **Touch-Friendly:** Large buttons, easy navigation

### Security & Anti-Spam
- **Phone Verification:** Required for all users
- **Rate Limiting:** 1 SMS per minute, API rate limits
- **Data Protection:** GDPR compliance, encryption
- **Spam Prevention:** Request limits, suspicious activity detection

### Real-Time Features
- **Technology:** Supabase Realtime subscriptions
- **Use Cases:** Dashboard updates, booking status, notifications
- **Fallbacks:** Graceful degradation for connection issues

## API Design Standards

### Endpoints Structure
```
/api/auth/send-verification
/api/auth/verify-phone
/api/appointments/request
/api/appointments/[id]
/api/appointments/approve
/api/appointments/decline
/api/notifications/send
/api/twilio/webhook
```

### Response Format
```json
{
  "success": boolean,
  "data": object,
  "error": {
    "code": string,
    "message": string,
    "details": object
  }
}
```

### Error Handling
- **Albanian Error Messages:** All user-facing errors
- **Proper HTTP Status Codes:** 200, 400, 401, 403, 404, 500
- **Validation:** Zod schema validation
- **Logging:** Comprehensive error logging

## Database Schema Conventions

### Core Entities
- **customers:** User profiles, priority scores
- **salons:** Salon information, settings
- **appointments:** Booking requests and confirmations
- **services:** Service offerings, pricing
- **notifications:** Message tracking

### Naming Conventions
- **Tables:** Plural, lowercase (customers, salons)
- **Columns:** Snake_case (created_at, phone_number)
- **Primary Keys:** id (UUID)
- **Foreign Keys:** [table]_id (salon_id, customer_id)

## Testing Strategy

### Required Tests
- **Unit Tests:** All business logic functions
- **Integration Tests:** API endpoints, booking workflow
- **E2E Tests:** Complete user journeys
- **Localization Tests:** Albanian text validation
- **Mobile Tests:** Responsive design, touch interactions
- **Performance Tests:** Load testing, mobile performance

### Test Commands
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:mobile   # Mobile-specific tests
npm run lint          # Code linting
npm run typecheck     # TypeScript validation
```

## Deployment Process

### Environment Setup
- **Development:** Local with Supabase local
- **Staging:** Vercel preview deployments
- **Production:** Vercel production with custom domain

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
```

### Pre-commit Hooks
- **Build:** Next.js build must pass
- **Lint:** ESLint validation
- **Type Check:** TypeScript compilation
- **Tests:** All tests must pass

## Communication & Notifications

### WhatsApp Templates (Albanian)
- **Booking Request:** "Kërkesa për rezervim është dërguar..."
- **Appointment Confirmed:** "Rezervimi juaj është konfirmuar..."
- **Appointment Declined:** "Rezervimi juaj nuk mund të aprovohet..."
- **Reminder:** "Kujtesë: Rezervimi juaj është nesër..."

### Notification Types
- **Immediate:** New booking requests
- **Scheduled:** 24-hour reminders
- **Status Updates:** Approval/decline notifications
- **Alerts:** System notifications for salons

## Performance Guidelines

### Mobile Optimization
- **Bundle Size:** Minimize for 3G connections
- **Lazy Loading:** Components and images
- **Caching:** Service worker for offline functionality
- **Images:** Optimized sizes and formats

### Database Optimization
- **Indexes:** Performance-critical queries
- **Caching:** Frequently accessed data
- **Pagination:** Large data sets
- **Real-time:** Efficient subscription queries

## Current Development Status

### Completed (Done)
1. ✅ Development environment setup
2. ✅ GitHub repository structure
3. ✅ Supabase project setup
4. ✅ Database schema design
5. ✅ Instagram Developer account
6. ✅ Basic Next.js structure
7. ✅ User authentication system

### In Progress (Ready to Start)
- GitHub Issues #13-24 created for remaining tasks
- Week 1-4 roadmap established
- Monday.com integration active

### Next Steps
1. Complete Instagram login component
2. Set up Twilio WhatsApp integration
3. Build core booking workflow
4. Implement Albanian localization
5. Deploy to production

## Claude Code Integration

### GitHub Action Setup
- **Workflow:** `.github/workflows/claude.yml`
- **Trigger:** `/claude` comment on issues
- **Purpose:** AI assistance for development tasks

### Usage
- Comment `/claude` on any GitHub issue
- Claude will provide implementation guidance
- Automatic integration with Monday.com tracking

---

*Last Updated: 2025-07-17*
*Hook Test: Updated to test conditional build*
*Project: ImiRezervimi.al*
*Team: Malion Sara, fatjona.bucpapaj@gmail.com*