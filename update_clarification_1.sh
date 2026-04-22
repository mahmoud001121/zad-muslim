#!/bin/bash
SPEC_FILE=".specify/specs/005-fix-salawat-ui-and-mobile-notifications/spec.md"

# Create Clarifications section if it doesn't exist
if ! grep -q "## Clarifications" "$SPEC_FILE"; then
  # Find the line after the first ## section (usually after User Scenarios)
  LINE_NUM=$(grep -n "## " "$SPEC_FILE" | head -2 | tail -1 | cut -d: -f1)
  sed -i "${LINE_NUM}a\\
\\
## Clarifications\\
\\
### Session 2026-04-22\\
" "$SPEC_FILE"
fi

# Add the clarification
sed -i '/### Session 2026-04-22/a\
- Q: Which mobile platforms should be supported for notifications? → A: Support both iOS Safari (as PWA) and Android Chrome with graceful degradation' "$SPEC_FILE"

# Update Assumptions section to reflect this
sed -i '/## Assumptions/a\
- iOS Safari users must add app to home screen as PWA for notifications to work\
- Android Chrome supports standard push API without PWA requirement\
- Other mobile browsers will gracefully degrade (show notification settings but no push)' "$SPEC_FILE"

echo "Updated spec with mobile platform clarification"
