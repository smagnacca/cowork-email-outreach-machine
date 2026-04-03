# Email Outreach Machine — Project Rules

## Project Identity
- **Project:** Email Outreach Machine
- **Local Mac Path:** `~/cowork-email-outreach-machine`
- **GitHub Repo:** `https://github.com/smagnacca/email-outreach-machine`
- **Netlify Quiz:** https://60-second-ai-quiz.netlify.app/
- **Live Site:** https://scottmagnacca.com

---

## ⚠️ SCOPE LOCK — CRITICAL
This Cowork session is **strictly locked** to this project only.

- ONLY work on assets, config, and tasks related to this project
- ONLY push code to the GitHub repo `smagnacca/email-outreach-machine`
- NEVER touch any other cowork-* folder or repository
- If a request seems to involve another project, stop and confirm with Scott before proceeding

---

## What Cowork Handles (do these directly)
Cowork handles tasks directly using local tools first — file editing, git commands, API calls, MCP tools — without opening Chrome tabs or controlling the screen unless absolutely necessary. This includes: research, copywriting, strategy, Netlify config, DNS, SendGrid, Google Sheets, pushing to GitHub, updating the changelog, file management, and anything that doesn't require modifying website source code. Only use Chrome tabs or screen control when a task genuinely cannot be done any other way.

---

## What Claude Code Handles (code changes only)
When Scott requests changes to website source code, HTML, CSS, JavaScript, or any code file:

1. **Identify** what needs to change and confirm it belongs to THIS project
2. **Craft** a clear, specific Claude Code prompt describing the full task
3. **Write** the complete command to Scott's clipboard:
   ```
   cd ~/cowork-email-outreach-machine && claude --dangerously-skip-permissions "[detailed prompt here]"
   ```
4. **Tell Scott:** "Ready — paste into your Terminal and hit Enter"
5. **Claude Code handles** the rest: edits files, commits, and pushes to GitHub

**Why:** Claude Code is significantly better at code editing and git operations than Cowork. This division of labor gets better results faster.

---

## Branch Rules — CRITICAL
Always work on the main branch only. Never create other branches. Claude Code must always commit and push to main. If any other branch exists in the repo, flag it to Scott immediately. The changelog serves as the project history — branches are never needed.

---

## Advisory Board (activate on major design/UX decisions)
Simulate this advisory board and draw from their expertise before making recommendations:
1. Highly experienced website designer
2. UX design expert
3. Expert direct response marketer
4. Dr. Robert Cialdini — psychology of persuasion

---

## Session Start
- Load GitHub and Netlify tokens if changes may be needed
- Remind Scott to push changes if they haven't been pushed

## Session End Checklist
- Update `02_Changelog_Summary.md` with a summary of changes made
- Confirm all GitHub pushes completed successfully
- Save any important session notes to the project folder
