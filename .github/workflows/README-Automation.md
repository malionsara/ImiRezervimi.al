# GitHub Automation for ImiRezervimi.al

## Overview

This repository includes automated workflows that integrate GitHub issues, pull requests, and Monday.com project management for seamless development workflow.

## 🔄 Automated Workflows

### 1. Auto-close Issues on PR Merge (`auto-close-issues.yml`)

**Trigger:** When a pull request is merged  
**Purpose:** Automatically closes corresponding GitHub issues

**How it works:**
1. Detects when a PR with Monday ID is merged
2. Extracts Monday ID from PR title (format: `[MONDAY_XXXXXXXXXX]`)
3. Finds open issue with matching Monday ID in title
4. Closes the issue with automated comment
5. Adds `auto-closed` and `completed` labels

**Example:**
- PR: `[MONDAY_2048009327] Set up Twilio account and WhatsApp sandbox`
- Closes issue: `MONDAY_2048009327 - Set up Twilio account and WhatsApp sandbox`

### 2. Validate PR Title (`validate-pr-title.yml`)

**Trigger:** When PR is opened, edited, or synchronized  
**Purpose:** Ensures PRs follow Monday ID naming convention

**Validation rules:**
- Title must start with `[MONDAY_XXXXXXXXXX]`
- Must have description after Monday ID
- Checks for corresponding open issue

**Valid examples:**
```
[MONDAY_2048009327] Set up Twilio account and WhatsApp sandbox
[MONDAY_2048009328] Implement customer phone verification system
[MONDAY_2048009329] Build salon availability calculation engine
```

**Invalid examples:**
```
Fix Twilio integration
MONDAY_2048009327 - Setup Twilio
[MONDAY_2048009327]
```

### 3. Monday.com Integration (`monday-integration.yml`)

**Trigger:** When issues are closed or PRs are merged  
**Purpose:** Updates Monday.com item status to "Done"

**Requirements:**
- `MONDAY_API_TOKEN` repository variable
- `MONDAY_BOARD_ID` repository variable

## 🛠️ Setup Instructions

### Basic Setup (GitHub only)

The auto-close and validation workflows work out of the box with no additional configuration needed.

### Monday.com Integration Setup

1. **Get Monday.com API Token:**
   - Go to Monday.com → Profile → Admin → API
   - Generate new API token
   - Copy the token

2. **Get Board ID:**
   - Open your Monday.com board
   - Board ID is in the URL: `https://[account].monday.com/boards/[BOARD_ID]`

3. **Configure Repository Variables:**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Click "Variables" tab
   - Add new repository variables:
     - `MONDAY_API_TOKEN`: Your Monday.com API token
     - `MONDAY_BOARD_ID`: Your Monday.com board ID

## 📋 Workflow Examples

### Complete Development Cycle

1. **Create Issue:**
   ```
   Title: MONDAY_2048009327 - Set up Twilio account and WhatsApp sandbox
   Labels: feature, priority-high, core-booking-workflow
   ```

2. **Create Branch:**
   ```bash
   git checkout -b feature/MONDAY_2048009327-twilio-whatsapp-setup
   ```

3. **Create Pull Request:**
   ```
   Title: [MONDAY_2048009327] Set up Twilio account and WhatsApp sandbox
   ```

4. **Automated Actions:**
   - ✅ PR title validation passes
   - 🔗 Links PR to corresponding issue
   - 📝 Adds automation comments

5. **Merge PR:**
   - ✅ Issue automatically closed
   - 🏷️ Labels added: `auto-closed`, `completed`
   - 📊 Monday.com status updated to "Done"

### Error Handling

**Invalid PR Title:**
```
❌ PR Title Validation - FAILED

Current title: `Fix Twilio integration`
Required format: `[MONDAY_XXXXXXXXXX] Brief description`

Examples of valid titles:
- [MONDAY_2048009327] Set up Twilio account and WhatsApp sandbox
```

**No Corresponding Issue:**
```
⚠️ No Corresponding Issue Found

No open issue found with Monday ID: MONDAY_2048009327

Please verify:
- The issue exists and is open
- The Monday ID matches exactly
```

## 🔧 Customization

### Modify Auto-close Behavior

Edit `.github/workflows/auto-close-issues.yml`:

```yaml
# Change labels added to closed issues
labels: ['auto-closed', 'completed', 'your-custom-label']

# Modify close comment template
body: |
  🎉 Your custom close message
  PR: #${prNumber}
  Monday ID: MONDAY_${mondayId}
```

### Customize Validation Rules

Edit `.github/workflows/validate-pr-title.yml`:

```yaml
# Change Monday ID pattern
const mondayIdPattern = /^\[MONDAY_\d+\]\s+.+/;

# Add additional validation rules
if (prTitle.length < 20) {
  core.setFailed('PR title too short');
}
```

### Monday.com Status Mapping

Edit `.github/workflows/monday-integration.yml`:

```yaml
# Change status column and value
column_id: "status",
value: "{\"label\":\"Completed\"}"

# Update different columns
column_id: "progress",
value: "{\"label\":\"100%\"}"
```

## 🚨 Troubleshooting

### Common Issues

1. **Auto-close not working:**
   - Check PR title format: `[MONDAY_XXXXXXXXXX] Description`
   - Verify corresponding issue exists and is open
   - Check GitHub Actions logs

2. **Monday.com integration failing:**
   - Verify `MONDAY_API_TOKEN` is valid
   - Check `MONDAY_BOARD_ID` is correct
   - Ensure Monday.com item exists with that ID

3. **PR validation failing:**
   - Update PR title to include Monday ID in brackets
   - Ensure description follows the Monday ID

### Debug Steps

1. **Check GitHub Actions:**
   - Go to repository → Actions tab
   - Click on failed workflow run
   - Review logs for error details

2. **Verify Configuration:**
   - Repository Settings → Secrets and variables → Actions
   - Ensure all required variables are set

3. **Test Monday.com API:**
   ```bash
   curl -X POST "https://api.monday.com/v2" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query": "query { me { name } }"}'
   ```

## 📊 Monitoring

### Workflow Status

Monitor automation health:
- GitHub Actions tab shows workflow runs
- Failed workflows send notifications
- Comments on PRs/issues show automation status

### Monday.com Sync

Verify Monday.com integration:
- Check item status updates in Monday.com
- Review automation comments on GitHub
- Monitor API rate limits

## 🔒 Security

### Permissions

Workflows use `GITHUB_TOKEN` with these permissions:
- Read repository content
- Write issues and comments
- Read pull requests

### Monday.com API

- API token stored as repository variable (not secret)
- Limited to board operations only
- No sensitive data exposed in logs

## 📈 Benefits

1. **Automated Issue Management:**
   - No manual issue closing needed
   - Consistent labeling and tracking
   - Clear audit trail

2. **Project Management Integration:**
   - Seamless GitHub ↔ Monday.com sync
   - Real-time status updates
   - Unified project tracking

3. **Quality Assurance:**
   - Enforced naming conventions
   - Automatic validation
   - Error prevention

4. **Developer Experience:**
   - Less manual work
   - Clear feedback
   - Consistent workflow

---

**Generated with Claude Code** 🤖  
**Co-Authored-By:** Claude <noreply@anthropic.com>