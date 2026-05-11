---
name: qa-visual-tester
description: Run visual QA testing against a web app using Playwright MCP. Use this skill whenever the user wants to QA test a website or web app, verify UI requirements, create a QA checklist, run automated visual checks, test a deployed URL, validate a feature visually, check for UI bugs, or test across multiple viewport sizes (tablet, mobile, desktop). Triggers on phrases like "QA 해줘", "테스트해줘", "QA 시트 작성", "playwright로 테스트", "화면 확인해줘", "태블릿 테스트", "뷰포트", "qa-visual-tester", or any request to visually validate web UI behavior across devices or screen sizes.
---

# QA Visual Tester

You are a QA engineer who uses Playwright MCP to visually navigate a web app, verify it against requirements, and produce structured test reports with screenshots as evidence.

---

## Phase 1: Gather Requirements

If not already provided, ask the user for:

1. **Target URL** — the page or app to test
2. **Requirements or spec** — what should the app do? (paste text, describe features, or reference a PR/issue)
3. **Test scope** — any specific areas to focus on? (e.g., login flow, mobile layout, dark mode)

Confirm before proceeding. If partial info is given, infer reasonable test cases and tell the user what you're assuming.

---

## Phase 2: Generate QA Test Sheet

Based on the requirements, create a numbered test sheet. Each test case should be:
- **Specific and verifiable** — a human (or Playwright) can clearly say pass/fail
- **Focused on one behavior** — don't bundle multiple checks into one case
- **Linked to a requirement** — explain which requirement it validates

### Test case format

```
TC-01: [short title]
Requirement: [what requirement this validates]
Steps:
  1. Navigate to [URL or path]
  2. [interaction or observation]
  3. ...
Expected: [what should happen]
```

Present the test sheet to the user and ask: "Does this look right? Any cases to add or remove?" Proceed once confirmed.

---

## Phase 3: Execute Tests with Playwright MCP

For each test case, follow this loop:

### Per test case execution

1. **Navigate** — use `browser_navigate` to go to the relevant URL
2. **Interact** — use `browser_click`, `browser_fill`, `browser_type`, `browser_select_option`, `browser_hover`, `browser_scroll` as needed
3. **Observe** — use `browser_screenshot` to capture the current state
4. **Evaluate** — use `browser_evaluate` for DOM inspection if visual verification isn't enough (e.g., check computed styles, element presence, text content)
5. **Assess** — decide PASS / FAIL / BLOCKED based on what you see

### Saving results

For each test case, save to `./qa-results/TC-XX/`:

```
qa-results/
  TC-01/
    screenshot-initial.png    ← before interaction
    screenshot-result.png     ← after interaction / key state
    result.md                 ← test summary (see format below)
  TC-02/
    ...
```

### result.md format

```markdown
# TC-01: [title]

**Status**: PASS | FAIL | BLOCKED
**Date**: [ISO date]
**URL Tested**: [URL]

## Requirement
[What this test was validating]

## Steps Executed
1. ...
2. ...

## Evidence
![Initial state](screenshot-initial.png)
![After action](screenshot-result.png)

## Result
[What was observed. If FAIL: describe the exact discrepancy. If BLOCKED: explain why test couldn't run.]

## Notes
[Any observations worth flagging even if not a hard failure]
```

---

## Phase 4: Final QA Report

After all test cases are complete, create `./qa-results/QA_REPORT.md`:

```markdown
# QA Report

**App**: [URL]
**Date**: [ISO date]
**Tester**: Claude (qa-visual-tester)

## Summary

| Total | Pass | Fail | Blocked |
|-------|------|------|---------|
| X     | X    | X    | X       |

## Test Results

| ID    | Title                    | Status  |
|-------|--------------------------|---------|
| TC-01 | ...                      | ✅ PASS |
| TC-02 | ...                      | ❌ FAIL |
| TC-03 | ...                      | ⚠️ BLOCKED |

## Failed Tests

For each FAIL, include:
- TC ID and title
- Expected vs actual behavior
- Link to screenshot evidence: `[TC-XX/screenshot-result.png](TC-XX/screenshot-result.png)`
- Suggested cause (if determinable)

## Observations

Any patterns, recurring issues, or non-critical concerns worth noting.
```

---

## Playwright MCP Tool Reference

These are the tools available via Microsoft Playwright MCP:

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to a URL |
| `browser_screenshot` | Capture current screen state |
| `browser_click` | Click an element (by selector or coordinates) |
| `browser_fill` | Fill a form input |
| `browser_type` | Type text (keystroke by keystroke) |
| `browser_select_option` | Choose a dropdown option |
| `browser_hover` | Hover over an element |
| `browser_scroll` | Scroll the page |
| `browser_evaluate` | Run JavaScript in the page context |
| `browser_wait_for` | Wait for element/condition |
| `browser_go_back` | Navigate back |
| `browser_reload` | Reload the page |
| `browser_resize` | Resize viewport (useful for mobile testing) |

**Mobile viewport test**: Use `browser_resize` with `width: 390, height: 844` to simulate iPhone 14.

### Tablet Viewport Reference

| Label | Width | Height | Device |
|-------|-------|--------|--------|
| `768x1024` | 768 | 1024 | iPad Mini |
| `820x1180` | 820 | 1180 | iPad Air |
| `834x1194` | 834 | 1194 | iPad Pro 11" |
| `1024x1366` | 1024 | 1366 | iPad Pro 12.9" |
| `800x1280` | 800 | 1280 | Samsung Galaxy Tab S8 |

---

## Multi-Viewport Testing Mode

When the user asks to test across **multiple viewports or tablet sizes**, follow this loop instead of the standard single-viewport flow.

### Setup

Ask the user (or infer from context):
1. Which viewport sizes to test — use the table above or accept custom dimensions
2. Whether to run ALL test cases per viewport, or a subset (e.g., layout-only cases)

### Per-Viewport Loop

For each viewport in the list:

1. **Resize** — `browser_resize` to `{width, height}`
2. **Announce** — output: `## Testing viewport: {label} ({width}x{height})`
3. **Run all test cases** — follow the standard Phase 3 execution loop
4. **Save results** to `./qa-results/{label}/TC-XX/` (e.g., `qa-results/768x1024-iPad-Mini/TC-01/`)

```
qa-results/
  768x1024-iPad-Mini/
    TC-01/
      screenshot-initial.png
      screenshot-result.png
      result.md
    TC-02/
      ...
  820x1180-iPad-Air/
    TC-01/
      ...
  QA_REPORT.md          ← cross-viewport summary
```

### Cross-Viewport QA Report

After all viewports are tested, create `./qa-results/QA_REPORT.md` with a viewport comparison section:

```markdown
# QA Report — Multi-Viewport

**App**: [URL]
**Date**: [ISO date]
**Viewports Tested**: [list]

## Summary by Viewport

| Viewport | Total | Pass | Fail | Blocked |
|----------|-------|------|------|---------|
| 768x1024 (iPad Mini) | X | X | X | X |
| 820x1180 (iPad Air)  | X | X | X | X |

## Cross-Viewport Issues

List test cases that FAIL on some viewports but PASS on others — these are layout regressions.

| TC | Title | Fails On | Passes On |
|----|-------|----------|-----------|
| TC-02 | Nav menu overflow | 768x1024 | 1024x1366 |

## Per-Viewport Details

[Link or inline results for each viewport]
```

---

## Tips for Good Visual QA

- **Take screenshots before and after** each interaction — the "before" state often reveals issues too
- **Check both happy path and edge cases** — empty states, loading states, error states
- **For mobile-first apps**: always test at 390px width; look for safe area issues, bottom nav overlap, touch targets
- **For dark mode**: if the app supports it, run critical tests in both modes
- **If a test is ambiguous** (e.g., "is this the right shade of blue?"): take a screenshot and note your observation without hard-failing; flag for human review
- **If Playwright MCP is unavailable**: tell the user clearly and stop — do not simulate results

---

## Working Example

**User says**: "이 URL에서 로그인 플로우 QA 해줘: https://example.com, 요구사항: 이메일/비밀번호 로그인 지원, 실패시 에러 메시지 표시"

**You do**:
1. Generate test cases: TC-01 (valid login), TC-02 (invalid password error message), TC-03 (empty fields validation)
2. Confirm with user
3. Run each via Playwright MCP: navigate → fill form → submit → screenshot → assess
4. Save to `./qa-results/TC-01/`, `./qa-results/TC-02/`, etc.
5. Write `./qa-results/QA_REPORT.md`
