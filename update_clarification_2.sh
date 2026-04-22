#!/bin/bash
SPEC_FILE=".specify/specs/005-fix-salawat-ui-and-mobile-notifications/spec.md"

# Add the second clarification
sed -i '/### Session 2026-04-22/a\
- Q: Should users control notification sounds? → A: Always play sound, no mute option' "$SPEC_FILE"

# Update Functional Requirements to reflect this
sed -i '/FR-006:/a\
- **FR-013**: System MUST always play sound with push notifications (no mute option)' "$SPEC_FILE"

echo "Updated spec with notification sound clarification"
