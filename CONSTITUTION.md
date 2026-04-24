# Project Constitution

## Code Quality Principles

### Simplicity First
- Write the minimal code needed to solve the problem — fewer lines
  mean fewer places for bugs to hide
- Avoid premature abstractions — three similar lines beats a premature
  helper that obscures control flow
- No speculative features or "future-proofing"; unused code paths are
  untested code paths
- Delete unused code completely rather than commenting it out
- Every function MUST have a single, clear responsibility

### Clarity Over Cleverness
- Use descriptive names that make the code self-documenting
- Default to no comments — only explain non-obvious WHY, never WHAT
- Avoid magic numbers and unexplained constants; extract them into
  named constants
- Make implicit behavior explicit at system boundaries
- Prefer explicit control flow over clever one-liners — readability
  prevents bugs

### Security by Default
- Validate all external input (user input, API responses, file uploads)
- Trust internal code and framework guarantees
- Never introduce OWASP top 10 vulnerabilities (XSS, SQL injection, command injection)
- Use parameterized queries, escape user content, validate file paths
- Treat every external boundary as hostile

## Zero-Bug Tolerance

### Bug Priority
- Bugs are the highest-priority work item — fix before new features
- When a bug is found, trace the root cause; do NOT apply surface-level
  patches that mask the real problem
- Every code change MUST be reviewed against its potential to introduce
  regressions
- No known bug may be left open without an explicit, time-bound plan
  to resolve it
- "It works on my machine" is not acceptable — reproduce in the target
  environment before closing

### Defensive Error Handling
- Handle all error paths explicitly — never swallow exceptions silently
- Show user-friendly error messages, not stack traces
- Provide actionable next steps when errors occur
- Log detailed errors server-side with sufficient context for debugging
  (timestamp, request ID, stack trace, input state)
- Validate input early with clear feedback — fail fast, fail loud
- Use typed errors and discriminated unions over generic error strings
  where the language supports it
- Network calls, file I/O, and external service calls MUST have
  explicit error handling — never assume success

### Code Quality Gates
- All code MUST pass linting and type-checking with zero warnings
  before commit
- No `any` types, `// @ts-ignore`, `eslint-disable`, or equivalent
  suppression without a documented justification in the same line
- Build MUST complete with zero errors and zero warnings
- Dead code, unused imports, and unreachable branches MUST be removed,
  not suppressed
- Functions exceeding 50 lines or cyclomatic complexity > 10 MUST be
  refactored or explicitly justified

## Testing Standards

### Rigorous Testing
- Write tests for business logic, edge cases, and integration points
- Don't test framework behavior or trivial getters/setters
- Integration tests must use real dependencies (no database mocks)
- UI changes require manual testing in browser before completion
- Every bug fix MUST include a regression test that reproduces the
  original failure

### Test Reliability
- Tests must be deterministic — no flaky tests allowed
- Use fixed test data, not random generation
- Clean up test state between runs
- Tests should fail clearly with actionable error messages

### Coverage Goals
- Critical paths: 100% coverage
- Business logic: 80%+ coverage
- UI components: test user interactions and state changes
- Don't chase coverage metrics at the expense of meaningful tests

## User Experience Consistency

### Interaction Patterns
- Maintain consistent navigation patterns across the application
- Use established UI patterns — don't reinvent common interactions
- Provide immediate feedback for user actions
- Handle loading and error states gracefully

### Accessibility Requirements
- Semantic HTML with proper heading hierarchy
- Keyboard navigation for all interactive elements
- ARIA labels where semantic HTML isn't sufficient
- Sufficient color contrast (WCAG AA minimum)
- Never claim full WCAG compliance without manual testing

## Performance Requirements

### Response Time Targets
- Page load: < 2 seconds on 3G
- API responses: < 200ms for reads, < 500ms for writes
- UI interactions: < 100ms perceived response time
- Time to interactive: < 3 seconds

### Resource Efficiency
- Lazy load non-critical resources
- Optimize images and assets before deployment
- Minimize bundle size — audit dependencies regularly
- Use pagination for large data sets

### Static Analysis & Type Safety
- Enable strict mode in TypeScript (`strict: true`) or equivalent
  strictness in other languages
- Run static analysis on every commit (CI gate)
- Treat compiler/type-checker warnings as errors in CI

### Monitoring
- Track Core Web Vitals (LCP, FID, CLS)
- Monitor API endpoint latency
- Set up alerts for performance regressions
- Profile before optimizing — measure, don't guess

## Development Workflow

### Code Changes
- Keep changes focused — one logical change per commit
- Write clear commit messages explaining WHY
- Review your own diff before requesting review
- Fix linting and type errors before committing
- Run the full test suite locally before pushing

### Pull Requests
- PRs should be reviewable in < 30 minutes
- Include context: what changed and why
- Add screenshots for UI changes
- Ensure CI passes before requesting review
- PRs with failing tests MUST NOT be merged

### Deployment Safety
- Never force push to main/master
- Never skip hooks or bypass CI checks
- Verify changes in staging before production
- Have rollback plan for risky changes

## When to Break These Rules

These principles are strong defaults, not absolute laws. Break them when:
- The alternative is clearly worse for users
- You have specific evidence the rule doesn't apply
- The cost of following the rule exceeds the benefit

When breaking a rule, document WHY in the PR description.
