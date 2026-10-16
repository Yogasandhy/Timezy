# Timezy

Timezy is a personal, offline-first task planner for Android and iOS. It is a **bare React Native CLI + TypeScript** app; it does not use Expo. The MVP follows the selected **Quiet Steps** logo direction and a calm cream/green soft-neumorphic visual system.

## What works

- Today dashboard with local-date task counts, completion progress, and an empty state.
- Weekly calendar with date selection and tasks for the selected day.
- All Tasks view with status and priority filters.
- Create, edit, complete/reopen, and delete tasks (with confirmation).
- Optional notes, time, priority, and category.
- Versioned on-device persistence through AsyncStorage; no account or network required.
- English UI with accessible labels and large, clear touch controls.

## Run on a real Android phone

Prerequisites: Node.js `>=22.11`, JDK 17, Android SDK Platform 37, Build Tools 37.0.0, NDK `27.1.12297006`, USB debugging enabled on the phone, and the device authorized on this computer. The current workstation has Node 22.13.1 and JDK 17; see [development setup](docs/DEVELOPMENT.md) for SDK setup.

```powershell
npm ci
npm start
```

In a second PowerShell window, set the SDK location for that shell and confirm the real device appears with status `device`:

```powershell
$env:ANDROID_HOME = 'D:\android'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
adb devices -l
npm run android -- --deviceId <your-adb-serial>
```

Do not start an emulator for this project’s real-device workflow. If ADB shows `unauthorized`, unlock the phone and accept its USB debugging prompt.

## Checks and Android build

```powershell
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Build a debug APK from the `android` directory:

```powershell
$env:ANDROID_HOME = 'D:\android'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
.\gradlew.bat :app:assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. iOS source is included, but native iOS builds and signing require macOS/Xcode.

For an Android release-variant QA build, run `:app:assembleRelease` from `android/`; output is `android/app/build/outputs/apk/release/app-release.apk`. The current template uses debug signing for that APK, so it is not a Play Store/production artifact. Real-device install, launch, and restart-persistence checks remain pending until an authorized phone is visible to ADB.

## Project layout

```text
src/
  app/                         bootstrap and navigation
  features/tasks/
    domain/                    task model, local dates, filters, summary
    data/                      versioned AsyncStorage repository
    state/                     task provider
    screens/                   Today, Calendar, Tasks, task form
  shared/                      UI components and design tokens
android/                       native Android application
ios/                           native iOS application
docs/                          PRD, specs, setup, architecture, plan
assets/quiet-steps.svg         selected C logo
```

The repository boundary keeps persistence replaceable; cloud sync, accounts, reminders, recurrence, and team features are intentionally out of the MVP.

## Product and implementation docs

- [PRD](docs/PRD.md)
- [UI specification](docs/UI_SPEC.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Developer setup and device testing](docs/DEVELOPMENT.md)
- [Logo brief and selected concept](docs/LOGO_BRIEF.md)
- [Selected logo asset](assets/quiet-steps.svg)
- [MVP backlog](docs/BACKLOG.md)
