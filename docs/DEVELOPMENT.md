# Development setup — Timezy

## Implemented stack

- React Native Community CLI **0.88.0**, bare native Android/iOS projects, TypeScript.
- React Navigation 7 (native stack and bottom tabs).
- AsyncStorage 3 using a scoped on-device store named `timezy`.
- Jest for domain/repository tests.
- Android application id: `com.timezy`.

The Android template currently targets SDK 37, Build Tools 37.0.0, and NDK `27.1.12297006`; it uses JDK 17 and the generated Gradle 9.4.1 wrapper. Install these from Android Studio SDK Manager or `sdkmanager` if they are not present. Do not auto-accept Android SDK license prompts unless you have reviewed and accepted them yourself.

## First install

```powershell
npm ci
```

Set SDK variables in the shell that will build the app (this does not permanently modify Windows environment settings):

```powershell
$env:ANDROID_HOME = 'D:\android'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
```

If Android Studio uses another SDK directory, set both variables to that directory instead. The checked workstation has SDK folders at `D:\android` and `%LOCALAPPDATA%\Android\Sdk`; `ANDROID_HOME` was not set in the inspected shell.

## Real Android device

1. Enable Developer options and USB debugging on the phone.
2. Connect by USB, unlock it, and authorize this computer at the device prompt.
3. Verify that `adb devices -l` shows the serial with status `device` (not `unauthorized`).
4. Start Metro in one terminal with `npm start`.
5. In another terminal run `npm run android -- --deviceId <serial>`.

This project’s initial workflow is real-device only; no emulator is required. At implementation time ADB showed no connected device, so build/install could not be smoke-tested on a phone.

## Build an APK

From PowerShell:

```powershell
$env:ANDROID_HOME = 'D:\android'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
Push-Location android
.\gradlew.bat :app:assembleDebug
Pop-Location
```

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

To build the release variant for local QA, run:

```powershell
Push-Location android
.\gradlew.bat :app:assembleRelease
Pop-Location
```

Release APK: `android/app/build/outputs/apk/release/app-release.apk`. The generated template currently signs this variant with the debug signing configuration. It is suitable only for local QA—not Play Store distribution or production rollout. Configure a private release keystore separately before distribution.

## Quality checks

```powershell
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Tests cover local date keys and arithmetic, task validation/sort/filter/progress, and repository read/write/error/concurrency behavior. Keep dates as local `YYYY-MM-DD` keys; do not parse those strings directly with `new Date(dateKey)`.

## iOS

The generated `ios/` project and shared React Native screens are included. To install pods and build the native iOS app, use a Mac with Xcode and CocoaPods. This Windows host cannot verify an iOS binary.

## Storage and error behavior

Tasks live in AsyncStorage key `timezy.tasks.v1`, under schema version 1. Repository reads and writes are serialized. If saved JSON is malformed or has an unsupported version, the app reports that saved data was left untouched and does not replace it with an empty list. A failed write keeps the current in-memory list unchanged and reports the error.

No credentials, cloud service, or network API are used by the MVP.

## Dependency audit note

The production dependency tree reported high-severity advisories during `npm audit --omit=dev`. The suggested automatic remediation included a React Native downgrade, so `npm audit fix` was not applied blindly. Review current advisories and plan a compatible React Native/Metro upgrade before release; rerun the audit after dependency changes.
