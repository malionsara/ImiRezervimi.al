# Git Workflow Rules - ImiRezervimi.al

## 🚫 **STRICT RULES - NEVER BREAK THESE**

### **Rule 1: NO Direct Pushes**
- **🚫 NEVER push directly to `main`**
- **🚫 NEVER push directly to `develop`**
- **✅ ALWAYS use feature branches and PRs**

### **Rule 2: Branch Hierarchy**
```
feature-branch → develop → main
```

### **Rule 3: PR Flow**
1. **Feature → Develop**: `feature/xyz` → `develop`
2. **Develop → Main**: `develop` → `main` (only after feature PR is merged)

---

## 📋 **Correct Workflow Steps**

### **Starting New Work**
```bash
# 1. Always start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/MONDAY_TASKID-brief-description
# or
git checkout -b fix/issue-description
```

### **Branch Naming Convention**
- `feature/MONDAY_2048009326-instagram-login`
- `fix/oauth-callback-issue` 
- `hotfix/critical-security-patch`
- `chore/update-dependencies`

### **Making Changes**
```bash
# 3. Make your changes
# 4. Commit with proper messages
git add .
git commit -m "feat: implement Instagram login

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push feature branch
git push origin feature/your-branch-name
```

### **Creating PRs**
```bash
# 6. Create PR: feature-branch → develop
gh pr create --base develop --head feature/your-branch-name --title "feat: Your Feature" --body "Description"

# 7. After review and merge, create PR: develop → main
git checkout develop
git pull origin develop
gh pr create --base main --head develop --title "Release: Merge develop to main" --body "Summary of changes"
```

---

## 🛡️ **Enforcement**

### **Automated Checks**
- **GitHub Actions** will block direct pushes to main/develop
- **Branch naming validation** for feature branches
- **PR source validation** (only develop can PR to main)

### **If You Accidentally Push Directly**
```bash
# If you pushed to main/develop by mistake:
git checkout your-branch-name
git push origin your-branch-name --force

# Then create proper PR
gh pr create --base develop --head your-branch-name
```

---

## 🎯 **Why These Rules?**

1. **🚫 Prevents Conflicts**: No more merge conflicts from simultaneous pushes
2. **✅ Code Review**: All changes reviewed before merging
3. **📋 Clean History**: Clear commit history and release tracking  
4. **🔒 Stability**: main branch always stable, develop for integration
5. **👥 Team Coordination**: Everyone follows same process

---

## 📚 **Quick Reference**

### **DO ✅**
- Create feature branches from develop
- Use descriptive branch names with prefixes
- Create PRs for all changes
- Write clear commit messages
- Test before creating PRs

### **DON'T ❌**  
- Push directly to main or develop
- Create PRs from main to develop
- Use generic branch names like "temp" or "fix"
- Skip testing before PRs
- Force push to shared branches

---

## 🚨 **Emergency Procedures**

### **Hotfix for Production**
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-name

# 2. Make fix and test
# 3. Create PR to main
gh pr create --base main --head hotfix/critical-issue-name

# 4. After merge, also merge to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

---

**Remember: When in doubt, create a branch and PR!**

*Last Updated: July 24, 2025*
*Enforcement: GitHub Actions + Manual Review*