#!/bin/bash
set -e

REPO="$HOME/email-outreach-machine"
COWORK="$HOME/cowork-email-outreach-machine"

echo "Step 1: Pulling latest from GitHub..."
cd "$REPO" && git pull origin main

echo "Step 2: Copying files..."
cp "$COWORK/test-email.js" "$REPO/test-email.js"
cp "$COWORK/test-email.yml" "$REPO/.github/workflows/test-email.yml"

echo "Step 3: Committing and pushing..."
cd "$REPO"
git add test-email.js .github/workflows/test-email.yml
git commit -m "feat: add test email script and workflow"
git push origin main

echo ""
echo "SUCCESS - Test email files pushed to GitHub!"
echo "Now triggering the workflow..."
