# Timezy bare React Native MVP — implementation plan

## Goal and scope

Ship a runnable, offline-first task-management MVP in this workspace using bare React Native Community CLI + TypeScript (no Expo). Use the approved “Quiet Steps” concept C with the existing cream/dark-green soft-neumorphic UI direction. Keep the existing PRD, architecture, UI spec, and logo brief; update README/setup docs to match the implemented project.

Acceptance: users can create, edit, complete/uncomplete, delete with confirmation, and filter tasks; Today and Calendar derive correct local-date summaries/lists; tasks persist through AsyncStorage and app restart; domain logic and repository behavior have tests; Android debug APK builds. Install/run on a physical phone only if ADB reports an authorized real device. Do not use an emulator. iOS source stays cross-platform but local iOS build is not possible on Windows.

Non-goals: accounts, cloud sync, reminders, recurring tasks, collaboration, Redux, charting, production release signing/store publication, emulator setup, and Expo.

## Architecture and stack

- Generated native Android/iOS project from the current React Native Community CLI template, TypeScript.
- React Navigation native stack + bottom tabs for Today / Calendar / Tasks / task form.
- Task feature split into domain (types, local-date helpers, validation, selectors), data (versioned serialized repository), state (Context/reducer), reusable components, screens.
- AsyncStorage is accessed only by the repository. Screens consume one provider so CRUD and summary changes remain consistent.
- UI uses existing tokens from `docs/UI_SPEC.md`; choose readable contrast and solid green primary actions over low-contrast neumorphic controls.
- Keep logo concept C as a simple dark-green vector asset and use its silhouette in the app’s header/welcome surface.

## Execution tasks

1. Scaffold bare React Native at the project root without overwriting existing docs/assets. Inspect template package scripts and generated Android requirements; record actual versions. Verify Android SDK/JDK paths using process-local environment for builds only.
2. Add the failing domain tests first: task title normalization/validation, local `YYYY-MM-DD` generation and date arithmetic (no UTC parse shift), date/time sort, status and priority filters, completion summary. Implement the smallest domain modules to pass.
3. Add repository contract tests using a fake key-value adapter: empty load, create/update/toggle/delete, versioned JSON round-trip, malformed payload behavior, serialized writes, storage failures. Implement repository + provider/reducer and preserve readable error/retry behavior.
4. Add navigation and screen flows: first-run welcome dismissal, Today dashboard/progress/empty state, weekly Calendar selection and date-scoped tasks, Tasks filters, create/edit form with date/time/priority/category/notes, completion control, delete confirmation. Add component tests for validation and the primary actions where the template test stack supports them.
5. Apply Quiet Steps branding and UI tokens; make touch targets/accessibility labels/status text clear; check keyboard/scrolling and small-screen layout. Avoid extra native packages where platform controls or simple React Native UI suffice.
6. Validate: run lint/typecheck/tests, Android debug and release Gradle builds, and produce APKs. If a physical device is attached and authorized, install/launch with its serial and smoke-test persistence. Otherwise document the remaining device check. Do not use emulator.
7. Refresh README and developer setup notes with verified commands/versions, add the selected logo asset to app assets, and prepare an Archify user-flow diagram grounded in the approved product docs.
8. On explicit follow-up, initialize Git, attach the supplied GitHub remote, and create focused commits. Push only after GitHub authentication is available.

## TDD and verification detail

Each domain/repository behavior starts with a focused failing test, then the implementation is added, then the focused test and full test suite are rerun. After each cross-layer slice, run TypeScript checks and the relevant React Native test. Finish with the Android debug build and (if available) a real-device smoke test. Record any environment limitation truthfully; a generated APK alone is not a physical-device test.

## Environment constraints known at planning time

- Node 22.13.1 and npm 10.7.0 are available; JDK 17 is available.
- Android SDK folders exist at `D:\android` and under the user profile; `ANDROID_HOME` is not currently set in this shell. Use the SDK path supported by the generated template and valid installed packages.
- `adb devices -l` currently reports no connected device. Do not start an emulator. This can block install/launch verification, not a Gradle APK build.
- The workspace initially had no Git repository. The user later explicitly requested GitHub setup and detailed commits; the project is initialized on `main`, connected to the provided `origin`, and the commit history was pushed successfully.
- Building iOS native code requires macOS/Xcode; this Windows host can only preserve the iOS project/source for later verification.

## Outcome

- TypeScript, lint, and 16 tests across 5 suites pass.
- Android debug and release APK builds succeed. Release is signed with the debug key for local QA only.
- ADB lists no connected phone; no emulator was started, so physical install/launch/restart checks remain open.
- Archify workflow source passes layout validation, but secure HTML artifact publication is blocked by a Windows file metadata mismatch; no rendered HTML is claimed as delivered.
- Git remote setup and push are complete; `main` tracks `origin/main`.
