# CLAUDE HANDOFF PROMPT
*Copy everything below this line and paste it directly into Claude Code on your Mac to instantly synchronize it with today's progress.*

---

**@Claude**, I am handing off a completed data-gathering project from my PC over to you to begin Phase 2 (Development and Testing). Here is the exact status of the "Email Outreach Machine".

### Phase 1 Completion Status
1. **The Leads:** We successfully scraped, verified, and cleaned 1,992 B2B CEO leads from Apollo.io.
2. **The Database:** All 1,992 leads (First Name, Last Name, Title, Company Name, Email) have been pasted into the "Contacts" tab of the Automated Email Outreach Machine Google Sheet.
3. **The Robot Auth:** The Google Cloud Service Account (`emailbot@email-robot-491000.iam.gserviceaccount.com`) has been granted "Editor" access to the spreadsheet. 

### Critical URLs for the Setup
1. **The Target Application (Call to Action links):** `https://60-second-ai-quiz.netlify.app/`
2. **The Automated Email Outreach Spreadsheet (Data source for robot):** `https://docs.google.com/spreadsheets/d/1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE/edit?gid=0#gid=0`
3. **The Master Excel Contact List (Inbound destination for form submissions):** `https://docs.google.com/spreadsheets/d/1fWTCu8HWY0Rw_y5Nqq7QLzn27kxNCrzSIE3cJg9bTqo/edit?gid=0#gid=0`

### Your Immediate Task: "The Test Fire"
1. I have placed two test leads in **Row 2** and **Row 3** of the Outreach Spreadsheet (my personal Gmail and my Babson email address).
2. We need to write and execute the script (Node.js/Python) that pulls those two rows from Google Sheets, connects to the SendGrid API, and sends a test HTML email to both addresses. Use the keys stored in my GitHub secrets.
3. Once the test fire is successful and the emails land in my inbox, we need to adapt my Google Doc of 10 LinkedIn posts into 10 high-converting "Plain-Text Style" HTML emails. I will provide the images to host on Netlify so they display perfectly in the cold emails without hitting spam filters.

Please confirm you understand the architecture (Outbound Robot -> Email with Netlify Link -> Netlify Quiz Form -> Webhook to Master Contact List) and let's trigger the test script!
