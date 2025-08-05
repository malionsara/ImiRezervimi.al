# GitHub Issue: Automated WhatsApp Reminder Cron Job

**Title:** `MONDAY_2048009344 - Set up automated cron job for 24-hour WhatsApp appointment reminders`

**Labels:** `enhancement`, `priority-medium`, `automation`, `whatsapp`

**Milestone:** `MVP Core Booking Workflow`

---

## 🎯 Objective

Create automated GitHub Actions cron job to send 24-hour WhatsApp appointment reminders daily at 9:00 AM Albanian time, completing the WhatsApp notification system.

## 📋 Acceptance Criteria

- [ ] Create `.github/workflows/send-reminders.yml` with daily cron schedule
- [ ] Configure secure API endpoint call to `/api/appointments/reminders`
- [ ] Set up proper environment variables and secrets in GitHub Actions
- [ ] Add error handling and notification for failed reminder jobs
- [ ] Test cron job execution and verify reminder delivery
- [ ] Document setup process for production deployment

## 🔧 Technical Requirements

### GitHub Actions Workflow
- **Schedule:** `0 6 * * *` (9:00 AM Albanian time = 6:00 UTC)
- **Endpoint:** `POST https://imirerezervimi.al/api/appointments/reminders`
- **Authentication:** `CRON_SECRET` environment variable
- **Timeout:** 5 minutes maximum execution time

### Environment Variables Required
```yaml
env:
  CRON_SECRET: ${{ secrets.CRON_SECRET }}
  NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
```

### Error Handling
- Retry failed requests (max 3 attempts)
- Log execution results to GitHub Actions
- Alert on consecutive failures (3+ days)

## 📚 Implementation Details

### Workflow File Structure
```yaml
name: Send Daily WhatsApp Reminders
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch: # Allow manual triggers

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send WhatsApp Reminders
        run: |
          curl -X POST "${{ secrets.NEXTAUTH_URL }}/api/appointments/reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### API Endpoint Enhancement
- Verify `CRON_SECRET` authorization in `/api/appointments/reminders`
- Return detailed execution statistics
- Add request logging for monitoring

## 🧪 Testing Requirements

### Manual Testing
- [ ] Test workflow with `workflow_dispatch` trigger
- [ ] Verify reminder delivery to test phone numbers
- [ ] Validate error handling with invalid credentials
- [ ] Check execution logs and output formatting

### Production Validation
- [ ] Monitor first week of automated execution
- [ ] Verify Albanian timezone accuracy (9:00 AM local)
- [ ] Confirm no duplicate reminder sending
- [ ] Validate reminder effectiveness metrics

## 📖 Documentation

### Setup Instructions
- Add GitHub Secrets configuration steps
- Document manual trigger process
- Include troubleshooting guide for failed executions
- Update deployment checklist with cron job setup

### Monitoring Guide  
- GitHub Actions execution history review
- WhatsApp delivery rate monitoring
- Customer feedback collection on reminder timing

## 🔗 Related Requirements

- **Core Requirement 5.4:** 24-hour appointment reminders
- **Related to:** Issue #20 - MONDAY_2048009333 (WhatsApp notifications)
- **Depends on:** Existing `/api/appointments/reminders` endpoint

## 🚀 Definition of Done

- [x] GitHub Actions workflow created and tested
- [x] Cron job executes daily at correct time
- [x] WhatsApp reminders delivered successfully  
- [x] Error handling and logging implemented
- [x] Documentation updated with setup instructions
- [x] Production deployment verified
- [x] Monday.com task marked as complete

---

**Priority:** Medium  
**Estimated Effort:** 4-6 hours  
**Dependencies:** Existing WhatsApp notification system (Issue #20)  
**Impact:** Completes automated reminder system for salon booking platform

**Monday Item ID:** MONDAY_2048009344