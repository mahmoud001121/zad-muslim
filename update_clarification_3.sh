#!/bin/bash
SPEC_FILE=".specify/specs/005-fix-salawat-ui-and-mobile-notifications/spec.md"

# Add the third clarification
sed -i '/### Session 2026-04-22/a\
- Q: How should the floating button be positioned on mobile? → A: Adapt position based on device safe areas' "$SPEC_FILE"

# Update Functional Requirements to reflect this
sed -i '/FR-009:/a\
- **FR-014**: System MUST position floating button using device safe area insets (notch/status bar aware)' "$SPEC_FILE"

echo "Updated spec with floating button positioning clarification"
