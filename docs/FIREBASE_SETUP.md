# Firebase setup

Timezy uses React Native Firebase (native Android/iOS SDKs), Firebase Authentication, and Cloud Firestore. This is a bare React Native CLI app; do not use Expo Go.

## Project and app registrations

- Firebase project: `timezy-9a5f8`
- Android application ID: `com.timezy`
- iOS bundle ID: `com.timezy`
- Firestore database: default database in Jakarta (`asia-southeast2`)
- Task documents: `users/{uid}/tasks/{taskId}`

The Android and iOS apps have been registered and their Firebase client config files are in `android/app/google-services.json` and `ios/Timezy/GoogleService-Info.plist`. The Android debug SHA-1 is registered. These config files contain public app identifiers, not service-account credentials; never add a service-account private key to the app or repository.

## Finish cloud provisioning

The Firebase CLI account can register apps, but the Firestore API is currently disabled for this Cloud project. Enable [Cloud Firestore API](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=timezy-9a5f8). After it is enabled and has propagated, create the default database:

```powershell
npx --yes firebase-tools@latest firestore:databases:create "(default)" --location asia-southeast2 --edition standard --delete-protection ENABLED --project timezy-9a5f8
```

Then deploy the owner-scoped security rules from this repository:

```powershell
npx --yes firebase-tools@latest deploy --only firestore:rules --project timezy-9a5f8
```

The database region is permanent once created. Jakarta was selected for this project; do not create a second database in another region unless you intentionally plan a data migration.

## Enable sign-in providers

In Firebase Console → Authentication → Sign-in method, enable:

1. Email/Password.
2. Google, and choose the project support email.

Google sign-in needs OAuth configuration. The debug SHA-1 is already registered for the Android app. Before release, also register the release signing certificate and the Play App Signing SHA-1. For iOS, the Google OAuth client must use bundle ID `com.timezy`, and its `REVERSED_CLIENT_ID` must be added as a URL scheme in the iOS app target.

After enabling Google, refresh the native config files so they contain OAuth client metadata:

```powershell
npx --yes firebase-tools@latest apps:sdkconfig ANDROID 1:929177088793:android:647eb5b6168155a1410b88 --out android/app/google-services.json
npx --yes firebase-tools@latest apps:sdkconfig IOS 1:929177088793:ios:1a294f3c628bfc3e410b88 --out ios/Timezy/GoogleService-Info.plist
```

For iOS, copy the `REVERSED_CLIENT_ID` value from the refreshed plist into `CFBundleURLTypes` in `ios/Timezy/Info.plist`. iOS native builds and CocoaPods must be run on macOS with Xcode.

## Data safety and migration

- Firestore rules allow each signed-in user to read and write only `users/{their uid}/tasks`.
- On the first sign-in on an installation, Timezy copies existing local tasks into that account. Cloud documents with the same IDs are left unchanged, so a retry cannot overwrite a newer cloud task.
- The migration marker is written before import starts and marked complete only after all documents finish importing. If import fails, the same account can retry; local tasks are never deleted by the migration.
- A different account on the same installation will not inherit the first account's legacy local task list.
- Firestore's native mobile SDK keeps a local cache and applies queued writes when connectivity returns. Account sign-in and the initial legacy import require network access.
