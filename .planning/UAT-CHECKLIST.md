# TTS-JS Manual UAT Checklist

## Instructions

Test on a **published post** with the TTS block on the live site: **chapter42.com**

### Prerequisites

- Article with **500+ words** of Dutch text (for standard tests)
- Article with **2000+ words** of Dutch text (for long article test)
- Browser dev tools open (Console tab) for console error checks
- Each browser section takes approximately **30 minutes** to complete

### Debug Mode

Append `?tts-debug=1` to any article URL for detailed console output. All debug logs are prefixed with `[TTS-JS]` and show voice resolution, chunk splitting, and state transitions.

---

## Browser Test Sections

### 1. Chrome Desktop

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Press play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Press play, wait 5s, press pause, wait 3s, press play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Press play, click speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Press play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Open dev tools console, play article | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping (Chrome chunking works) | [ ] |

**Chrome-specific notes:** Chrome has a known 15s speech cutoff bug. The chunking workaround should prevent this. Pay extra attention to test 7.

---

### 2. Safari Desktop (macOS)

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Press play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Press play, wait 5s, press pause, wait 3s, press play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Press play, click speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Press play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Open dev tools console, play article | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Safari-specific notes:** Voice list may load asynchronously (onvoiceschanged). If player shows "loading" briefly before play, that is expected behavior.

---

### 3. Firefox Desktop

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Press play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Press play, wait 5s, press pause, wait 3s, press play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Press play, click speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Press play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Open dev tools console, play article | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Firefox-specific notes:** Firefox uses OS speech engine. Dutch voice availability depends on OS configuration. If no Dutch voice is available, player should show an appropriate message.

---

### 4. Edge Desktop

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Press play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Press play, wait 5s, press pause, wait 3s, press play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Press play, click speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Press play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Open dev tools console, play article | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping (same Chromium engine as Chrome) | [ ] |

**Edge-specific notes:** Edge uses the same Chromium engine as Chrome. Behavior should be very similar. Microsoft NL voices are typically available.

---

### 5. Chrome Android

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Tap play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Tap play, wait 5s, tap pause, wait 3s, tap play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Tap play, tap speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Tap play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Connect remote debugger, tap play | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Chrome Android notes:** Requires user gesture (tap) to start speech. Uses device-installed voices. Pause uses chunk-boundary mechanism (not speechSynthesis.pause()).

---

### 6. Safari iOS (iPhone)

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Tap play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Tap play, wait 5s, tap pause, wait 3s, tap play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Tap play, tap speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Tap play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Connect Safari Web Inspector, tap play | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Safari iOS notes:** Silent/mute switch will prevent audio -- ensure it is OFF. Speech stops if Safari goes to background. Dutch voice availability is limited on iOS. Check that player does not silently fail.

---

### 7. Firefox Android

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Tap play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Tap play, wait 5s, tap pause, wait 3s, tap play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Tap play, tap speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Tap play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Connect remote debugger, tap play | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Firefox Android notes:** Uses Android OS speech engine. Voice availability depends on device configuration. If no Dutch voice found, expect appropriate error message.

---

### 8. Samsung Internet

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Tap play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Tap play, wait 5s, tap pause, wait 3s, tap play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Tap play, tap speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Tap play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Connect remote debugger, tap play | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Samsung Internet notes:** Chromium-based. Uses Samsung TTS or Google TTS engine depending on device settings. Behavior should be similar to Chrome Android.

---

### 9. Safari iPad

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Play from start to finish | Tap play, wait for article to complete | Audio plays entire article, player returns to idle state | [ ] |
| 2 | Pause and resume | Tap play, wait 5s, tap pause, wait 3s, tap play | Audio pauses and resumes from same position | [ ] |
| 3 | Speed popup change | Tap play, tap speed button, select different speed | Speed popup appears, selection changes speed, next chunk uses new speed | [ ] |
| 4 | Progress bar movement | Tap play, observe progress bar | Bar fills left-to-right proportional to chunks played | [ ] |
| 5 | Duration display | Before play: check duration shown. During play: check remaining | Shows "~N min" before play, "~N min resterend" during play | [ ] |
| 6 | No console errors | Connect Safari Web Inspector, tap play | No JS errors in console (warnings OK) | [ ] |
| 7 | Long article no cutoff | Test on article with 2000+ words | Plays past 15 seconds without stopping | [ ] |

**Safari iPad notes:** Same WebKit engine as Safari iOS. Larger screen may affect player layout -- verify player looks correct on iPad viewport. Same silent switch caveat as iPhone.

---

## Edge Case Tests (Test Once, Any Browser)

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 8 | No Speech API | Disable speechSynthesis (or use browser without it) | Player shows friendly error message, no broken UI | [ ] |
| 9 | No Dutch voice | Test with language set to rare language (e.g., zu-ZA) | Player shows "no voice available" message | [ ] |
| 10 | Debug mode | Append `?tts-debug=1` to URL, play article | Console shows `[TTS-JS]` prefixed logs for state, voice, chunks | [ ] |
| 11 | Mobile gesture | On mobile, check that first play starts from user tap | Audio starts without silent failure | [ ] |

---

## Results Summary

| Browser | Tester | Date | Tests Passed | Overall | Notes |
|---------|--------|------|--------------|---------|-------|
| Chrome Desktop | | | /7 | [ ] PASS [ ] FAIL | |
| Safari Desktop (macOS) | | | /7 | [ ] PASS [ ] FAIL | |
| Firefox Desktop | | | /7 | [ ] PASS [ ] FAIL | |
| Edge Desktop | | | /7 | [ ] PASS [ ] FAIL | |
| Chrome Android | | | /7 | [ ] PASS [ ] FAIL | |
| Safari iOS (iPhone) | | | /7 | [ ] PASS [ ] FAIL | |
| Firefox Android | | | /7 | [ ] PASS [ ] FAIL | |
| Samsung Internet | | | /7 | [ ] PASS [ ] FAIL | |
| Safari iPad | | | /7 | [ ] PASS [ ] FAIL | |
| Edge Cases | | | /4 | [ ] PASS [ ] FAIL | |

**Date tested:** _______________
**Tester name:** _______________
**Overall result:** [ ] ALL PASS  [ ] ISSUES FOUND

**Issues found:**

1. _
2. _
3. _
