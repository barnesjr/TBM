Technology Business Management (TBM) Assessment Tool
=====================================================

GETTING STARTED
1. Double-click "assessment-tool" (macOS) or "assessment-tool.exe" (Windows)
2. Your browser will open automatically
3. If not, navigate to http://localhost:8751

WORKFLOW
1. Enter client information on the home page
2. Navigate through disciplines in the sidebar
3. Score each assessment item (1-4 scale)
4. Review results on the Dashboard
5. Generate deliverables from the Export page

SCORING SCALE
  1 = Ad Hoc        - No formal process
  2 = Foundational   - Basic processes in place
  3 = Managed        - Standardized and measured
  4 = Optimized      - Continuously improving

KEYBOARD SHORTCUTS
  Cmd/Ctrl+K         Command palette (quick navigation)
  Cmd/Ctrl+Right     Jump to next unscored item
  1-4                Score focused item
  H/M/L              Set confidence (High/Medium/Low)
  N                  Toggle N/A
  Arrow Up/Down      Navigate between items

SUPPLEMENTAL DISCIPLINES
The tool includes 4 optional supplemental disciplines:
  - Federal Compliance & Reporting
  - Shared Services & Consolidation
  - Cloud & Modernization Investment
  - Cybersecurity Investment Management

Enable them in Settings or via sidebar toggles.

EXPORTS
All deliverables are saved to the "exports" folder:
  - Assessment Findings (DOCX)
  - Executive Summary (DOCX)
  - Gap Analysis & Roadmap (DOCX)
  - Scored Assessment Workbook (XLSX)
  - Out-Brief Presentation (PPTX)
  - TBM Maturity Heatmap (XLSX)
  - Quick Wins Report (DOCX)
  - Cost Transparency Roadmap (DOCX)

DATA
Assessment data is saved automatically to "data.json".
A backup is maintained at "data.json.bak".

TROUBLESHOOTING
- If the tool won't start, check if port 8751-8760 is available
- If the browser doesn't open, manually visit http://localhost:8751
- To reset, delete data.json and restart
