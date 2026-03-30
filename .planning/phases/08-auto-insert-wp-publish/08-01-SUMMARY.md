---
phase: 08-auto-insert-wp-publish
plan: 01
subsystem: settings
tags: [wordpress-settings-api, block-templates, auto-insert, admin-ui]

# Dependency graph
requires:
  - phase: 01-block-core-speech
    provides: "register_block_type in tts-js.php, block registration"
provides:
  - "Settings page at Settings > TTS Player with auto-insert toggle"
  - "Conditional block template registration for post type"
  - "tts_js_auto_insert option in wp_options"
affects: [08-auto-insert-wp-publish]

# Tech tracking
tech-stack:
  added: []
  patterns: ["WordPress Settings API (register_setting + add_options_page)", "Block template via $post_type_object->template"]

key-files:
  created: []
  modified: ["tts-js/tts-js.php"]

key-decisions:
  - "Used array_unshift to merge with existing template instead of overwriting (defensive against other plugins/themes)"
  - "Used rest_sanitize_boolean as sanitize_callback for boolean option"

patterns-established:
  - "Settings API pattern: register on admin_init, menu on admin_menu, template on init"
  - "Capability check (manage_options) at top of render callback"

requirements-completed: [UX-02]

# Metrics
duration: 1min
completed: 2026-03-30
---

# Phase 8 Plan 1: Auto-Insert Settings Summary

**WordPress Settings API page with auto-insert toggle and conditional block template registration for automatic TTS player placement in new posts**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-30T14:19:00Z
- **Completed:** 2026-03-30T14:20:02Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Settings page at Settings > TTS Player with single auto-insert checkbox toggle
- Conditional block template registration that prepends tts-js/player to new posts when enabled
- Defensive template merging with existing post type templates via array_unshift
- All output properly escaped (esc_html, esc_html_e, checked, esc_attr)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add settings page and block template registration** - `a08fa2e` (feat)

## Files Created/Modified
- `tts-js/tts-js.php` - Added 3 functions: tts_js_register_settings (admin_init), tts_js_add_settings_page + tts_js_render_settings_page (admin_menu), tts_js_register_post_template (init)

## Decisions Made
- Used `array_unshift` to merge TTS block with any existing post type template rather than overwriting -- prevents conflicts with other plugins/themes (addresses Research Pitfall 1)
- Used `rest_sanitize_boolean` (WordPress built-in) for checkbox sanitization per research recommendation
- Added description text below checkbox for clarity on what the toggle does

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Settings infrastructure ready for Phase 08 Plan 02 (voice diagnostics) and Plan 03 (WP.org readiness)
- Auto-insert option stored in wp_options, accessible via get_option() throughout plugin

---
*Phase: 08-auto-insert-wp-publish*
*Completed: 2026-03-30*
